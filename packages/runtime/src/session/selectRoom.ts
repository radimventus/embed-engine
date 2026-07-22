import type { HousePackage } from "@embed-engine/object-house";

import { freezeDecisionSession, type DecisionSession } from "./DecisionSession";
import type { RoomId } from "./DecisionEvent";
import {
  projectDecisionSession,
  type SessionExperience,
} from "./projectDecisionSession";

export type SelectRoomSuccess = {
  readonly ok: true;
  readonly session: DecisionSession;
  readonly experience: SessionExperience;
};

export type SelectRoomFailure = {
  readonly ok: false;
  readonly code:
    | "HP_OBJECT_MISMATCH"
    | "HP_UNKNOWN_ROOM"
    | "HP_PROJECTION_FAILED";
  readonly message: string;
};

export type SelectRoomResult = SelectRoomSuccess | SelectRoomFailure;

export type SelectRoomInput = {
  readonly session: DecisionSession;
  readonly housePackage: HousePackage;
  readonly roomId: RoomId;
  readonly now?: number;
};

/**
 * Semantic room selection (ADR-013).
 * Validates → mutates SessionRuntimeState → appends RoomSelected → projects Experience.
 */
export function selectRoom(input: SelectRoomInput): SelectRoomResult {
  const { session, housePackage, roomId } = input;
  const now = input.now ?? Date.now();

  if (housePackage.identity.id !== session.objectId) {
    return {
      ok: false,
      code: "HP_OBJECT_MISMATCH",
      message: `HousePackage id "${housePackage.identity.id}" does not match session objectId "${session.objectId}".`,
    };
  }

  const room = housePackage.rooms.find((candidate) => candidate.id === roomId);
  if (room === undefined) {
    return {
      ok: false,
      code: "HP_UNKNOWN_ROOM",
      message: `RoomId "${roomId}" is not in the Object Package Room Registry.`,
    };
  }

  const nextSession = freezeDecisionSession({
    objectId: session.objectId,
    runtimeState: {
      activeRoomId: roomId,
      version: session.runtimeState.version + 1,
    },
    events: [
      ...session.events,
      {
        type: "RoomSelected",
        roomId,
        at: now,
      },
    ],
    createdAt: session.createdAt,
    updatedAt: now,
  });

  const projected = projectDecisionSession(nextSession, housePackage);
  if (!projected.ok) {
    return {
      ok: false,
      code: "HP_PROJECTION_FAILED",
      message: projected.message,
    };
  }

  return {
    ok: true,
    session: nextSession,
    experience: projected.experience,
  };
}
