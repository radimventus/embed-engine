import { createContext, useContext, type ReactNode } from 'react';
import type { Interpretation } from '@embed-engine/core/cognitive';

import { useExperienceSession } from './ExperienceBindingProvider';

/**
 * Neutral empty cognitive Interpretation — no invented presentation copy.
 * Presentation semantics belong on Experience, not this fallback.
 */
const EMPTY_INTERPRETATION: Interpretation = Object.freeze({
  priorities: Object.freeze([]),
  events: Object.freeze([]),
  recommendedQuestions: Object.freeze([]),
  conversationContext: '',
  recommendations: Object.freeze([]),
  activeTopic: '',
  nextAction: '',
});

const InterpretationContext = createContext<Interpretation>(EMPTY_INTERPRETATION);

type InterpretationProviderProps = {
  children: ReactNode;
};

/**
 * Cognitive Interpretation selector over the shared Experience Session snapshot.
 * Not a presentation source for Priority / Recommendation / Advisor UI.
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
