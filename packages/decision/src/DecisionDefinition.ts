/**
 * Metadata-only decision definition with static graph edges.
 * No options, predicates, or branching.
 */
export interface DecisionDefinition {
  id: string;
  question: string;
  type: "single-choice" | "multi-choice" | "number" | "text";
  /** Static successor decision id. */
  next?: string;
  /** Static predecessor decision id. */
  previous?: string;
}
