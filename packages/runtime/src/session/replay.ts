import type { HousePackage } from "@embed-engine/object-house";

import { createDecisionSession } from "./createDecisionSession";
import type { DecisionEvent } from "./DecisionEvent";
import type { DecisionSession } from "./DecisionSession";
import { selectRoom } from "./selectRoom";
import { freezeDecisionSession } from "./DecisionSession";

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
 * Uses event timestamps so createdAt/updatedAt match the original timeline.
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
    const applied = applyDecisionEvent(session, housePackage, event);
    if (!applied.ok) {
      return {
        ok: false,
        code: applied.code,
        message: applied.message,
        index,
      };
    }
    session = applied.session;
  }

  return { ok: true, session };
}

type ApplyEventResult =
  | { readonly ok: true; readonly session: DecisionSession }
  | { readonly ok: false; readonly code: string; readonly message: string };

function applyDecisionEvent(
  session: DecisionSession,
  housePackage: HousePackage,
  event: DecisionEvent,
): ApplyEventResult {
  switch (event.type) {
    case "RoomSelected": {
      const result = selectRoom({
        session,
        housePackage,
        roomId: event.roomId,
        now: event.at,
      });
      if (!result.ok) {
        return {
          ok: false,
          code: result.code,
          message: result.message,
        };
      }
      return { ok: true, session: result.session };
    }
    case "PriorityChanged":
    case "VariantSelected":
    case "ScenarioActivated":
    case "QuestionAnswered": {
      // Reserved semantic events — append + bump version without domain rules yet.
      return {
        ok: true,
        session: freezeDecisionSession({
          objectId: session.objectId,
          runtimeState: {
            ...session.runtimeState,
            version: session.runtimeState.version + 1,
          },
          events: [...session.events, event],
          createdAt: session.createdAt,
          updatedAt: event.at,
        }),
      };
    }
    default: {
      const _exhaustive: never = event;
      return {
        ok: false,
        code: "HP_UNKNOWN_EVENT",
        message: `Unsupported event: ${JSON.stringify(_exhaustive)}`,
      };
    }
  }
}
