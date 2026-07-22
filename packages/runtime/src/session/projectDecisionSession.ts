import type {
  ExperienceHouse,
  ExperienceHouseRoom,
} from "@embed-engine/model";
import type { HousePackage } from "@embed-engine/object-house";
import { projectHouse } from "@embed-engine/object-house";

import type { DecisionSession } from "./DecisionSession";
import type { DecisionFocus } from "./decision-focus";
import type { DecisionMoveSequence } from "./decision-moves";
import type { DecisionOutcome } from "./decision-outcome";
import type { DecisionStory } from "./decision-story";
import type { DecisionTerminal } from "./decision-terminal";
import {
  projectExperienceContext,
  type ExperienceContext,
} from "./ExperienceContext";
import type {
  FocusRoom,
  InterpretationRuleset,
  RecommendedMediaRef,
} from "./interpretation";
import type { PrioritySignal } from "./priority-signals";
import {
  interpretDecisionSession,
  type SessionInterpretation,
} from "./pipeline/interpretSession";

/**
 * Experience projection for an active Decision Session.
 * Derived from Interpretation (+ Object Package) — never UI state, never mutates Runtime.
 *
 * `context` is the canonical semantic contract for Experience modules.
 */
export type SessionExperience = {
  readonly house: ExperienceHouse;
  readonly activeRoomId: string | null;
  readonly activeRoom: ExperienceHouseRoom | null;
  readonly priorityIds: readonly string[];
  readonly prioritySignals: readonly PrioritySignal[];
  readonly variantId: string | null;
  readonly scenarioId: string | null;
  readonly interpretationSummary: string;
  /** Interpreted focus — may differ from activeRoom when no room is selected. */
  readonly focusRoom: FocusRoom | null;
  readonly primaryReason: string;
  readonly highlights: readonly string[];
  readonly recommendedMedia: readonly RecommendedMediaRef[];
  readonly roomImportanceRank: readonly string[];
  readonly appliedRuleIds: readonly string[];
  readonly rulesetId: string;
  readonly rulesetVersion: number;
  /** Canonical decision attention entry point (CAP-PRI-002). */
  readonly decisionFocus: DecisionFocus;
  /** Canonical semantic narrative (CAP-DST-001 / PT-004). */
  readonly decisionStory: DecisionStory;
  /** Ordered Moves derived solely from Decision Story (CAP-DST-002 / PT-005). */
  readonly decisionMoves: DecisionMoveSequence;
  /** Canonical Outcome derived solely from Decision Moves (CAP-OUT-001 / PT-008). */
  readonly decisionOutcome: DecisionOutcome;
  /** Completion surface wrapping Outcome (CAP-DTR-001 / PT-007). */
  readonly decisionTerminal: DecisionTerminal;
  /** Unified semantic view model — preferred module input. */
  readonly context: ExperienceContext;
};

export type ProjectSessionResult =
  | { readonly ok: true; readonly experience: SessionExperience }
  | {
      readonly ok: false;
      readonly code: "HP_OBJECT_MISMATCH" | "HP_MISSING_HOUSE";
      readonly message: string;
    };

/**
 * Projection step — consumes Interpretation (and house facts for ExperienceHouse).
 * MUST NOT mutate Runtime. MUST NOT re-evaluate rules.
 */
export function projectFromInterpretation(
  interpretation: SessionInterpretation,
  housePackage: HousePackage,
): ProjectSessionResult {
  if (housePackage.identity.id !== interpretation.objectId) {
    return {
      ok: false,
      code: "HP_OBJECT_MISMATCH",
      message: `HousePackage id "${housePackage.identity.id}" does not match interpretation objectId "${interpretation.objectId}".`,
    };
  }

  const house = projectHouse(housePackage);
  if (house === null) {
    return {
      ok: false,
      code: "HP_MISSING_HOUSE",
      message: "projectHouse returned null.",
    };
  }

  const activeRoomId = interpretation.activeRoomId;
  const activeRoom =
    activeRoomId === null
      ? null
      : (house.rooms.find((room) => room.id === activeRoomId) ?? null);

  const context = projectExperienceContext({
    house,
    activeRoomId,
    activeRoom,
    focusRoom: interpretation.focusRoom,
    priorityIds: interpretation.priorityIds,
    prioritySignals: interpretation.prioritySignals,
    variantId: interpretation.variantId,
    scenarioId: interpretation.scenarioId,
    primaryReason: interpretation.primaryReason,
    highlights: interpretation.highlights,
    recommendedMedia: interpretation.recommendedMedia,
    interpretationSummary: interpretation.summary,
    roomImportanceRank: interpretation.roomImportanceRank,
    appliedRuleIds: interpretation.appliedRuleIds,
    rulesetId: interpretation.rulesetId,
    rulesetVersion: interpretation.rulesetVersion,
    decisionFocus: interpretation.decisionFocus,
    decisionStory: interpretation.decisionStory,
    decisionMoves: interpretation.decisionMoves,
    decisionOutcome: interpretation.decisionOutcome,
    decisionTerminal: interpretation.decisionTerminal,
  });

  return {
    ok: true,
    experience: Object.freeze({
      house,
      activeRoomId,
      activeRoom,
      priorityIds: interpretation.priorityIds,
      prioritySignals: interpretation.prioritySignals,
      variantId: interpretation.variantId,
      scenarioId: interpretation.scenarioId,
      interpretationSummary: interpretation.summary,
      focusRoom: interpretation.focusRoom,
      primaryReason: interpretation.primaryReason,
      highlights: interpretation.highlights,
      recommendedMedia: interpretation.recommendedMedia,
      roomImportanceRank: interpretation.roomImportanceRank,
      appliedRuleIds: interpretation.appliedRuleIds,
      rulesetId: interpretation.rulesetId,
      rulesetVersion: interpretation.rulesetVersion,
      decisionFocus: interpretation.decisionFocus,
      decisionStory: interpretation.decisionStory,
      decisionMoves: interpretation.decisionMoves,
      decisionOutcome: interpretation.decisionOutcome,
      decisionTerminal: interpretation.decisionTerminal,
      context,
    }),
  };
}

/**
 * Convenience: interpret session then project (restore / read paths).
 * Command pipeline calls interpret + projectFromInterpretation explicitly.
 */
export function projectDecisionSession(
  session: DecisionSession,
  housePackage: HousePackage,
  rules?: InterpretationRuleset,
): ProjectSessionResult {
  if (housePackage.identity.id !== session.objectId) {
    return {
      ok: false,
      code: "HP_OBJECT_MISMATCH",
      message: `HousePackage id "${housePackage.identity.id}" does not match session objectId "${session.objectId}".`,
    };
  }

  const interpretation = interpretDecisionSession(session, housePackage, {
    rules,
  });
  return projectFromInterpretation(interpretation, housePackage);
}
