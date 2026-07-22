import type {
  ExperienceHouse,
  ExperienceHouseRoom,
} from "@embed-engine/model";
import type { HousePackage } from "@embed-engine/object-house";
import { projectHouse } from "@embed-engine/object-house";

import type { DecisionSession } from "./DecisionSession";

/**
 * Experience projection for an active Decision Session.
 * Derived only from HousePackage + session Runtime State — never UI state.
 */
export type SessionExperience = {
  readonly house: ExperienceHouse;
  readonly activeRoomId: string | null;
  readonly activeRoom: ExperienceHouseRoom | null;
};

export type ProjectSessionResult =
  | { readonly ok: true; readonly experience: SessionExperience }
  | {
      readonly ok: false;
      readonly code: "HP_OBJECT_MISMATCH" | "HP_MISSING_HOUSE";
      readonly message: string;
    };

/**
 * projectHouse() path constrained by active Decision Session Runtime State.
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

  const house = projectHouse(housePackage);
  if (house === null) {
    return {
      ok: false,
      code: "HP_MISSING_HOUSE",
      message: "projectHouse returned null.",
    };
  }

  const activeRoomId = session.runtimeState.activeRoomId;
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
    }),
  };
}
