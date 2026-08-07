import type { DecisionFilter } from "./DecisionFilter";

export const PRIORITY_FOCUS_DECISION_ID = "priority-focus";
export const GARDEN_IMPORTANCE_DECISION_ID = "garden-importance";

export const PRIORITY_FOCUS_PRICE = "price";
export const PRIORITY_FOCUS_SPACE = "space";
export const GARDEN_IMPORTANCE_YES = "yes";
export const GARDEN_IMPORTANCE_NO = "no";

/**
 * Builds DecisionFilter from DecisionState.answers.
 * Deterministic. No scoring.
 */
export function buildDecisionFilter(
  answers: ReadonlyMap<string, unknown> | Readonly<Record<string, unknown>>,
): DecisionFilter {
  const get = (key: string): unknown => {
    if (answers instanceof Map) {
      return answers.get(key);
    }
    return (answers as Readonly<Record<string, unknown>>)[key];
  };

  const priorityFocus = get(PRIORITY_FOCUS_DECISION_ID);
  const gardenImportance = get(GARDEN_IMPORTANCE_DECISION_ID);

  return {
    preferPrice: priorityFocus === PRIORITY_FOCUS_PRICE,
    preferSpace: priorityFocus === PRIORITY_FOCUS_SPACE,
    preferGarden: gardenImportance === GARDEN_IMPORTANCE_YES,
  };
}
