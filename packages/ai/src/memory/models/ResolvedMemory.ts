/**
 * PT-010 — ResolvedMemory: active interpretation of DecisionMemory history.
 * Always computed. Never persisted as a separate source of truth.
 */

import type { MemoryValue } from "../../prompt/models/DecisionMemory";

export type ResolvedMemoryItem = {
  readonly key: string;
  readonly value: MemoryValue;
};

export type ResolvedMemory = {
  readonly facts: readonly ResolvedMemoryItem[];
  readonly preferences: readonly ResolvedMemoryItem[];
  readonly constraints: readonly ResolvedMemoryItem[];
  readonly goals: readonly ResolvedMemoryItem[];
  readonly concerns: readonly ResolvedMemoryItem[];
  readonly acceptedOptions: readonly ResolvedMemoryItem[];
  readonly rejectedOptions: readonly ResolvedMemoryItem[];
};

export function emptyResolvedMemory(): ResolvedMemory {
  return Object.freeze({
    facts: Object.freeze([] as ResolvedMemoryItem[]),
    preferences: Object.freeze([] as ResolvedMemoryItem[]),
    constraints: Object.freeze([] as ResolvedMemoryItem[]),
    goals: Object.freeze([] as ResolvedMemoryItem[]),
    concerns: Object.freeze([] as ResolvedMemoryItem[]),
    acceptedOptions: Object.freeze([] as ResolvedMemoryItem[]),
    rejectedOptions: Object.freeze([] as ResolvedMemoryItem[]),
  });
}
