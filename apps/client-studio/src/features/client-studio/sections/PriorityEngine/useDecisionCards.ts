import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Runtime } from '@embed-engine/core';
import {
  createSignal,
  SignalType,
  type Interpretation,
} from '@embed-engine/core/cognitive';

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
  };
}

/**
 * Priority Engine reads Interpretation from Runtime.
 * Writes happen only via Signal → reduce → project.
 */
export function useDecisionCards(runtime: Runtime) {
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

  const weightById = useMemo(() => {
    return Object.fromEntries(
      interpretation.priorities.map((priority) => [priority.id, priority.weight]),
    );
  }, [interpretation]);

  const toggleCard = useCallback(
    (id: string) => {
      runtime.applySignal(
        createSignal({
          type: SignalType.QUESTION_OPENED,
          payload: { questionId: id },
        }),
      );
    },
    [runtime],
  );

  const selectedCount = useMemo(
    () => interpretation.priorities.filter((priority) => priority.weight > 0.5).length,
    [interpretation],
  );
  const minimumMet = selectedCount >= DECISION_MINIMUM_SELECTION;

  return {
    categories: DECISION_CATEGORIES,
    importanceById: weightById,
    minimumMet,
    minimumSelection: DECISION_MINIMUM_SELECTION,
    questionId,
    selectedCount,
    toggleCard,
  };
}
