import type {
  ExperienceHouse,
  ExperienceHouseRoom,
} from "@embed-engine/model";
import type { HousePackage } from "@embed-engine/object-house";
import { projectHouse } from "@embed-engine/object-house";

import type { DecisionSession } from "./DecisionSession";
import {
  interpretDecisionSession,
  type SessionInterpretation,
} from "./pipeline/interpretSession";

/**
 * Experience projection for an active Decision Session.
 * Derived from Interpretation (+ Object Package) — never UI state, never mutates Runtime.
 */
export type SessionExperience = {
  readonly house: ExperienceHouse;
  readonly activeRoomId: string | null;
  readonly activeRoom: ExperienceHouseRoom | null;
  readonly priorityIds: readonly string[];
  readonly variantId: string | null;
  readonly scenarioId: string | null;
  readonly interpretationSummary: string;
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
 * MUST NOT mutate Runtime.
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

  return {
    ok: true,
    experience: Object.freeze({
      house,
      activeRoomId,
      activeRoom,
      priorityIds: interpretation.priorityIds,
      variantId: interpretation.variantId,
      scenarioId: interpretation.scenarioId,
      interpretationSummary: interpretation.summary,
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
): ProjectSessionResult {
  if (housePackage.identity.id !== session.objectId) {
    return {
      ok: false,
      code: "HP_OBJECT_MISMATCH",
      message: `HousePackage id "${housePackage.identity.id}" does not match session objectId "${session.objectId}".`,
    };
  }

  const interpretation = interpretDecisionSession(session, housePackage);
  return projectFromInterpretation(interpretation, housePackage);
}
