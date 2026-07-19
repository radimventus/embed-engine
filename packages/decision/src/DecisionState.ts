/**
 * Mutable business state of the decision process.
 * Metadata catalogs (DecisionRegistry) are not part of this state.
 */
export interface DecisionState {
  answers: Map<string, unknown>;
}
