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
import {
  getCanonicalHouseRuntimeContext,
  type CanonicalHouseRuntimeContext,
} from '@embed-engine/object-house';
import { loadPublicBuilderHousePackage } from '@embed-engine/object-house/builder-package';
import {
  resolveWorkspaceHouseBinding,
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
import { resolveCanonicalRuntimeBindingFromSession } from './managerCanonicalBind';

/**
 * Context-only transport for Operations Terminal (MSCB-01 / ED-DA-04).
 *
 * Exposes operations projection + command dispatch only.
 * Does not expose raw Runtime, Interpretation, or Client Studio media sync.
 */
export type ManagerStudioRuntimeContextValue =
  | {
      readonly ready: false;
      readonly operations: null;
      readonly dispatch: (
        command: RuntimeCommand,
        now?: number,
      ) => DispatchResult;
      readonly projectId: string | null;
      readonly houseDataMode: 'REFERENCE_DEMO' | 'LIVE_EMPTY' | 'LIVE';
      readonly bootstrapStatus: string | null;
      readonly canonicalHouseContext: CanonicalHouseRuntimeContext | null;
    }
  | {
      readonly ready: true;
      readonly operations: OperationsProjection;
      readonly dispatch: (
        command: RuntimeCommand,
        now?: number,
      ) => DispatchResult;
      readonly projectId: string | null;
      readonly houseDataMode: 'REFERENCE_DEMO' | 'LIVE_EMPTY' | 'LIVE';
      readonly bootstrapStatus: null;
      readonly canonicalHouseContext: CanonicalHouseRuntimeContext | null;
    };

const ManagerStudioRuntimeContext =
  createContext<ManagerStudioRuntimeContextValue | null>(null);

type DecisionSessionRuntimeProviderProps = {
  readonly children: ReactNode;
  /** Tests / specialized hosts may inject a ready Runtime. */
  readonly runtime?: DecisionSessionRuntime;
};

/**
 * Bootstraps Decision Session Runtime for Manager Studio via Canonical Projection Layer.
 * CAP-PLAT-02d.1 / PT-CS-07 — binds only session.projectId (no published-default fallback).
 * Incomplete House Package → working status, never a render throw.
 */
export function DecisionSessionRuntimeProvider({
  children,
  runtime: injectedRuntime,
}: DecisionSessionRuntimeProviderProps) {
  const { session } = usePlatformSession();
  const sessionProjectId = session?.projectId?.trim() ?? '';
  const sessionActiveHouseId = session?.activeHouseId?.trim() || null;
  const workspaceHouseBinding = useMemo(
    () =>
      sessionProjectId.length > 0 && sessionActiveHouseId !== null
        ? resolveWorkspaceHouseBinding({
            projectId: sessionProjectId,
            houseId: sessionActiveHouseId,
          })
        : null,
    [sessionActiveHouseId, sessionProjectId],
  );

  /** CAP-PLAT-02d.1 — Company / Project / House solely via CPL Runtime Binding. */
  const binding = useMemo(
    () =>
      resolveCanonicalRuntimeBindingFromSession(
        sessionProjectId.length > 0 ? sessionProjectId : null,
        workspaceHouseBinding?.runtimeContentAvailable === true
          ? sessionActiveHouseId
          : null,
      ),
    [
      sessionActiveHouseId,
      sessionProjectId,
      workspaceHouseBinding?.runtimeContentAvailable,
    ],
  );

  const runtimeRef = useRef<DecisionSessionRuntime | null>(
    injectedRuntime ?? null,
  );
  const [revision, setRevision] = useState(0);
  const [packageReady, setPackageReady] = useState(
    injectedRuntime !== undefined,
  );
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const projection = binding.project;
  const house = projection?.house ?? null;
  const packagePublicRoot =
    workspaceHouseBinding?.runtimeContentAvailable === false
      ? null
      : binding.packagePublicRoot;
  const runtimeHouseId =
    workspaceHouseBinding?.runtimeContentAvailable === false
      ? null
      : binding.runtimeHouseId;
  const runtimeProjectId =
    workspaceHouseBinding?.projectId ?? binding.runtimeProjectId;
  const houseDataMode = workspaceHouseBinding?.dataMode ?? house?.dataMode ?? 'LIVE_EMPTY';
  const projectId = runtimeProjectId;
  const canonicalHouseContext = useMemo(
    () =>
      runtimeHouseId === null
        ? null
        : getCanonicalHouseRuntimeContext(runtimeHouseId),
    [runtimeHouseId],
  );

  useEffect(() => {
    if (injectedRuntime !== undefined) {
      runtimeRef.current = injectedRuntime;
      setPackageReady(true);
      setBootstrapError(null);
      return;
    }

    if (sessionProjectId.length === 0) {
      runtimeRef.current = null;
      setPackageReady(false);
      setBootstrapError(
        'Vyberte Projekt v Platform session (projectId). Manager nepoužívá výchozí dům.',
      );
      return;
    }

    if (sessionActiveHouseId === null) {
      runtimeRef.current = null;
      setPackageReady(false);
      setBootstrapError(
        `Projekt „${sessionProjectId}“ je vybrán. Vyberte dům / objekt pro provozní projekci.`,
      );
      return;
    }

    if (
      projection === null ||
      house === null ||
      packagePublicRoot === null ||
      runtimeHouseId === null
    ) {
      runtimeRef.current = null;
      setPackageReady(false);
      setBootstrapError(
        `Canonical Projection Layer: projectId „${sessionProjectId}“ nelze svázat (Company / Project / House) nebo chybí House Package root.`,
      );
      return;
    }

    if (canonicalHouseContext !== null) {
      runtimeRef.current = null;
      setPackageReady(false);
      setBootstrapError(null);
      return;
    }

    let cancelled = false;
    setPackageReady(false);
    setBootstrapError(null);
    void loadPublicBuilderHousePackage({
      packagePublicRoot,
      identity: {
        id: house.houseId,
        title: house.name,
        reference: house.slug,
      },
    })
      .then((housePackage) => {
        if (cancelled) return;
        const runtime = createDecisionSessionRuntime({
          housePackage,
          clock: createSystemClock(),
          now: 1,
        });
        if (runtime.getExperience() === null) {
          runtimeRef.current = null;
          setPackageReady(false);
          setBootstrapError(
            `Dům „${house.name}“ (${house.houseId}) · Projekt „${projection.project.name}“ (${runtimeProjectId ?? projection.project.projectId}): House Package je neúplný — chybí Experience projection. Doplňte podklady v Builder Studio.`,
          );
          return;
        }
        runtimeRef.current = runtime;
        setPackageReady(true);
        setBootstrapError(null);
        setRevision((value) => value + 1);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          runtimeRef.current = null;
          setBootstrapError(
            error instanceof Error ? error.message : String(error),
          );
          setPackageReady(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    injectedRuntime,
    packagePublicRoot,
    projection,
    runtimeHouseId,
    runtimeProjectId,
    sessionActiveHouseId,
    sessionProjectId,
    canonicalHouseContext,
  ]);

  const dispatch = useCallback(
    (command: RuntimeCommand, now?: number): DispatchResult => {
      const runtime = runtimeRef.current;
      if (runtime === null) {
        throw new Error('Manager Decision Session Runtime is not ready.');
      }
      const result = runtime.dispatch(command, now);
      if (result.ok) {
        setRevision((value) => value + 1);
      }
      return result;
    },
    [],
  );

  const value = useMemo((): ManagerStudioRuntimeContextValue => {
    void revision;
    if (!packageReady || runtimeRef.current === null) {
      return {
        operations: null,
        ready: false,
        dispatch,
        projectId,
        houseDataMode,
        bootstrapStatus: bootstrapError,
        canonicalHouseContext,
      };
    }
    const runtime = runtimeRef.current;
    const experience = runtime.getExperience();
    if (experience === null) {
      return {
        operations: null,
        ready: false,
        dispatch,
        projectId,
        houseDataMode,
        bootstrapStatus:
          bootstrapError ??
          `Projekt ${projectId ?? '—'}: House Package je neúplný — chybí Experience projection.`,
        canonicalHouseContext,
      };
    }
    return {
      operations: projectOperationsOverview({
        experience,
        session: runtime.getSession(),
      }),
      ready: true,
      dispatch,
      projectId,
      houseDataMode,
      bootstrapStatus: null,
      canonicalHouseContext,
    };
  }, [
    bootstrapError,
    canonicalHouseContext,
    dispatch,
    houseDataMode,
    packageReady,
    projectId,
    revision,
  ]);

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
