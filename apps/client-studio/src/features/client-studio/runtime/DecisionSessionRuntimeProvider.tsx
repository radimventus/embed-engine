import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { REFERENCE_HOUSE_PACKAGE } from '@embed-engine/object-house';
import {
  createDecisionSessionRuntime,
  type DecisionSessionRuntime,
  type RuntimeCommand,
  type SessionInterpretation,
  type DispatchResult,
} from '@embed-engine/runtime';

import {
  projectSynchronizedExperience,
  type SynchronizedExperience,
} from './synchronizedExperience';

type DecisionSessionRuntimeContextValue = {
  /**
   * Session Runtime façade — prefer `dispatch` + `experience`.
   * Do not reach into pipeline composers from presentation (ED-DA-01 / ED-DA-04).
   */
  readonly runtime: DecisionSessionRuntime;
  /**
   * Canonical projected Experience for Client Studio modules.
   * Prefer `experience.context` (Experience Context) as the presentation contract.
   */
  readonly experience: SynchronizedExperience;
  /**
   * Raw SessionInterpretation — legacy bridging / diagnostics only.
   * Prefer `experience.context`; do not treat as a public Experience contract (ED-DA-04).
   */
  readonly interpretation: SessionInterpretation | null;
  readonly dispatch: (command: RuntimeCommand, now?: number) => DispatchResult;
};

const DecisionSessionRuntimeContext =
  createContext<DecisionSessionRuntimeContextValue | null>(null);

type DecisionSessionRuntimeProviderProps = {
  readonly children: ReactNode;
};

/**
 * Decision Session Runtime + Experience Context projection (CAP-HP-003.5).
 * All Experience modules consume `experience.context` — never each other.
 */
export function DecisionSessionRuntimeProvider({
  children,
}: DecisionSessionRuntimeProviderProps) {
  const runtimeRef = useRef<DecisionSessionRuntime | null>(null);
  if (runtimeRef.current === null) {
    runtimeRef.current = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
  }

  const runtime = runtimeRef.current;
  const [revision, setRevision] = useState(0);

  const dispatch = useCallback(
    (command: RuntimeCommand, now?: number): DispatchResult => {
      const result = runtime.dispatch(command, now ?? Date.now());
      if (result.ok) {
        setRevision((value) => value + 1);
      }
      return result;
    },
    [runtime],
  );

  const value = useMemo((): DecisionSessionRuntimeContextValue => {
    void revision;
    const base = runtime.getExperience();
    if (base === null) {
      throw new Error('DecisionSessionRuntime produced no Experience projection.');
    }
    return {
      runtime,
      experience: projectSynchronizedExperience(base),
      interpretation: runtime.getInterpretation(),
      dispatch,
    };
  }, [dispatch, revision, runtime]);

  return (
    <DecisionSessionRuntimeContext.Provider value={value}>
      {children}
    </DecisionSessionRuntimeContext.Provider>
  );
}

export function useDecisionSessionRuntime(): DecisionSessionRuntimeContextValue {
  const context = useContext(DecisionSessionRuntimeContext);
  if (context === null) {
    throw new Error(
      'useDecisionSessionRuntime must be used within DecisionSessionRuntimeProvider',
    );
  }
  return context;
}
