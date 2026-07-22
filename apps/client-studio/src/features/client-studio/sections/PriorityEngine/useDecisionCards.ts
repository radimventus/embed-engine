import { useCallback, useMemo, useState } from 'react';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import {
  DECISION_CARD_IMPORTANCE_DEFAULT,
  DECISION_CATEGORIES,
  DECISION_MINIMUM_SELECTION,
} from './decision-cards.constants';

export type DecisionCardState = {
  selected: boolean;
  importance: number;
};

/**
 * Build card chrome from Runtime priorityIds.
 * Intensity is encoded as descending importance by order (CSCB-04).
 * UI does not evaluate meaning — order is the Decision Signal shape Runtime accepts.
 */
export function createCardsFromPriorityIds(
  priorityIds: readonly string[],
): Record<string, DecisionCardState> {
  const cards = Object.fromEntries(
    DECISION_CATEGORIES.map((category) => [
      category.id,
      { selected: false, importance: DECISION_CARD_IMPORTANCE_DEFAULT },
    ]),
  ) as Record<string, DecisionCardState>;

  const count = priorityIds.length;
  priorityIds.forEach((id, index) => {
    const card = cards[id];
    if (card === undefined) {
      return;
    }
    cards[id] = {
      selected: true,
      importance:
        count <= 1 ? 1 : Number(((count - index) / count).toFixed(3)),
    };
  });

  return cards;
}

/**
 * Priority card chrome state (CSCB-04).
 * Initialized from Runtime Context for Decision Session continuity.
 */
export function useDecisionCards() {
  const { experience } = useDecisionSessionRuntime();
  const [cards, setCards] = useState<Record<string, DecisionCardState>>(() =>
    createCardsFromPriorityIds(experience.context.decision.priorityIds),
  );

  const toggleCard = useCallback((id: string) => {
    setCards((previous) => {
      const current = previous[id];
      if (current === undefined) {
        return previous;
      }
      return {
        ...previous,
        [id]: {
          ...current,
          selected: !current.selected,
        },
      };
    });
  }, []);

  const setImportance = useCallback((id: string, importance: number) => {
    const clamped = Math.min(1, Math.max(0, importance));
    setCards((previous) => {
      const current = previous[id];
      if (current === undefined) {
        return previous;
      }
      return {
        ...previous,
        [id]: {
          ...current,
          importance: clamped,
        },
      };
    });
  }, []);

  const selectedCount = useMemo(
    () => Object.values(cards).filter((card) => card.selected).length,
    [cards],
  );

  const minimumMet = selectedCount >= DECISION_MINIMUM_SELECTION;

  return {
    cards,
    categories: DECISION_CATEGORIES,
    minimumMet,
    minimumSelection: DECISION_MINIMUM_SELECTION,
    selectedCount,
    setImportance,
    toggleCard,
  };
}
