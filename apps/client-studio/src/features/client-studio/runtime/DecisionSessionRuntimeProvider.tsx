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
  selectCanonicalHouseKnowledge,
  type CanonicalHouseKnowledgeSelection,
} from '@embed-engine/object-house';
import {
  createDecisionSessionRuntime,
  createSystemClock,
  restoreDecisionSession,
  serializeDecisionSession,
  type DecisionSessionRuntime,
  type RuntimeCommand,
  type DispatchResult,
} from '@embed-engine/runtime';
import { RUNTIME_HOUSE_PACKAGE_SOURCE } from '@embed-engine/object-house/builder-package';
import {
  durableCompanyContact,
  resolveWorkspaceHouseBinding,
  resolveCanonicalKnowledgeHouseId,
} from '@embed-engine/platform-access';

import { useOptionalDecisionAnalytics } from '../analytics/DecisionAnalyticsProvider';
import { StudioLoading } from '../foundation/StudioLoading';
import { registerJourneyStageCapture } from '../foundation/journeyStageCapture';
import { bootstrapEvents } from './bootstrapEvents';
import {
  ensureBuilderPackageBootstrapped,
  getBuilderRuntimeHousePackage,
  getNormalizedBuilderHousePackageAssets,
  getBuilderPackagePublicRoot,
} from './builderPackageBootstrap';
import { loadDurableHousePackageOverlay } from './durableHousePackageOverlay';
import { hydrateDurableProjectPrivacy } from './durableProjectPrivacy';
import { hydrateDurableCompanyContact } from './durableCompanyContact';
import {
  persistPublicDecisionSession,
  restorePublicDecisionSession,
  isDurableDecisionCommand,
} from './durableDecisionSessionClient';
import {
  readDecisionSessionPointer,
  writeDecisionSessionPointer,
  type DecisionSessionScope,
} from './decisionSessionPointer';
import {
  readClientBindCandidates,
  listClientHouses,
  resolveClientActiveProjectId,
  resolveClientRuntimeBindingFromCandidates,
} from './clientCanonicalBind';
import { evidenceLog } from './runtimeEvidence';
import {
  projectSynchronizedExperience,
  type SynchronizedExperience,
} from './synchronizedExperience';

/** CAP-PLAT-02c.1a/1b — Runtime Binding: Session/URL IDs → CPL. */
function resolveRuntimeBinding() {
  const candidates = readClientBindCandidates();
  const canonicalBinding = resolveClientRuntimeBindingFromCandidates(candidates);
  const projectId =
    canonicalBinding.runtimeProjectId ??
    resolveClientActiveProjectId(candidates.sessionProjectId);
  const houseId =
    canonicalBinding.runtimeHouseId ??
    candidates.embedObjectId ??
    candidates.sessionHouseId ??
    candidates.workspaceContextHouseId ??
    candidates.urlHouseId;
  const workspaceBinding =
    projectId !== null && houseId !== null
      ? resolveWorkspaceHouseBinding({ projectId, houseId })
      : null;
  return {
    workspaceBinding,
    canonicalBinding:
      workspaceBinding?.runtimeContentAvailable === false
        ? null
        : canonicalBinding,
  };
}

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
  /**
   * Canonical, priority-bounded House knowledge for FAQ, Chat, payoff and
   * personalization. Null means this Runtime House has no canonical mapping.
   */
  readonly houseKnowledge: CanonicalHouseKnowledgeSelection | null;
  readonly analyticsScope: {
    readonly companyId: string;
    readonly projectId: string;
    readonly houseId: string;
  } | null;
  /** Immutable Company identity plus public Partner contact projection. */
  readonly company: {
    readonly companyId: string;
    readonly companyName: string;
    readonly legalName: string | null;
    readonly ico: string | null;
    readonly city: string | null;
    readonly country: string | null;
    readonly email: string | null;
    readonly phone: string | null;
  } | null;
  /** Canonical Project context, including optional Project privacy destination. */
  readonly project: {
    readonly projectId: string;
    readonly privacyUrl?: string;
  } | null;
  /** Durable Decision Session identity for this House-scoped Client journey. */
  readonly decisionSessionId: string | null;
  /** Dispatch Runtime commands (SelectRoom, ChangePriority, …). */
  readonly dispatch: (command: RuntimeCommand, now?: number) => DispatchResult;
};

const DecisionSessionRuntimeContext =
  createContext<DecisionSessionRuntimeContextValue | null>(null);

export function runtimeBindingKey(
  houseId: string | null,
  packagePublicRoot: string | null,
): string | null {
  if (houseId === null || packagePublicRoot === null) {
    return null;
  }
  return `${houseId}::${packagePublicRoot}`;
}

export function isRuntimeReadyForBinding(
  loadedBindingKey: string | null,
  requestedBindingKey: string | null,
): boolean {
  return (
    requestedBindingKey !== null &&
    loadedBindingKey === requestedBindingKey
  );
}

export function isClientContentUnavailable(input: {
  readonly injectedRuntime: boolean;
  readonly hasAuthoringDraftPackage: boolean;
  readonly dataMode: string | null | undefined;
  readonly runtimeHouseId: string | null;
  readonly packagePublicRoot: string | null;
}): boolean {
  return (
    !input.injectedRuntime &&
    !input.hasAuthoringDraftPackage &&
    input.dataMode === 'LIVE_EMPTY' &&
    input.packagePublicRoot === null
  );
}

export function isWorkspaceDraftContentUnavailable(input: {
  readonly runtimeContentAvailable: boolean | undefined;
  readonly authoringDraftPackage: {
    readonly packageRoot: string;
    readonly packagePublicRoot: string;
    readonly name: string;
  } | null;
}): boolean {
  return (
    input.runtimeContentAvailable === false &&
    input.authoringDraftPackage === null
  );
}

export function createClientPackageBindingEvidence(input: {
  readonly canonicalHouseId: string | null;
  readonly workspaceHouseId: string | null;
  readonly runtimeHouseId: string | null;
  readonly canonicalPackagePublicRoot: string | null;
  readonly workspacePackagePublicRoot: string | null;
  readonly resolvedPackagePublicRoot: string | null;
  readonly requestedRuntimeBindingKey: string | null;
  readonly loadedRuntimeBindingKey: string | null;
  readonly runtimeContentAvailable: boolean | null;
  readonly authoringDraftPackage: {
    readonly packageRoot: string;
    readonly packagePublicRoot: string;
    readonly name: string;
  } | null;
  readonly bootstrapRoot: string | null;
  readonly bootstrapState: 'requested' | 'loading' | 'ready' | 'error';
  readonly bootstrapError: string | null;
}): Record<string, unknown> {
  return input;
}

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
 * Publishes EXPERIENCE_READY once after the Experience tree has committed.
 * Delivery Reveal waits on this event — never on DOM polling.
 */
function ExperienceReadyPublisher() {
  useEffect(() => {
    bootstrapEvents.emit('EXPERIENCE_READY');
  }, []);
  return null;
}

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
 *
 * PT-BOOTSTRAP-READY-01: emits RUNTIME_READY / EXPERIENCE_READY on the shared bootstrap bus.
 */
export function DecisionSessionRuntimeProvider({
  children,
  runtime: injectedRuntime,
}: DecisionSessionRuntimeProviderProps) {
  const runtimeRef = useRef<DecisionSessionRuntime | null>(injectedRuntime ?? null);
  const decisionSessionIdRef = useRef<string | null>(null);
  const persistScopeRef = useRef<DecisionSessionScope | null>(null);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [revision, setRevision] = useState(0);
  const [packageReady, setPackageReady] = useState(injectedRuntime !== undefined);
  const [loadedRuntimeBindingKey, setLoadedRuntimeBindingKey] = useState<
    string | null
  >(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const analytics = useOptionalDecisionAnalytics();

  useEffect(() => {
    const refreshEmbedHouseBinding = () => {
      setRevision((value) => value + 1);
    };
    window.addEventListener('embed:house-change', refreshEmbedHouseBinding);
    return () => {
      window.removeEventListener('embed:house-change', refreshEmbedHouseBinding);
    };
  }, []);

  /** CAP-PLAT-04h — Runtime bind House; package from House slice. */
  const runtimeBinding = resolveRuntimeBinding();
  const workspaceDraftBinding =
    isWorkspaceDraftContentUnavailable({
      runtimeContentAvailable:
        runtimeBinding.workspaceBinding?.runtimeContentAvailable,
      authoringDraftPackage:
        runtimeBinding.workspaceBinding?.authoringDraftPackage ?? null,
    })
      ? runtimeBinding.workspaceBinding ?? null
      : null;
  const authoringDraftPackage =
    runtimeBinding.workspaceBinding?.authoringDraftPackage ?? null;
  const projectBind = runtimeBinding.canonicalBinding;
  const runtimeHouseId =
    runtimeBinding.workspaceBinding?.houseId ?? projectBind?.runtimeHouseId ?? null;
  const packagePublicRoot =
    authoringDraftPackage?.packagePublicRoot ?? projectBind?.packagePublicRoot ?? null;
  const clientContentUnavailable = isClientContentUnavailable({
    injectedRuntime: injectedRuntime !== undefined,
    hasAuthoringDraftPackage: authoringDraftPackage !== null,
    dataMode: projectBind?.project?.house?.dataMode,
    runtimeHouseId,
    packagePublicRoot,
  });
  const unavailableHouseId =
    workspaceDraftBinding?.houseId ?? runtimeHouseId;
  const requestedRuntimeBindingKey = runtimeBindingKey(
    runtimeHouseId,
    packagePublicRoot,
  );
  const canonicalKnowledgeHouseId = useMemo(
    () =>
      runtimeHouseId === null
        ? null
        : resolveCanonicalKnowledgeHouseId({
            runtimeHouseId,
            referenceProvenance: projectBind?.project?.house?.referenceProvenance,
          }),
    [projectBind?.project?.house?.referenceProvenance, runtimeHouseId],
  );
  const canonicalHouseContext = useMemo(
    () =>
      canonicalKnowledgeHouseId === null
        ? null
        : getCanonicalHouseRuntimeContext(canonicalKnowledgeHouseId),
    [canonicalKnowledgeHouseId],
  );

  useEffect(() => {
    if (injectedRuntime !== undefined) {
      runtimeRef.current = injectedRuntime;
      decisionSessionIdRef.current = null;
      persistScopeRef.current = null;
      setPackageReady(true);
      setLoadedRuntimeBindingKey(requestedRuntimeBindingKey);
      setBootstrapError(null);
      bootstrapEvents.emit('RUNTIME_READY');
      return;
    }

    const binding = resolveRuntimeBinding();
    if (
      isWorkspaceDraftContentUnavailable({
        runtimeContentAvailable:
          binding.workspaceBinding?.runtimeContentAvailable,
        authoringDraftPackage:
          binding.workspaceBinding?.authoringDraftPackage ?? null,
      })
    ) {
      runtimeRef.current = null;
      setPackageReady(false);
      setLoadedRuntimeBindingKey(null);
      setBootstrapError(null);
      return;
    }
    const draftPackage = binding.workspaceBinding?.authoringDraftPackage ?? null;
    const projection = binding.canonicalBinding?.project ?? null;
    const root = draftPackage?.packagePublicRoot ??
      binding.canonicalBinding?.packagePublicRoot ??
      null;
    const canonicalHouseId =
      binding.workspaceBinding?.houseId ??
      binding.canonicalBinding?.runtimeHouseId ??
      null;
    const emitBindingEvidence = (
      bootstrapState: 'requested' | 'loading' | 'ready' | 'error',
      bootstrapErrorValue: string | null,
      loadedBindingKey: string | null,
    ) => {
      evidenceLog(
        'ClientPackageBinding',
        createClientPackageBindingEvidence({
          canonicalHouseId,
          workspaceHouseId: binding.workspaceBinding?.houseId ?? null,
          runtimeHouseId: canonicalHouseId,
          canonicalPackagePublicRoot:
            binding.canonicalBinding?.packagePublicRoot ?? null,
          workspacePackagePublicRoot: draftPackage?.packagePublicRoot ?? null,
          resolvedPackagePublicRoot: root,
          requestedRuntimeBindingKey: runtimeBindingKey(canonicalHouseId, root),
          loadedRuntimeBindingKey: loadedBindingKey,
          runtimeContentAvailable:
            binding.workspaceBinding?.runtimeContentAvailable ?? null,
          authoringDraftPackage: draftPackage,
          bootstrapRoot: root,
          bootstrapState,
          bootstrapError: bootstrapErrorValue,
        }),
      );
    };

    if (
      root === null ||
      (draftPackage === null && (projection === null || projection.house === null))
    ) {
      setPackageReady(false);
      setLoadedRuntimeBindingKey(null);
      setBootstrapError(
        canonicalHouseId !== null
          ? `Shared Project Runtime: unknown houseId "${canonicalHouseId}".`
          : 'Shared Project Runtime: no published House available for Client.',
      );
      return;
    }

    bootstrapEvents.emit('BOOTSTRAP_LOADING');
    emitBindingEvidence('loading', null, null);
    runtimeRef.current = null;
    decisionSessionIdRef.current = null;
    persistScopeRef.current = null;
    setPackageReady(false);
    setLoadedRuntimeBindingKey(null);

    let cancelled = false;
    const controller = new AbortController();
    void (async () => {
      const canonicalProjectId = projection?.project.projectId ?? null;
      const canonicalCompanyId = projection?.partner.companyId ?? null;
      if (canonicalProjectId !== null) {
        await hydrateDurableProjectPrivacy(
          canonicalProjectId,
          controller.signal,
        );
      }
      if (canonicalCompanyId !== null) {
        await hydrateDurableCompanyContact(
          canonicalCompanyId,
          controller.signal,
        );
      }
      let durableOverlay = null;
      if (canonicalHouseId !== null) {
        try {
          durableOverlay = await loadDurableHousePackageOverlay(
            canonicalHouseId,
            controller.signal,
          );
        } catch (error) {
          if (!controller.signal.aborted) {
            console.warn(
              '[ClientStudio] Persisted House Package unavailable; using seed package',
              { houseId: canonicalHouseId, error },
            );
          }
        }
      }
      await ensureBuilderPackageBootstrapped(
        root,
        {
          identity: {
            id: canonicalHouseId ?? '',
            title: draftPackage?.name ?? projection?.house?.name ?? '',
            reference: projection?.house?.slug ?? canonicalHouseId ?? '',
          },
        },
        durableOverlay ?? undefined,
      );
      if (cancelled) {
        return;
      }
      const housePackage = getBuilderRuntimeHousePackage();
      const scope: DecisionSessionScope | null =
        canonicalCompanyId !== null &&
        canonicalProjectId !== null &&
        canonicalHouseId !== null
          ? {
              companyId: canonicalCompanyId,
              projectId: canonicalProjectId,
              houseId: canonicalHouseId,
            }
          : null;
      let restoredSession = undefined;
      let decisionSessionId = crypto.randomUUID();
      if (scope !== null) {
        const pointer = readDecisionSessionPointer(scope);
        if (pointer !== null) {
          const record = await restorePublicDecisionSession({
            decisionSessionId: pointer,
            scope,
            signal: controller.signal,
          });
          if (record !== null) {
            const restored = restoreDecisionSession(record.serialized);
            if (
              restored.ok &&
              restored.session.objectId === housePackage.identity.id
            ) {
              restoredSession = restored.session;
              decisionSessionId = pointer;
            }
          } else {
            decisionSessionId = pointer;
          }
        }
        writeDecisionSessionPointer(scope, decisionSessionId);
      }
      runtimeRef.current = createDecisionSessionRuntime({
        housePackage,
        clock: createSystemClock(),
        now: restoredSession?.createdAt ?? 1,
        session: restoredSession,
      });
      decisionSessionIdRef.current = scope === null ? null : decisionSessionId;
      persistScopeRef.current = scope;
      if (scope !== null && runtimeRef.current !== null) {
        const serialized = serializeDecisionSession(runtimeRef.current.getSession());
        if (serialized.ok) {
          void persistPublicDecisionSession({
            decisionSessionId,
            scope,
            serialized: serialized.data,
            signal: controller.signal,
          });
        }
      }
      setPackageReady(true);
      setLoadedRuntimeBindingKey(
        runtimeBindingKey(canonicalHouseId, root),
      );
      setBootstrapError(null);
      emitBindingEvidence(
        'ready',
        null,
        runtimeBindingKey(canonicalHouseId, root),
      );
      setRevision((value) => value + 1);
      bootstrapEvents.emit('RUNTIME_READY');
    })()
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error('[ClientStudio] House package bootstrap failed', {
            houseId: canonicalHouseId,
            packagePublicRoot: root,
            error,
          });
          setBootstrapError(error instanceof Error ? error.message : String(error));
          setPackageReady(false);
          setLoadedRuntimeBindingKey(null);
          emitBindingEvidence(
            'error',
            error instanceof Error ? error.message : String(error),
            null,
          );
        }
      });
    return () => {
      cancelled = true;
      controller.abort();
      if (persistTimerRef.current !== null) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
    };
  }, [
    injectedRuntime,
    packagePublicRoot,
    runtimeHouseId,
    workspaceDraftBinding?.houseId,
    clientContentUnavailable,
    requestedRuntimeBindingKey,
  ]);

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
        if (isDurableDecisionCommand(command.type)) {
          const scope = persistScopeRef.current;
          const decisionSessionId = decisionSessionIdRef.current;
          if (scope !== null && decisionSessionId !== null) {
            const write = () => {
              const serialized = serializeDecisionSession(runtime.getSession());
              if (serialized.ok) {
                void persistPublicDecisionSession({
                  decisionSessionId,
                  scope,
                  serialized: serialized.data,
                });
              }
            };
            if (command.type === 'ChangePriority') {
              if (persistTimerRef.current !== null) {
                clearTimeout(persistTimerRef.current);
              }
              persistTimerRef.current = setTimeout(write, 400);
            } else {
              write();
            }
          }
        }
      }
      return result;
    },
    [analytics],
  );

  useEffect(() => {
    registerJourneyStageCapture((stageId) => {
      if (runtimeRef.current === null) {
        return;
      }
      dispatch({ type: 'EnterJourneyStage', stageId });
    });
    return () => {
      registerJourneyStageCapture(null);
    };
  }, [dispatch]);

  const value = useMemo((): DecisionSessionRuntimeContextValue | null => {
    if (
      !packageReady ||
      runtimeRef.current === null ||
      (injectedRuntime === undefined &&
        !isRuntimeReadyForBinding(
          loadedRuntimeBindingKey,
          requestedRuntimeBindingKey,
        ))
    ) {
      return null;
    }
    void revision;
    const base = runtimeRef.current.getExperience();
    if (base === null) {
      throw new Error('DecisionSessionRuntime produced no Experience projection.');
    }
    return {
      experience: projectSynchronizedExperience(
        base,
        getNormalizedBuilderHousePackageAssets(),
      ),
      ready: true,
      houseKnowledge:
        canonicalHouseContext === null
          ? null
          : selectCanonicalHouseKnowledge(
              canonicalHouseContext,
              base.context.decision.priorityIds,
            ),
      analyticsScope:
        projectBind === null ||
        projectBind.project === null ||
        projectBind.project.house === null
          ? null
          : {
              companyId: projectBind.project.partner.companyId,
              projectId: projectBind.project.project.projectId,
              houseId: projectBind.project.house.houseId,
            },
      company:
        projectBind === null || projectBind.project === null
          ? null
          : (() => {
              const companyId = projectBind.project.partner.companyId;
              const contact = durableCompanyContact(companyId);
              return {
                companyId,
                companyName: projectBind.project.partner.companyName,
                legalName: contact?.legalName ?? null,
                ico: contact?.ico ?? null,
                city: contact?.city ?? null,
                country: contact?.country ?? null,
                email: contact?.email ?? null,
                phone: contact?.phone ?? null,
              };
            })(),
      project:
        projectBind === null || projectBind.project === null
          ? null
          : {
              projectId: projectBind.project.project.projectId,
              privacyUrl: projectBind.project.project.privacyUrl,
            },
      decisionSessionId: decisionSessionIdRef.current,
      dispatch,
    };
  }, [
    dispatch,
    canonicalHouseContext,
    projectBind,
    injectedRuntime,
    loadedRuntimeBindingKey,
    packageReady,
    requestedRuntimeBindingKey,
    revision,
  ]);

  useEffect(() => {
    if (
      value === null ||
      projectBind === null ||
      projectBind.runtimeHouseId === null ||
      projectBind.runtimeProjectId === null
    ) {
      return;
    }
    const root = document.querySelector<HTMLElement>('[data-embed-root]');
    if (root === null) {
      return;
    }
    root.dispatchEvent(
      new CustomEvent('embed:delivery-state', {
        detail: Object.freeze({
          requestedHouseId: root.dataset.objectId ?? null,
          resolvedHouseId: projectBind.runtimeHouseId,
          projectId: projectBind.runtimeProjectId,
          packageRoot: getBuilderPackagePublicRoot(),
          permittedHouses: Object.freeze(
            listClientHouses(projectBind.runtimeProjectId).flatMap((item) =>
              item.house === null
                ? []
                : [{ houseId: item.house.houseId, name: item.house.name }],
            ),
          ),
          normalizedPresentationAssets: getNormalizedBuilderHousePackageAssets(),
          activeHouseId: value.experience.house.id,
          activeRoomId: value.experience.context.activeRoom.id,
        }),
      }),
    );
  }, [projectBind, value]);

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
    /** Global Media Timeline assets — never room-filtered. */
    const globalGalleryAssets = experience.house.media.filter((asset) =>
      asset.id.startsWith('gallery:'),
    );
    const globalVideoAssets = experience.house.media.filter((asset) =>
      asset.id.startsWith('video:'),
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
    console.log(
      `${prefix}global Media Timeline:`,
      {
        videoCount: globalVideoAssets.length,
        photoCount: globalGalleryAssets.length,
        thumbnails: experience.context.roomMedia.thumbnails.map(
          (item, index) => ({ index, kind: item.kind, src: item.src }),
        ),
      },
    );
    if (isEmbed) {
      console.log('Embed active room id:', activeRoomId);
      console.log(
        'Embed gallery assets (global):',
        globalGalleryAssets.map((asset) => ({
          id: asset.id,
          url: asset.url,
          type: asset.type,
        })),
      );
    }
  }, [value]);

  if (
    bootstrapError !== null ||
    workspaceDraftBinding !== null
  ) {
    return (
      <section
        className="grid min-h-screen place-items-center bg-embed-background-primary p-6 text-center"
        data-testid="client-workspace-draft-empty"
        data-client-runtime-unavailable=""
      >
        <div>
          <h1 className="text-xl font-semibold text-embed-brand-navy">
            {unavailableHouseId ?? 'Dům'}
          </h1>
          <p className="mt-2 text-embed-brand-navy/70">
            Experience zatím není připravená.
          </p>
        </div>
      </section>
    );
  }

  if (value === null) {
    return <StudioLoading label="Připravuji prostředí…" />;
  }

  return (
    <DecisionSessionRuntimeContext.Provider value={value}>
      <ExperienceReadyPublisher />
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
