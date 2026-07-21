import { createContext, useContext, type ReactNode } from 'react';
import type { DecisionStory } from '@embed-engine/core/decision-layer';
import { getDispositionMove } from '@embed-engine/object-house';

import { useExperienceSession } from './ExperienceBindingProvider';

const DecisionStoryContext = createContext<DecisionStory | null>(null);

type DecisionStoryProviderProps = {
  children: ReactNode;
};

/**
 * Decision Story selector over the shared Experience Session snapshot (EX-01).
 */
export function DecisionStoryProvider({ children }: DecisionStoryProviderProps) {
  const session = useExperienceSession();
  const story = session.decisionStory ?? null;

  return (
    <DecisionStoryContext.Provider value={story}>{children}</DecisionStoryContext.Provider>
  );
}

export function useDecisionStory(): DecisionStory | null {
  return useContext(DecisionStoryContext);
}

export function useActiveDecisionMove() {
  const story = useDecisionStory();
  const activeMoveId = story?.activeMoveId ?? null;
  const definition = activeMoveId ? getDispositionMove(activeMoveId) : undefined;

  return {
    story,
    activeMoveId,
    definition: definition ?? null,
    outcome: story?.outcome ?? null,
  };
}
