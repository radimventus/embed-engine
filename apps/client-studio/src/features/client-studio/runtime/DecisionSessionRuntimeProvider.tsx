import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { REFERENCE_HOUSE_PACKAGE } from '@embed-engine/object-house';
import {
  createDecisionSessionRuntime,
  createSystemClock,
  type DecisionSessionRuntime,
  type RuntimeCommand,
  type DispatchResult,
} from '@embed-engine/runtime';

import { useOptionalDecisionAnalytics } from '../analytics/DecisionAnalyticsProvider';
import { ensureBuilderPackageBootstrapped } from './builderPackageBootstrap';
import {
  projectSynchronizedExperience,
  type SynchronizedExperience,
} from './synchronizedExperience';

/**
 * Context-only transport for Decision Session Experience (ED-DA-04).
 *
 * Exposes projected Experience + command dispatch only.
 * Does not expose raw Runtime instance or SessionInterpretation.
 */
export type DecisionSessionRuntimeContextValue = {
  /**
   * Canonical Client Studio Experience (includes `context` presentation contract).
   * UI modules read `experience.context` — never compose semantics here.
   */
  readonly experience: SynchronizedExperience;
  /** Availability — true once Builder Package registries + Experience projection are ready. */
  readonly ready: boolean;
  /** Dispatch Runtime commands (SelectRoom, ChangePriority, …). */
  readonly dispatch: (command: RuntimeCommand, now?: number) => DispatchResult;
};

const DecisionSessionRuntimeContext =
  createContext<DecisionSessionRuntimeContextValue | null>(null);

type DecisionSessionRuntimeProviderProps = {
  readonly children: ReactNode;
  /**
   * Optional Runtime from Embed Delivery Layer.
   * When provided, this instance is the sole semantic authority for the tree.
   * When omitted, the Provider creates exactly one Runtime (standalone SPA).
   */
  readonly runtime?: DecisionSessionRuntime;
};

/**
 * Pure Context Provider — transports Decision Session Runtime state to React.
 *
 * Owns: Runtime instance lifecycle (unless injected), revision notifications, Experience projection call.
 * Does not: compose Interpretation / Story / Moves / Outcome / Terminal / AIContext.
 * Projection helper `projectSynchronizedExperience` is presentation media binding only
 * (ED-DA-02); semantic ownership remains in Runtime.
 *
 * Injects `createSystemClock()` at the adapter boundary (ED-DA-06) when creating Runtime.
 * Runtime never reads the host clock itself.
 *
 * CSCB-08: successful dispatches are observed by Decision Analytics when present.
 * Observation is passive — analytics never feeds back into Runtime.
 */
export function DecisionSessionRuntimeProvider({
  children,
  runtime: injectedRuntime,
}: DecisionSessionRuntimeProviderProps) {
  const runtimeRef = useRef<DecisionSessionRuntime | null>(injectedRuntime ?? null);
  if (runtimeRef.current === null) {
    runtimeRef.current = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      clock: createSystemClock(),
      now: 1,
    });
  }

  const runtime = runtimeRef.current;
  const [revision, setRevision] = useState(0);
  const [packageReady, setPackageReady] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const analytics = useOptionalDecisionAnalytics();

  useEffect(() => {
    let cancelled = false;
    void ensureBuilderPackageBootstrapped()
      .then(() => {
        if (!cancelled) {
          setPackageReady(true);
          setBootstrapError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBootstrapError(error instanceof Error ? error.message : String(error));
          setPackageReady(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dispatch = useCallback(
    (command: RuntimeCommand, now?: number): DispatchResult => {
      // When `now` is omitted, Runtime uses the injected system clock.
      const result = runtime.dispatch(command, now);
      if (result.ok) {
        analytics?.observeDispatch(result);
        setRevision((value) => value + 1);
      }
      return result;
    },
    [analytics, runtime],
  );

  const value = useMemo((): DecisionSessionRuntimeContextValue | null => {
    if (!packageReady) {
      return null;
    }
    void revision;
    const base = runtime.getExperience();
    if (base === null) {
      throw new Error('DecisionSessionRuntime produced no Experience projection.');
    }
    return {
      experience: projectSynchronizedExperience(base),
      ready: true,
      dispatch,
    };
  }, [dispatch, packageReady, revision, runtime]);

  if (bootstrapError !== null) {
    return (
      <div role="alert" data-builder-package-bootstrap-error="">
        Builder House Package bootstrap failed: {bootstrapError}
      </div>
    );
  }

  if (value === null) {
    return null;
  }

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
