import type { HousePackage } from "@embed-engine/object-house";

import { freezeDecisionSession, type DecisionSession } from "./DecisionSession";
import { createInitialSessionRuntimeState } from "./SessionRuntimeState";

export type CreateDecisionSessionInput = {
  readonly housePackage: HousePackage;
  /** Injectable clock for deterministic tests (epoch ms). */
  readonly now?: number;
};

/**
 * Bind an Object Package into a new Decision Session.
 * House Package facts are not stored in the session — only objectId.
 */
export function createDecisionSession(
  input: CreateDecisionSessionInput,
): DecisionSession {
  const now = input.now ?? Date.now();
  return freezeDecisionSession({
    objectId: input.housePackage.identity.id,
    runtimeState: createInitialSessionRuntimeState(),
    events: [],
    createdAt: now,
    updatedAt: now,
  });
}
