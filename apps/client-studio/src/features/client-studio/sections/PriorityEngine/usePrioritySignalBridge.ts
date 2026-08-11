import { useEffect, useMemo, useRef } from 'react';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { SELECTABLE_DECISION_CATEGORIES } from './decision-cards.constants';
import type { DecisionCardState } from './useDecisionCards';

/**
 * Priority Profile from card selection → ChangePriority command (CSCB-04).
 *
 * Decision Signals / interaction only:
 * - selected ids + intensity order → `priorityIds` (highest importance first)
 * - Runtime owns signal strength / Interpretation
 * - Empty local selection does not clear Runtime (Command rejects empty arrays)
 */
export function usePrioritySignalBridge(
  cards: Record<string, DecisionCardState>,
): void {
  const { dispatch, experience } = useDecisionSessionRuntime();
  const lastDispatchedKey = useRef<string>('');

  const profileIds = useMemo(() => {
    return SELECTABLE_DECISION_CATEGORIES.map((category) => category.id)
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

    const currentKey = experience.context.decision.priorityIds.join(',');
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
  }, [dispatch, experience.context.decision.priorityIds, profileIds]);
}
