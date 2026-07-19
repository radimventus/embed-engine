/**
 * Metadata-only decision definition.
 * No options, validation, or branching.
 */
export interface DecisionDefinition {
  id: string;
  question: string;
  type: "single-choice" | "multi-choice" | "number" | "text";
}
