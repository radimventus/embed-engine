import { useEffect, useMemo, useRef } from 'react';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { DECISION_CATEGORIES } from './decision-cards.constants';

type DecisionCardState = {
  selected: boolean;
  importance: number;
};

/**
 * Priority Profile from card selection → ChangePriority command.
 * Priority Engine produces signals only; it does not reshape Hero/Gallery itself.
 */
export function usePrioritySignalBridge(
  cards: Record<string, DecisionCardState>,
): void {
  const { dispatch, experience } = useDecisionSessionRuntime();
  const lastDispatchedKey = useRef<string>('');

  const profileIds = useMemo(() => {
    return DECISION_CATEGORIES.map((category) => category.id)
      .filter((id) => cards[id]?.selected === true)
      .sort((left, right) => {
        const importanceDelta =
          (cards[right]?.importance ?? 0) - (cards[left]?.importance ?? 0);
        if (importanceDelta !== 0) {
          return importanceDelta;
        }
        return left.localeCompare(right);
      });
  }, [cards]);

  useEffect(() => {
    if (profileIds.length === 0) {
      return;
    }

    const key = profileIds.join(',');
    if (key === lastDispatchedKey.current) {
      return;
    }

    const currentKey = experience.priorityIds.join(',');
    if (key === currentKey) {
      lastDispatchedKey.current = key;
      return;
    }

    const result = dispatch({
      type: 'ChangePriority',
      priorityIds: profileIds,
    });
    if (result.ok) {
      lastDispatchedKey.current = key;
    }
  }, [dispatch, experience.priorityIds, profileIds]);
}
