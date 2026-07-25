/**
 * PT-005 / PT-007 / PT-009 / PT-010 — Decision Memory model.
 *
 * DecisionMemory = append-only history (never rewritten).
 * Writes MUST go through DecisionMemoryService only.
 * Active interpretation is ResolvedMemory (computed, PT-010).
 */

export type MemoryValue = string | number | boolean;

export type MemoryItem = {
  readonly key: string;
  readonly value: MemoryValue;
  /** Monotonic temporal order within the history (PT-010). */
  readonly at: number;
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
