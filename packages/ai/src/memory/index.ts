/**
 * PT-009 / PT-010 — Decision Memory capability public surface.
 */

export {
  DecisionMemoryService,
  createDecisionMemoryService,
  type DecisionMemoryServiceOptions,
} from "./DecisionMemoryService";

export type {
  MemoryUpdateRequest,
  MemoryUpdateResult,
} from "./models/MemoryUpdateRequest";

export type {
  ResolvedMemory,
  ResolvedMemoryItem,
} from "./models/ResolvedMemory";
export { emptyResolvedMemory } from "./models/ResolvedMemory";

export {
  MemoryResolutionEngine,
  createMemoryResolutionEngine,
  resolveMemory,
  type MemoryResolutionEngineOptions,
} from "./MemoryResolutionEngine";

export type { MemoryResolutionStrategy } from "./strategies/MemoryResolutionStrategy";
export { LastWriteWinsResolutionStrategy } from "./strategies/LastWriteWinsResolutionStrategy";
