import type { HousePackage } from "@embed-engine/object-house";

import type { RuntimeClock } from "./clock";
import { resolveRuntimeTimestamp } from "./clock";
import { freezeDecisionSession, type DecisionSession } from "./DecisionSession";
import { createInitialSessionRuntimeState } from "./SessionRuntimeState";

export type CreateDecisionSessionInput = {
  readonly housePackage: HousePackage;
  /** Explicit epoch ms — preferred for deterministic tests. */
  readonly now?: number;
  /** Injectable clock when `now` is omitted (ED-DA-06). */
  readonly clock?: RuntimeClock;
};

/**
 * Bind an Object Package into a new Decision Session.
 * House Package facts are not stored in the session — only objectId.
 * Time comes only from `now` or injected `clock` — never the host system clock.
 */
export function createDecisionSession(
  input: CreateDecisionSessionInput,
): DecisionSession {
  const now = resolveRuntimeTimestamp({
    now: input.now,
    clock: input.clock,
    label: "createDecisionSession",
  });
  return freezeDecisionSession({
    objectId: input.housePackage.identity.id,
    runtimeState: createInitialSessionRuntimeState(),
    events: [],
    createdAt: now,
    updatedAt: now,
  });
}
