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

  const profile = useMemo(() => {
    const ids = SELECTABLE_DECISION_CATEGORIES.map((category) => category.id)
      .filter((id) => cards[id]?.selected === true)
      .sort((left, right) => {
        const importanceDelta =
          (cards[right]?.importance ?? 0) - (cards[left]?.importance ?? 0);
        if (importanceDelta !== 0) {
          return importanceDelta;
        }
        return left.localeCompare(right);
      });
    return {
      ids,
      intensities: ids.map((id) => ({
        priorityId: id,
        importance: cards[id]?.importance ?? 0,
      })),
    };
  }, [cards]);

  useEffect(() => {
    if (profile.ids.length === 0) {
      return;
    }

    const key = profile.intensities
      .map((item) => `${item.priorityId}:${item.importance}`)
      .join(',');
    if (key === lastDispatchedKey.current) {
      return;
    }

    const currentIds = experience.context.decision.priorityIds.join(',');
    const currentIntensities = experience.context.decision.priorityIntensities;
    const currentKey = profile.ids
      .map(
        (id) =>
          `${id}:${currentIntensities?.[id] ?? ''}`,
      )
      .join(',');
    if (key === currentKey && currentIds === profile.ids.join(',')) {
      lastDispatchedKey.current = key;
      return;
    }

    const timer = window.setTimeout(() => {
      const result = dispatch({
        type: 'ChangePriority',
        priorityIds: profile.ids,
        intensities: profile.intensities,
      });
      if (result.ok) {
        lastDispatchedKey.current = key;
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [dispatch, experience.context.decision.priorityIds, experience.context.decision.priorityIntensities, profile]);
}
