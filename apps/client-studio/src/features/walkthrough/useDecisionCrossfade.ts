import { useEffect, useRef, useState } from 'react';

import { DECISION_TRANSITION_PHASE_MS } from './transition-tokens';

export function useDecisionCrossfade(key: string): {
  displayKey: string;
  opacity: number;
  phaseMs: number;
} {
  const [displayKey, setDisplayKey] = useState(key);
  const [opacity, setOpacity] = useState(1);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (key === displayKey) {
      return;
    }

    setOpacity(0);

    const timer = window.setTimeout(() => {
      setDisplayKey(key);
      setOpacity(1);
    }, DECISION_TRANSITION_PHASE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [displayKey, key]);

  return { displayKey, opacity, phaseMs: DECISION_TRANSITION_PHASE_MS };
}
