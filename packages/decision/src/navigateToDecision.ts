import type { DecisionState } from "./DecisionState";

/**
 * Moves currentDecisionId and records history.
 */
export function navigateToDecision(
  state: DecisionState,
  decisionId: string,
): void {
  if (state.currentDecisionId === decisionId) {
    return;
  }

  if (state.currentDecisionId !== null) {
    state.history.push(state.currentDecisionId);
  }

  state.currentDecisionId = decisionId;
}
