import type { Signal } from "../signals/Signal";
import type {
  Context,
  DecisionConflict,
  DecisionFact,
  DecisionMetadata,
  Priority,
} from "./types";

/**
 * Central immutable domain model of the Cognitive Layer.
 * Single source of truth for the user's decision process.
 * Data only — no methods, no Runtime coupling.
 */
export type DecisionState = {
  readonly objectId: string;
  readonly context: Context;
  readonly signals: readonly Signal[];
  readonly priorities: readonly Priority[];
  readonly facts: readonly DecisionFact[];
  readonly conflicts: readonly DecisionConflict[];
  readonly interpretationVersion: number;
  readonly metadata: DecisionMetadata;
};
