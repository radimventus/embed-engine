/**
 * PT-010 — MemoryResolutionEngine.
 *
 * Computes ResolvedMemory from DecisionMemory history.
 * Never mutates history. Never talks to Providers.
 */

import type { DecisionMemory } from "../prompt/models/DecisionMemory";
import type { ResolvedMemory } from "./models/ResolvedMemory";
import { LastWriteWinsResolutionStrategy } from "./strategies/LastWriteWinsResolutionStrategy";
import type { MemoryResolutionStrategy } from "./strategies/MemoryResolutionStrategy";

export type MemoryResolutionEngineOptions = {
  readonly strategy?: MemoryResolutionStrategy;
};

export class MemoryResolutionEngine {
  private readonly strategy: MemoryResolutionStrategy;

  constructor(options: MemoryResolutionEngineOptions = {}) {
    this.strategy =
      options.strategy ?? new LastWriteWinsResolutionStrategy();
  }

  resolve(history: DecisionMemory): ResolvedMemory {
    return this.strategy.resolve(history);
  }
}

export function createMemoryResolutionEngine(
  options?: MemoryResolutionEngineOptions,
): MemoryResolutionEngine {
  return new MemoryResolutionEngine(options);
}

/** Convenience: resolve history with the default v1 strategy. */
export function resolveMemory(history: DecisionMemory): ResolvedMemory {
  return createMemoryResolutionEngine().resolve(history);
}
