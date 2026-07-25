/**
 * PT-010 — MemoryResolutionStrategy.
 * Deterministic conflict rules over DecisionMemory history.
 */

import type { DecisionMemory } from "../../prompt/models/DecisionMemory";
import type { ResolvedMemory } from "../models/ResolvedMemory";

export interface MemoryResolutionStrategy {
  resolve(history: DecisionMemory): ResolvedMemory;
}
