import type { Focus } from "../focus/Focus";
import type { Signal } from "../signals/Signal";
import type {
  DecisionConflict,
  DecisionFact,
  DecisionMetadata,
  Environment,
  Priority,
} from "./types";

/**
 * Central immutable domain model of the Cognitive Layer.
 * Single source of truth for the user's decision process.
 * Data only — no methods, no Runtime coupling.
 */
export type DecisionState = {
  readonly objectId: string;
  readonly environment: Environment;
  readonly focus: Focus;
  readonly signals: readonly Signal[];
  readonly priorities: readonly Priority[];
  readonly facts: readonly DecisionFact[];
  readonly conflicts: readonly DecisionConflict[];
  readonly interpretationVersion: number;
  readonly metadata: DecisionMetadata;
};
