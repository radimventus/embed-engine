import type { DecisionState } from "./DecisionState";
import type { Interpretation } from "./Interpretation";
import { buildDecisionFilter } from "./buildDecisionFilter";

export function buildInterpretation(
  state: DecisionState,
): Interpretation {
  const hasPriorityAnswer = state.answers.has("priority-focus");
  const hasGardenAnswer = state.answers.has("garden-importance");

  return {
    decisionFilter:
      hasPriorityAnswer || hasGardenAnswer
        ? buildDecisionFilter(state.answers)
        : null,
  };
}
