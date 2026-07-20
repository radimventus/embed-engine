import { createInitialFocus } from "../focus/createInitialFocus";
import type { DecisionState } from "./DecisionState";

/**
 * Creates an empty immutable Decision State for an object.
 */
export function createInitialDecisionState(objectId: string): DecisionState {
  return Object.freeze({
    objectId,
    environment: Object.freeze({}),
    focus: createInitialFocus(),
    signals: Object.freeze([]),
    priorities: Object.freeze([]),
    facts: Object.freeze([]),
    conflicts: Object.freeze([]),
    interpretationVersion: 0,
    metadata: Object.freeze({}),
  });
}
