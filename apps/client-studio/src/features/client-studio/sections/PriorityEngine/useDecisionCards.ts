import { useCallback, useMemo, useState } from 'react';
import {
  DECISION_CARD_IMPORTANCE_DEFAULT,
  DECISION_CATEGORIES,
  DECISION_MINIMUM_SELECTION,
} from './decision-cards.constants';

type DecisionCardState = {
  selected: boolean;
  importance: number;
};

function createInitialState(): Record<string, DecisionCardState> {
  return Object.fromEntries(
    DECISION_CATEGORIES.map((category) => [
      category.id,
      { selected: false, importance: DECISION_CARD_IMPORTANCE_DEFAULT },
    ]),
  );
}

export function useDecisionCards() {
  const [cards, setCards] = useState<Record<string, DecisionCardState>>(createInitialState);

  const toggleCard = useCallback((id: string) => {
    setCards((previous) => ({
      ...previous,
      [id]: {
        ...previous[id],
        selected: !previous[id].selected,
      },
    }));
  }, []);

  const setImportance = useCallback((id: string, importance: number) => {
    setCards((previous) => ({
      ...previous,
      [id]: {
        ...previous[id],
        importance,
      },
    }));
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
