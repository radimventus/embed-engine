import { createContext, useContext, type ReactNode } from 'react';
import type { Interpretation } from '@embed-engine/core/cognitive';

import { useExperienceSession } from './ExperienceBindingProvider';

const EMPTY_INTERPRETATION: Interpretation = Object.freeze({
  priorities: Object.freeze([]),
  events: Object.freeze([]),
  recommendedQuestions: Object.freeze([]),
  conversationContext: 'Calibrating your decision filter.',
  recommendations: Object.freeze([]),
  activeTopic: 'Layout',
  nextAction: 'Explore the house or select a priority.',
});

const InterpretationContext = createContext<Interpretation>(EMPTY_INTERPRETATION);

type InterpretationProviderProps = {
  children: ReactNode;
};

/**
 * Interpretation selector over the shared Experience Session snapshot (EX-01).
 * Does not subscribe to Runtime separately — ExperienceBindingProvider owns subscription.
 */
export function InterpretationProvider({ children }: InterpretationProviderProps) {
  const session = useExperienceSession();
  const interpretation = session.interpretation ?? EMPTY_INTERPRETATION;

  return (
    <InterpretationContext.Provider value={interpretation}>
      {children}
    </InterpretationContext.Provider>
  );
}

export function useInterpretation(): Interpretation {
  return useContext(InterpretationContext);
}

export function useEmptyInterpretationFallback(): Interpretation {
  return EMPTY_INTERPRETATION;
}
