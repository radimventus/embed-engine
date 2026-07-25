/**
 * PT-005 / PT-007 / PT-009 — Decision Memory model.
 *
 * Source of truth for decision knowledge.
 * Writes MUST go through DecisionMemoryService only (PT-009).
 */

export type MemoryValue = string | number | boolean;

export type MemoryItem = {
  readonly key: string;
  readonly value: MemoryValue;
};

export type DecisionMemory = {
  readonly facts: readonly MemoryItem[];
  readonly preferences: readonly MemoryItem[];
  readonly constraints: readonly MemoryItem[];
  readonly goals: readonly MemoryItem[];
  readonly concerns: readonly MemoryItem[];
  readonly acceptedOptions: readonly MemoryItem[];
  readonly rejectedOptions: readonly MemoryItem[];
};

export function emptyDecisionMemory(): DecisionMemory {
  return Object.freeze({
    facts: Object.freeze([] as MemoryItem[]),
    preferences: Object.freeze([] as MemoryItem[]),
    constraints: Object.freeze([] as MemoryItem[]),
    goals: Object.freeze([] as MemoryItem[]),
    concerns: Object.freeze([] as MemoryItem[]),
    acceptedOptions: Object.freeze([] as MemoryItem[]),
    rejectedOptions: Object.freeze([] as MemoryItem[]),
  });
}
