import type { HousePackage } from "@embed-engine/object-house";

import { createDecisionSession } from "./createDecisionSession";
import type { DecisionEvent } from "./DecisionEvent";
import type { DecisionSession } from "./DecisionSession";
import { applyDecisionEvent } from "./pipeline/applyEvent";

export type ReplaySessionResult =
  | { readonly ok: true; readonly session: DecisionSession }
  | {
      readonly ok: false;
      readonly code: string;
      readonly message: string;
      readonly index?: number;
    };

/**
 * Deterministic replay: empty session + ordered semantic events → Runtime State.
 * Mutations occur only via applyDecisionEvent (never via Commands).
 */
export function replayDecisionSession(input: {
  readonly housePackage: HousePackage;
  readonly events: readonly DecisionEvent[];
  readonly createdAt?: number;
}): ReplaySessionResult {
  const { housePackage, events } = input;
  const createdAt =
    input.createdAt ??
    (events[0] !== undefined ? events[0].at : Date.now());

  let session = createDecisionSession({
    housePackage,
    now: createdAt,
  });

  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    const checked = assertEventApplicable(session, housePackage, event);
    if (!checked.ok) {
      return {
        ok: false,
        code: checked.code,
        message: checked.message,
        index,
      };
    }
    session = applyDecisionEvent(session, event);
  }

  return { ok: true, session };
}

type CheckResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly code: string; readonly message: string };

function assertEventApplicable(
  session: DecisionSession,
  housePackage: HousePackage,
  event: DecisionEvent,
): CheckResult {
  if (housePackage.identity.id !== session.objectId) {
    return {
      ok: false,
      code: "HP_OBJECT_MISMATCH",
      message: `HousePackage id mismatch during replay.`,
    };
  }

  if (event.type === "RoomSelected") {
    const room = housePackage.rooms.find(
      (candidate) => candidate.id === event.roomId,
    );
    if (room === undefined) {
      return {
        ok: false,
        code: "HP_UNKNOWN_ROOM",
        message: `RoomId "${event.roomId}" is not in the Object Package Room Registry.`,
      };
    }
  }

  return { ok: true };
}
