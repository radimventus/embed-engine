import type {
  ExperienceHouse,
} from "@embed-engine/model";
import type { HousePackage } from "@embed-engine/object-house";
import { projectHouse } from "@embed-engine/object-house";

import type { DecisionSession } from "./DecisionSession";
import {
  projectExperienceContext,
  type ExperienceContext,
} from "./ExperienceContext";
import type { InterpretationRuleset } from "./interpretation";
import {
  interpretDecisionSession,
  type SessionInterpretation,
} from "./pipeline/interpretSession";

/**
 * Canonical Experience projection for an active Decision Session (ED-DA-05).
 *
 * Flat duplicate fields (decisionStory, priorityIds, …) were removed —
 * all semantics live under `context`.
 *
 * Categories:
 * - `house` — Object Package / presentation projection
 * - `context` — Experience projection (navigation + decision semantics)
 */
export type SessionExperience = {
  readonly house: ExperienceHouse;
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
    priorityIntensities: interpretation.priorityIntensities,
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
    aiContext: interpretation.aiContext,
  });

  return {
    ok: true,
    experience: Object.freeze({
      house,
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
