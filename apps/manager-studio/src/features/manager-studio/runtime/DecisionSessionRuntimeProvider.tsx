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
  resolveActiveProjectView,
  usePlatformSession,
} from '@embed-engine/platform-access';
import {
  createDecisionSessionRuntime,
  createSystemClock,
  type DecisionSessionRuntime,
  type DispatchResult,
  type RuntimeCommand,
} from '@embed-engine/runtime';

import {
  projectOperationsOverview,
  type OperationsProjection,
} from '../operations/projectOperationsOverview';

/**
 * Context-only transport for Operations Terminal (MSCB-01 / ED-DA-04).
 *
 * Exposes operations projection + command dispatch only.
 * Does not expose raw Runtime, Interpretation, or Client Studio media sync.
 */
export type ManagerStudioRuntimeContextValue = {
  readonly operations: OperationsProjection;
  readonly ready: boolean;
  readonly dispatch: (command: RuntimeCommand, now?: number) => DispatchResult;
  /** PT-PDM-02 — Shared Project id bound for this Runtime session. */
  readonly projectId: string | null;
};

const ManagerStudioRuntimeContext =
  createContext<ManagerStudioRuntimeContextValue | null>(null);

type DecisionSessionRuntimeProviderProps = {
  readonly children: ReactNode;
};

/**
 * Bootstraps certified Decision Session Runtime once for Manager Studio.
 * Injects `createSystemClock()` at the adapter boundary (ED-DA-06).
 * PT-PDM-02 — project identity from Shared Project Runtime; HP Runtime unchanged.
 */
export function DecisionSessionRuntimeProvider({
  children,
}: DecisionSessionRuntimeProviderProps) {
  const { session } = usePlatformSession();
  const projectView = useMemo(
    () => resolveActiveProjectView(session?.projectId ?? null),
    [session?.projectId],
  );

  const runtimeRef = useRef<DecisionSessionRuntime | null>(null);
  if (runtimeRef.current === null) {
    runtimeRef.current = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      clock: createSystemClock(),
      now: 1,
    });
  }

  const runtime = runtimeRef.current;
  const [revision, setRevision] = useState(0);

  const dispatch = useCallback(
    (command: RuntimeCommand, now?: number): DispatchResult => {
      const result = runtime.dispatch(command, now);
      if (result.ok) {
        setRevision((value) => value + 1);
      }
      return result;
    },
    [runtime],
  );

  const value = useMemo((): ManagerStudioRuntimeContextValue => {
    void revision;
    const experience = runtime.getExperience();
    if (experience === null) {
      throw new Error('DecisionSessionRuntime produced no Experience projection.');
    }
    return {
      operations: projectOperationsOverview({
        experience,
        session: runtime.getSession(),
      }),
      ready: true,
      dispatch,
      projectId: projectView?.project.id ?? null,
    };
  }, [dispatch, projectView, revision, runtime]);

  return (
    <ManagerStudioRuntimeContext.Provider value={value}>
      {children}
    </ManagerStudioRuntimeContext.Provider>
  );
}

export function useManagerStudioRuntime(): ManagerStudioRuntimeContextValue {
  const context = useContext(ManagerStudioRuntimeContext);
  if (context === null) {
    throw new Error(
      'useManagerStudioRuntime must be used within DecisionSessionRuntimeProvider',
    );
  }
  return context;
}
