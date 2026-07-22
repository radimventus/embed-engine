import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  PriorityId,
  PrioritySelection,
} from '@embed-engine/core/experience';

import { DECISION_CATEGORIES } from './decision-cards.constants';
import { PrioritySelectionProvider } from './PrioritySelectionContext';
import { useDecisionCards } from './useDecisionCards';
import { usePrioritySignalBridge } from './usePrioritySignalBridge';

type DecisionCardState = {
  selected: boolean;
  importance: number;
};

export type PriorityExperienceValue = {
  readonly cards: Record<string, DecisionCardState>;
  readonly categories: typeof DECISION_CATEGORIES;
  readonly setImportance: (id: string, importance: number) => void;
  readonly toggleCard: (id: string) => void;
  readonly priorities: PrioritySelection;
};

const PriorityExperienceContext = createContext<PriorityExperienceValue | null>(
  null,
);

type PriorityExperienceProviderProps = {
  children: ReactNode;
};

/**
 * Priority card UI state + signal bridge into Decision Session Runtime (ED-DA-04).
 *
 * Context transport for card chrome only — does not compose Experience /
 * Interpretation / Story / Outcome / Terminal / AIContext.
 * Canonical semantics: `DecisionSessionRuntimeProvider` → `experience.context`.
 */
export function PriorityExperienceProvider({
  children,
}: PriorityExperienceProviderProps) {
  const { cards, categories, setImportance, toggleCard } = useDecisionCards();
  usePrioritySignalBridge(cards);

  const priorities = useMemo((): PrioritySelection => {
    const selected = DECISION_CATEGORIES.map((category) => category.id)
      .filter((id) => cards[id]?.selected)
      .map((id) => id as PriorityId);

    return Object.freeze({
      selected: Object.freeze(selected),
    });
  }, [cards]);

  const value: PriorityExperienceValue = {
    cards,
    categories,
    setImportance,
    toggleCard,
    priorities,
  };

  return (
    <PriorityExperienceContext.Provider value={value}>
      <PrioritySelectionProvider value={priorities}>
        {children}
      </PrioritySelectionProvider>
    </PriorityExperienceContext.Provider>
  );
}

export function usePriorityExperience(): PriorityExperienceValue {
  const value = useContext(PriorityExperienceContext);
  if (value === null) {
    throw new Error(
      'usePriorityExperience must be used within PriorityExperienceProvider',
    );
  }
  return value;
}
