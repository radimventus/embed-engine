/**
 * Cognitive Layer public surface.
 */
export type { DecisionState } from "./decision-state/DecisionState";
export type {
  Context,
  DecisionConflict,
  DecisionFact,
  DecisionMetadata,
  Priority,
} from "./decision-state/types";
export { createInitialDecisionState } from "./decision-state/createInitialDecisionState";

export type { Signal, SignalMetadata, SignalPayload } from "./signals/Signal";
export { SignalType } from "./signals/SignalType";
export { createSignal } from "./signals/createSignal";
export type { CreateSignalInput } from "./signals/createSignal";
