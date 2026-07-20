import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Interpretation } from '@embed-engine/core/cognitive';

import { useCognitiveRuntime } from './CognitiveRuntimeContext';

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
 * Single Interpretation subscription for Priority, FAQ, and AI renderers.
 * One Runtime notify → one React state update → all three re-render together.
 */
export function InterpretationProvider({ children }: InterpretationProviderProps) {
  const runtime = useCognitiveRuntime();
  const [interpretation, setInterpretation] = useState<Interpretation>(() => {
    return runtime?.getState().interpretation ?? EMPTY_INTERPRETATION;
  });

  useEffect(() => {
    if (runtime === null) {
      setInterpretation(EMPTY_INTERPRETATION);
      return;
    }

    setInterpretation(runtime.getState().interpretation ?? EMPTY_INTERPRETATION);

    return runtime.subscribe((state) => {
      setInterpretation(state.interpretation ?? EMPTY_INTERPRETATION);
    });
  }, [runtime]);

  const value = useMemo(() => interpretation, [interpretation]);

  return (
    <InterpretationContext.Provider value={value}>{children}</InterpretationContext.Provider>
  );
}

export function useInterpretation(): Interpretation {
  return useContext(InterpretationContext);
}

export function useEmptyInterpretationFallback(): Interpretation {
  return EMPTY_INTERPRETATION;
}
