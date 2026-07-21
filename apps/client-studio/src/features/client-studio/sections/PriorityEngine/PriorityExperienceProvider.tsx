import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import type {
  DecisionContext,
  Interpretation,
} from '@embed-engine/core';
import type {
  Experience,
  PrioritySelection,
} from '@embed-engine/core/experience';

import { DECISION_CATEGORIES } from './decision-cards.constants';
import { PrioritySelectionProvider } from './PrioritySelectionContext';
import { useDecisionCards } from './useDecisionCards';
import { usePriorityReactiveExperience } from './usePriorityReactiveExperience';

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
  readonly context: DecisionContext;
  readonly interpretation: Interpretation;
  readonly experience: Experience;
};

const PriorityExperienceContext = createContext<PriorityExperienceValue | null>(
  null,
);

type PriorityExperienceProviderProps = {
  children: ReactNode;
};

/**
 * Owns Priority UI state and the reactive Experience pipeline.
 * Experience is the only semantic presentation contract for child surfaces.
 */
export function PriorityExperienceProvider({
  children,
}: PriorityExperienceProviderProps) {
  const { cards, categories, setImportance, toggleCard } = useDecisionCards();
  const { priorities, context, interpretation, experience } =
    usePriorityReactiveExperience(cards);

  const value: PriorityExperienceValue = {
    cards,
    categories,
    setImportance,
    toggleCard,
    priorities,
    context,
    interpretation,
    experience,
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
