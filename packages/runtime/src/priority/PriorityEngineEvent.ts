/**
 * Runtime event payloads for the Priority state engine.
 *
 * Event type names match Priority Domain / Runtime Contract vocabulary.
 * Payload shapes are Runtime-layer (domain PriorityJourneyEvent is type-only).
 *
 * TODO (ADR / DM-OQ-08): mapping these events to Cognitive Signals.
 * TODO (ADR / OQ-05): Transition auto-complete timing — not handled here.
 * TODO (ADR / OQ-06): multi-priority precedence — MVP assumes dominantPriorityId.
 */

import type {
  ConfirmationPresentationPayload,
  Experience,
  FollowUpHandoff,
  HouseMappingSet,
  Interpretation,
  PriorityJourneyEventType,
  PrioritySelection,
  TransitionMessage,
} from "@embed-engine/core/priority";

export type PriorityEngineEvent =
  | {
      readonly type: "priority.selection.changed";
      readonly selection: PrioritySelection;
    }
  | {
      readonly type: "priority.confirmation.accepted";
      readonly presentationPayload: ConfirmationPresentationPayload;
    }
  | {
      readonly type: "priority.confirmation.edit";
    }
  | {
      readonly type: "priority.transition.completed";
      readonly transitionMessage?: TransitionMessage;
    }
  | {
      readonly type: "priority.interpretation.ready";
      readonly interpretation: Interpretation;
      readonly experience: Experience;
    }
  | {
      readonly type: "priority.mapping.ready";
      readonly houseMapping: HouseMappingSet;
      readonly followUps: readonly FollowUpHandoff[];
    }
  | {
      readonly type: "priority.followup.selected";
      readonly targetId: string;
    }
  | {
      /**
       * Typically emitted by the engine on selection change.
       * External dispatch forces invalidation without changing Selection.
       */
      readonly type: "priority.context.invalidated";
    };

export type PriorityEngineEventType = PriorityEngineEvent["type"];

/** Ensures engine event types stay aligned with domain vocabulary. */
export type _AssertEngineEventsSubsetOfDomain = PriorityEngineEventType extends PriorityJourneyEventType
  ? true
  : never;
