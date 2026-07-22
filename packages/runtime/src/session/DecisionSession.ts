import type { DecisionEvent, ObjectId, Timestamp } from "./DecisionEvent";
import type { SessionRuntimeState } from "./SessionRuntimeState";

/**
 * Canonical Runtime container for one decision journey (PT-003 / RI-002 philosophy).
 * Records semantic execution history — never UI implementation details.
 */
export type DecisionSession = {
  readonly objectId: ObjectId;
  readonly runtimeState: SessionRuntimeState;
  readonly events: readonly DecisionEvent[];
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
};

export function freezeDecisionSession(session: DecisionSession): DecisionSession {
  return Object.freeze({
    objectId: session.objectId,
    runtimeState: Object.freeze({ ...session.runtimeState }),
    events: Object.freeze(session.events.map((event) => Object.freeze({ ...event }))),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  });
}
