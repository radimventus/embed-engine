import type { DecisionFilter } from "./DecisionFilter";

/**
 * Internal semantic result produced by the Decision Engine.
 *
 * Interpretation contains derived meaning only.
 * It never stores mutable runtime state.
 */
export interface Interpretation {
  /**
   * Semantic interpretation of visitor preferences.
   * Null when there is not enough information yet.
   */
  readonly decisionFilter: DecisionFilter | null;
}
