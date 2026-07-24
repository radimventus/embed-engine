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
  createDecisionSessionRuntime,
  createSystemClock,
  type DecisionSessionRuntime,
  type RuntimeCommand,
  type DispatchResult,
} from '@embed-engine/runtime';
import { RUNTIME_HOUSE_PACKAGE_SOURCE } from '@embed-engine/object-house/builder-package';

import { useOptionalDecisionAnalytics } from '../analytics/DecisionAnalyticsProvider';
import {
  ensureBuilderPackageBootstrapped,
  getBuilderRuntimeHousePackage,
} from './builderPackageBootstrap';
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
  /** Availability — true once Builder Package → Runtime HousePackage is ready. */
  readonly ready: boolean;
  /** Dispatch Runtime commands (SelectRoom, ChangePriority, …). */
  readonly dispatch: (command: RuntimeCommand, now?: number) => DispatchResult;
};

const DecisionSessionRuntimeContext =
  createContext<DecisionSessionRuntimeContextValue | null>(null);

type DecisionSessionRuntimeProviderProps = {
  readonly children: ReactNode;
  /**
   * Optional Runtime (tests / specialized hosts only).
   * Production Embed and standalone Client Studio both omit this — Provider creates
   * Runtime from Builder Package import (`projectBuilderImportToHousePackage`).
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
  const [revision, setRevision] = useState(0);
  const [packageReady, setPackageReady] = useState(injectedRuntime !== undefined);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const analytics = useOptionalDecisionAnalytics();

  useEffect(() => {
    if (injectedRuntime !== undefined) {
      runtimeRef.current = injectedRuntime;
      setPackageReady(true);
      setBootstrapError(null);
      return;
    }

    let cancelled = false;
    void ensureBuilderPackageBootstrapped()
      .then(() => {
        if (cancelled) {
          return;
        }
        runtimeRef.current = createDecisionSessionRuntime({
          housePackage: getBuilderRuntimeHousePackage(),
          clock: createSystemClock(),
          now: 1,
        });
        setPackageReady(true);
        setBootstrapError(null);
        setRevision((value) => value + 1);
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
  }, [injectedRuntime]);

  const dispatch = useCallback(
    (command: RuntimeCommand, now?: number): DispatchResult => {
      const runtime = runtimeRef.current;
      if (runtime === null) {
        throw new Error('Decision Session Runtime is not ready.');
      }
      const result = runtime.dispatch(command, now);
      if (result.ok) {
        analytics?.observeDispatch(result);
        setRevision((value) => value + 1);
      }
      return result;
    },
    [analytics],
  );

  const value = useMemo((): DecisionSessionRuntimeContextValue | null => {
    if (!packageReady || runtimeRef.current === null) {
      return null;
    }
    void revision;
    const base = runtimeRef.current.getExperience();
    if (base === null) {
      throw new Error('DecisionSessionRuntime produced no Experience projection.');
    }
    return {
      experience: projectSynchronizedExperience(base),
      ready: true,
      dispatch,
    };
  }, [dispatch, packageReady, revision]);

  // PT-RUNTIME-TRACE-01 / PT-EMBED-RUNTIME-INTEGRATION-01 — live Runtime proof.
  useEffect(() => {
    if (value === null) {
      return;
    }
    const { experience } = value;
    const isEmbed =
      typeof document !== 'undefined' &&
      document.querySelector('[data-embed-root]') !== null;
    const prefix = isEmbed ? 'Embed ' : '';
    const galleryRooms = [
      ...new Set(
        experience.house.media
          .map((asset) => {
            const match = /^gallery:([^:]+):/.exec(asset.id);
            return match?.[1] ?? null;
          })
          .filter((roomId): roomId is string => roomId !== null),
      ),
    ];
    const activeRoomId = experience.context.activeRoom.id;
    const galleryAssets =
      activeRoomId === null
        ? experience.house.media.filter((asset) =>
            asset.id.startsWith('gallery:'),
          )
        : experience.house.media.filter((asset) =>
            asset.id.startsWith(`gallery:${activeRoomId}:`),
          );

    console.log(
      `${prefix}Runtime source:`,
      RUNTIME_HOUSE_PACKAGE_SOURCE,
    );
    console.log(
      `${prefix}rooms:`,
      experience.house.rooms.map((room) => room.id),
    );
    console.log(
      `${prefix}navigation:`,
      experience.context.navigation.rooms.map((room) => room.id),
    );
    console.log(`${prefix}room count:`, experience.house.rooms.length);
    console.log(
      `${prefix}navigation room count:`,
      experience.context.navigation.rooms.length,
    );
    console.log('Gallery rooms:', galleryRooms);
    if (isEmbed) {
      console.log('Embed active room id:', activeRoomId);
      console.log(
        'Embed gallery assets:',
        galleryAssets.map((asset) => ({
          id: asset.id,
          url: asset.url,
          type: asset.type,
        })),
      );
    }
  }, [value]);

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
