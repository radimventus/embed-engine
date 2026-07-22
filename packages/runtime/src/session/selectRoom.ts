import type { HousePackage } from "@embed-engine/object-house";

import type { DecisionSession } from "./DecisionSession";
import type { RoomId } from "./DecisionEvent";
import type { SessionExperience } from "./projectDecisionSession";
import { dispatchCommand } from "./pipeline/dispatch";
import type { PipelineErrorCode } from "./pipeline/validateCommand";

export type SelectRoomSuccess = {
  readonly ok: true;
  readonly session: DecisionSession;
  readonly experience: SessionExperience;
};

export type SelectRoomFailure = {
  readonly ok: false;
  readonly code: PipelineErrorCode;
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
 * Compatibility façade — routes through the canonical Event Pipeline.
 * Prefer DecisionSessionRuntime.dispatch({ type: "SelectRoom", roomId }).
 */
export function selectRoom(input: SelectRoomInput): SelectRoomResult {
  const result = dispatchCommand({
    session: input.session,
    housePackage: input.housePackage,
    command: { type: "SelectRoom", roomId: input.roomId },
    now: input.now,
  });

  if (!result.ok) {
    const error = result.errors[0];
    return {
      ok: false,
      code: error?.code ?? "HP_UNKNOWN_COMMAND",
      message: error?.message ?? "SelectRoom command failed.",
    };
  }

  return {
    ok: true,
    session: result.session,
    experience: result.experience,
  };
}
