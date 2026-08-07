/**
 * Visitor preference filter derived from DecisionState answers.
 * Domain truth for interpretation — not a UI concern.
 */
export interface DecisionFilter {
  readonly preferPrice: boolean;
  readonly preferSpace: boolean;
  readonly preferGarden: boolean;
}
