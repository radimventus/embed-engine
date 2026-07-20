import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Runtime } from '@embed-engine/core';
import type { Interpretation } from '@embed-engine/core/cognitive';

import {
  applyQuestionOpened,
  useApplyCognitiveSignal,
} from '../../cognitive/CognitiveRuntimeContext';
import {
  DECISION_CATEGORIES,
  DECISION_MINIMUM_SELECTION,
} from './decision-cards.constants';

function emptyInterpretation(): Interpretation {
  return {
    priorities: DECISION_CATEGORIES.map((category) => ({
      id: category.id,
      weight: 0.35,
    })),
    events: [],
  };
}

/**
 * Priority Engine reads Interpretation from Runtime.
 * Writes happen only via Signal → reduce → project.
 */
export function useDecisionCards(runtime: Runtime) {
  const applySignal = useApplyCognitiveSignal();
  const [interpretation, setInterpretation] = useState<Interpretation>(
    () => runtime.getState().interpretation ?? emptyInterpretation(),
  );
  const [questionId, setQuestionId] = useState<string | undefined>(
    () => runtime.getState().decisionState?.focus.questionId,
  );

  useEffect(() => {
    setInterpretation(runtime.getState().interpretation ?? emptyInterpretation());
    setQuestionId(runtime.getState().decisionState?.focus.questionId);

    return runtime.subscribe((state) => {
      setInterpretation(state.interpretation ?? emptyInterpretation());
      setQuestionId(state.decisionState?.focus.questionId);
    });
  }, [runtime]);

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
