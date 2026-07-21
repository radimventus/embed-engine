/**
 * DecisionContext — canonical runtime context for InterpretationEngine.
 *
 * Everything external to the Object that influences semantic interpretation.
 * Contains no interpretation logic, presentation, or persistence.
 *
 * MVP: PrioritySelection only. Future fields (persona, session, market, …)
 * should extend this artifact without changing InterpretationEngine signatures.
 */

export type DecisionContextPriorities = {
  /** Selected Priority identifiers (machine ids — not UI labels). */
  readonly selected: readonly string[];
};

/**
 * Immutable semantic input describing the decision situation.
 */
export type DecisionContext = {
  readonly priorities: DecisionContextPriorities;
};

export type CreateDecisionContextInput = {
  readonly priorities: {
    readonly selected: readonly string[];
  };
};

/**
 * Creates a frozen DecisionContext from known runtime inputs.
 */
export function createDecisionContext(
  input: CreateDecisionContextInput,
): DecisionContext {
  return Object.freeze({
    priorities: Object.freeze({
      selected: Object.freeze([...input.priorities.selected]),
    }),
  });
}
