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
 * Priority Engine façade: card UI → Priority Signals (via Runtime) + legacy Experience compose.
 *
 * ED-DA-01: `interpretation` / `experience` here are the **legacy cognitive stack**
 * (`@embed-engine/core` interpretAndCompose) — NOT Decision Session Runtime artifacts.
 * Canonical Story / Moves / Outcome / Terminal / AIContext live on
 * `DecisionSessionRuntimeProvider` → `experience.context.decision.*`.
 * Dual-stack retirement remains open under ED-DA-01.
 *
 * Hero / Gallery / Navigator react only through Experience Context — never from cards directly.
 */
export function PriorityExperienceProvider({
  children,
}: PriorityExperienceProviderProps) {
  const { cards, categories, setImportance, toggleCard } = useDecisionCards();
  usePrioritySignalBridge(cards);
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
