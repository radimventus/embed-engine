/**
 * Metadata-only decision definition with static graph edges.
 * No predicates or branching.
 */
export interface DecisionChoiceDefinition {
  id: string;
  label: string;
}

export interface DecisionDefinition {
  id: string;
  question: string;
  type: "single-choice" | "multi-choice" | "number" | "text";
  /** Static successor decision id. */
  next?: string;
  /** Static predecessor decision id. */
  previous?: string;
  /** Optional answer choices for single/multi-choice decisions. */
  choices?: readonly DecisionChoiceDefinition[];
}
