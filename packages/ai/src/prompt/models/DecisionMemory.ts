/**
 * PT-005 — Decision Memory stub (filled in a later PT).
 */

export type DecisionMemory = {
  readonly facts: readonly string[];
  readonly preferences: readonly string[];
  readonly constraints: readonly string[];
};

export function emptyDecisionMemory(): DecisionMemory {
  return Object.freeze({
    facts: Object.freeze([] as string[]),
    preferences: Object.freeze([] as string[]),
    constraints: Object.freeze([] as string[]),
  });
}
