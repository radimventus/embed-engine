import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { DecisionStory } from '@embed-engine/core/decision-layer';
import { getDispositionMove } from '@embed-engine/object-house';

import { useCognitiveRuntime } from './CognitiveRuntimeContext';

const DecisionStoryContext = createContext<DecisionStory | null>(null);

type DecisionStoryProviderProps = {
  children: ReactNode;
};

/**
 * Subscribes to Runtime.decisionStory (Strategy output).
 */
export function DecisionStoryProvider({ children }: DecisionStoryProviderProps) {
  const runtime = useCognitiveRuntime();
  const [story, setStory] = useState<DecisionStory | null>(
    () => runtime?.getState().decisionStory ?? null,
  );

  useEffect(() => {
    if (runtime === null) {
      setStory(null);
      return;
    }

    setStory(runtime.getState().decisionStory ?? null);
    return runtime.subscribe((state) => {
      setStory(state.decisionStory ?? null);
    });
  }, [runtime]);

  const value = useMemo(() => story, [story]);

  return (
    <DecisionStoryContext.Provider value={value}>{children}</DecisionStoryContext.Provider>
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
