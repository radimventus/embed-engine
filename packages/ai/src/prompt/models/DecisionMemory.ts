/**
 * PT-005 / PT-007 — Decision Memory.
 *
 * Source of truth for decision knowledge extracted from conversation.
 * Analyzer merges into Memory — never replaces wholesale.
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

function mergeItems(
  existing: readonly MemoryItem[],
  incoming: readonly MemoryItem[],
): readonly MemoryItem[] {
  const byKey = new Map<string, MemoryItem>();
  for (const item of existing) {
    byKey.set(item.key, Object.freeze({ key: item.key, value: item.value }));
  }
  for (const item of incoming) {
    // Same key: keep existing (append-only merge — do not overwrite).
    if (!byKey.has(item.key)) {
      byKey.set(item.key, Object.freeze({ key: item.key, value: item.value }));
    }
  }
  return Object.freeze([...byKey.values()]);
}

/**
 * Merge AnalysisResult slices into Decision Memory.
 * Never deletes. Never overwrites existing keys.
 */
export function mergeDecisionMemory(
  memory: DecisionMemory,
  patch: {
    readonly facts?: readonly MemoryItem[];
    readonly preferences?: readonly MemoryItem[];
    readonly constraints?: readonly MemoryItem[];
    readonly goals?: readonly MemoryItem[];
    readonly concerns?: readonly MemoryItem[];
    readonly acceptedOptions?: readonly MemoryItem[];
    readonly rejectedOptions?: readonly MemoryItem[];
  },
): DecisionMemory {
  return Object.freeze({
    facts: mergeItems(memory.facts, patch.facts ?? []),
    preferences: mergeItems(memory.preferences, patch.preferences ?? []),
    constraints: mergeItems(memory.constraints, patch.constraints ?? []),
    goals: mergeItems(memory.goals, patch.goals ?? []),
    concerns: mergeItems(memory.concerns, patch.concerns ?? []),
    acceptedOptions: mergeItems(
      memory.acceptedOptions,
      patch.acceptedOptions ?? [],
    ),
    rejectedOptions: mergeItems(
      memory.rejectedOptions,
      patch.rejectedOptions ?? [],
    ),
  });
}
