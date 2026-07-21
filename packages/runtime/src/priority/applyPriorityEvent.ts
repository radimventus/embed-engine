/**
 * Priority Experience Runtime state transitions.
 *
 * Implements Runtime Contract stage order, gates, invalidation, and events.
 * Does not compose Interpretation/Experience/House Mapping content.
 */

import type {
  Confirmation,
  PriorityJourneyEventType,
} from "@embed-engine/core/priority";
import {
  createInitialPriorityRuntimeState,
  isPriorityJourneyComplete,
} from "./createInitialPriorityRuntimeState";
import type { PriorityEngineEvent } from "./PriorityEngineEvent";
import {
  hasConfirmedSelection,
  hasExperience,
  hasHouseMapping,
  isSelectionNonEmpty,
} from "./guards";
import type { PriorityRuntimeState } from "./PriorityRuntimeState";
import type { PriorityTransitionError } from "./PriorityTransitionError";

export type ApplyPriorityEventSuccess = {
  readonly ok: true;
  readonly state: PriorityRuntimeState;
  readonly emitted: readonly PriorityJourneyEventType[];
};

export type ApplyPriorityEventFailure = {
  readonly ok: false;
  readonly state: PriorityRuntimeState;
  readonly error: PriorityTransitionError;
};

export type ApplyPriorityEventResult =
  | ApplyPriorityEventSuccess
  | ApplyPriorityEventFailure;

function fail(
  state: PriorityRuntimeState,
  event: PriorityEngineEvent["type"],
  code: PriorityTransitionError["code"],
  message: string,
): ApplyPriorityEventFailure {
  return {
    ok: false,
    state,
    error: {
      code,
      message,
      stage: state.stage,
      event,
    },
  };
}

function clearDerivedOutputs(): Pick<
  PriorityRuntimeState,
  | "confirmation"
  | "transitionMessage"
  | "interpretation"
  | "experience"
  | "houseMapping"
  | "followUps"
  | "completed"
> {
  return {
    confirmation: null,
    transitionMessage: null,
    interpretation: null,
    experience: null,
    houseMapping: null,
    followUps: null,
    completed: false,
  };
}

function invalidateDerived(
  state: PriorityRuntimeState,
  nextStage: PriorityRuntimeState["stage"],
  selection: PriorityRuntimeState["selection"],
): ApplyPriorityEventSuccess {
  return {
    ok: true,
    state: {
      ...state,
      ...clearDerivedOutputs(),
      stage: nextStage,
      selection,
    },
    emitted: ["priority.context.invalidated"],
  };
}

/**
 * Apply one Journey event. Pure function — no I/O, no Cognition, no UI.
 */
export function applyPriorityEvent(
  state: PriorityRuntimeState,
  event: PriorityEngineEvent,
): ApplyPriorityEventResult {
  if (isPriorityJourneyComplete(state) && event.type !== "priority.selection.changed") {
    return fail(
      state,
      event.type,
      "JOURNEY_ALREADY_COMPLETED",
      "Journey is complete; only selection change (new run) or reset is allowed",
    );
  }

  switch (event.type) {
    case "priority.selection.changed": {
      const selection = event.selection;
      const nextStage = isSelectionNonEmpty(selection)
        ? "Confirmation"
        : "Selection";

      // Runtime Contract §4.2 / §5.2: selection change invalidates prior outputs.
      return invalidateDerived(state, nextStage, selection);
    }

    case "priority.confirmation.edit": {
      if (state.stage !== "Confirmation" && state.stage !== "Transition") {
        return fail(
          state,
          event.type,
          "INVALID_TRANSITION",
          "confirmation.edit is only valid from Confirmation (or Transition before Interpretation)",
        );
      }

      return {
        ok: true,
        state: {
          ...state,
          ...clearDerivedOutputs(),
          stage: "Selection",
        },
        emitted: [],
      };
    }

    case "priority.confirmation.accepted": {
      if (state.stage !== "Confirmation") {
        return fail(
          state,
          event.type,
          "INVALID_TRANSITION",
          "confirmation.accepted requires Confirmation stage",
        );
      }

      if (!isSelectionNonEmpty(state.selection)) {
        return fail(
          state,
          event.type,
          "GUARD_FAILED",
          "confirmation.accepted requires a non-empty Priority Selection",
        );
      }

      const confirmation: Confirmation = {
        selectionSnapshot: state.selection,
        accepted: true,
        presentationPayload: event.presentationPayload,
      };

      return {
        ok: true,
        state: {
          ...state,
          confirmation,
          stage: "Transition",
          completed: false,
        },
        emitted: [],
      };
    }

    case "priority.transition.completed": {
      if (state.stage !== "Transition") {
        return fail(
          state,
          event.type,
          "INVALID_TRANSITION",
          "transition.completed requires Transition stage",
        );
      }

      if (!hasConfirmedSelection(state)) {
        return fail(
          state,
          event.type,
          "GUARD_FAILED",
          "transition.completed requires prior Confirmation",
        );
      }

      // TODO (ADR / OQ-05): no auto-timeout; completion is explicit via this event.
      return {
        ok: true,
        state: {
          ...state,
          transitionMessage: event.transitionMessage ?? state.transitionMessage,
          stage: "Interpretation",
        },
        emitted: [],
      };
    }

    case "priority.interpretation.ready": {
      if (state.stage !== "Interpretation") {
        return fail(
          state,
          event.type,
          "INVALID_TRANSITION",
          "interpretation.ready requires Interpretation stage",
        );
      }

      if (!hasConfirmedSelection(state)) {
        return fail(
          state,
          event.type,
          "GUARD_FAILED",
          "interpretation.ready must not fire before confirmation.accepted",
        );
      }

      // Engine stores artifacts only — does not compose meaning (Runtime Contract).
      return {
        ok: true,
        state: {
          ...state,
          interpretation: event.interpretation,
          experience: event.experience,
          houseMapping: null,
          followUps: null,
          stage: "Interpretation",
        },
        emitted: [],
      };
    }

    case "priority.mapping.ready": {
      if (state.stage !== "Interpretation" && state.stage !== "HouseMapping") {
        return fail(
          state,
          event.type,
          "INVALID_TRANSITION",
          "mapping.ready requires Interpretation (with Experience) or HouseMapping stage",
        );
      }

      if (!hasExperience(state)) {
        return fail(
          state,
          event.type,
          "GUARD_FAILED",
          "mapping.ready must not fire before interpretation.ready (Experience required)",
        );
      }

      if (event.houseMapping.entries.length === 0) {
        return fail(
          state,
          event.type,
          "GUARD_FAILED",
          "mapping.ready requires a non-empty House Mapping set",
        );
      }

      if (event.followUps.length === 0) {
        return fail(
          state,
          event.type,
          "GUARD_FAILED",
          "Follow-up requires at least one handoff when Mapping completes",
        );
      }

      // No House Mapping generation here — payload is accepted as given.
      return {
        ok: true,
        state: {
          ...state,
          houseMapping: event.houseMapping,
          followUps: event.followUps,
          stage: "HouseMapping",
        },
        emitted: [],
      };
    }

    case "priority.followup.selected": {
      if (state.stage !== "HouseMapping" && state.stage !== "FollowUp") {
        return fail(
          state,
          event.type,
          "INVALID_TRANSITION",
          "followup.selected requires HouseMapping or FollowUp stage",
        );
      }

      if (!hasHouseMapping(state)) {
        return fail(
          state,
          event.type,
          "GUARD_FAILED",
          "followup.selected requires House Mapping to be ready",
        );
      }

      const followUps = state.followUps ?? [];
      if (!followUps.some((item) => item.targetId === event.targetId)) {
        return fail(
          state,
          event.type,
          "GUARD_FAILED",
          "followup.selected targetId must be one of the exposed handoffs",
        );
      }

      // Forbidden: Follow-up shortcut from Transition — already gated by stage.
      return {
        ok: true,
        state: {
          ...state,
          stage: "FollowUp",
          completed: true,
        },
        emitted: [],
      };
    }

    case "priority.context.invalidated": {
      const nextStage = isSelectionNonEmpty(state.selection)
        ? "Confirmation"
        : "Selection";

      return invalidateDerived(state, nextStage, state.selection);
    }

    default: {
      const _exhaustive: never = event;
      return fail(
        state,
        (_exhaustive as PriorityEngineEvent).type,
        "INVALID_TRANSITION",
        "Unknown event",
      );
    }
  }
}

export function createPriorityRuntimeEngine(objectId: string) {
  let state = createInitialPriorityRuntimeState({ objectId });

  return {
    getState(): PriorityRuntimeState {
      return state;
    },
    isComplete(): boolean {
      return isPriorityJourneyComplete(state);
    },
    reset(): PriorityRuntimeState {
      state = createInitialPriorityRuntimeState(state.object);
      return state;
    },
    dispatch(event: PriorityEngineEvent): ApplyPriorityEventResult {
      const result = applyPriorityEvent(state, event);
      if (result.ok) {
        state = result.state;
      }
      return result;
    },
  };
}

export type PriorityRuntimeEngine = ReturnType<typeof createPriorityRuntimeEngine>;
