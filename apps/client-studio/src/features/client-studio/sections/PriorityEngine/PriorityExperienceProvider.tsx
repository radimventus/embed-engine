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

import {
  SELECTABLE_DECISION_CATEGORIES,
  type DecisionCategory,
} from './decision-cards.constants';
import { PrioritySelectionProvider } from './PrioritySelectionContext';
import {
  useDecisionCards,
  type DecisionCardState,
} from './useDecisionCards';
import { usePrioritySignalBridge } from './usePrioritySignalBridge';

export type PriorityExperienceValue = {
  readonly cards: Record<string, DecisionCardState>;
  readonly categories: readonly DecisionCategory[];
  readonly setImportance: (id: string, importance: number) => void;
  readonly toggleCard: (id: string) => void;
  readonly priorities: PrioritySelection;
  readonly selectedCount: number;
  readonly minimumSelection: number;
  readonly minimumMet: boolean;
};

const PriorityExperienceContext = createContext<PriorityExperienceValue | null>(
  null,
);

type PriorityExperienceProviderProps = {
  children: ReactNode;
};

/**
 * Priority Experience — interaction chrome + Decision Signal bridge (CSCB-04).
 *
 * Captures user intent only. Does not interpret, score, or recommend.
 * Canonical semantics: Decision Session Runtime → `experience.context`.
 */
export function PriorityExperienceProvider({
  children,
}: PriorityExperienceProviderProps) {
  const {
    cards,
    categories,
    setImportance,
    toggleCard,
    selectedCount,
    minimumSelection,
    minimumMet,
  } = useDecisionCards();
  usePrioritySignalBridge(cards);

  const priorities = useMemo((): PrioritySelection => {
    const selected = SELECTABLE_DECISION_CATEGORIES.map((category) => category.id)
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
    selectedCount,
    minimumSelection,
    minimumMet,
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
