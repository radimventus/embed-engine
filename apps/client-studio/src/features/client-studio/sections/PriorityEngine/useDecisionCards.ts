import { useCallback, useMemo } from 'react';

import {
  applyQuestionOpened,
  useApplyCognitiveSignal,
} from '../../cognitive/CognitiveRuntimeContext';
import { useInterpretation } from '../../cognitive/InterpretationProvider';
import {
  DECISION_CATEGORIES,
  DECISION_MINIMUM_SELECTION,
} from './decision-cards.constants';

/**
 * Priority renderer — reads shared Interpretation only.
 */
export function useDecisionCards() {
  const interpretation = useInterpretation();
  const applySignal = useApplyCognitiveSignal();
  const questionId = interpretation.priorities.find((priority) => priority.weight === 1)?.id;

  const priorityById = useMemo(() => {
    return Object.fromEntries(
      interpretation.priorities.map((priority) => [priority.id, priority]),
    );
  }, [interpretation]);

  const toggleCard = useCallback(
    (id: string) => {
      const category = DECISION_CATEGORIES.find((item) => item.id === id);
      applyQuestionOpened(
        applySignal,
        id,
        category ? `Priority focus: ${category.title}` : `Priority focus: ${id}`,
      );
    },
    [applySignal],
  );

  const selectedCount = useMemo(
    () => interpretation.priorities.filter((priority) => priority.weight > 0.5).length,
    [interpretation],
  );
  const minimumMet = selectedCount >= DECISION_MINIMUM_SELECTION;

  const elevatedPriorities = useMemo(
    () =>
      interpretation.priorities
        .filter((priority) => priority.reason)
        .sort((left, right) => right.weight - left.weight),
    [interpretation],
  );

  return {
    categories: DECISION_CATEGORIES,
    elevatedPriorities,
    events: interpretation.events,
    minimumMet,
    minimumSelection: DECISION_MINIMUM_SELECTION,
    priorityById,
    questionId,
    selectedCount,
    toggleCard,
  };
}
