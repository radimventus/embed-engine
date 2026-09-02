/**
 * VR-04 / VR-005 / PT-VR-06 — Canonical CONIS Workspace Shell.
 * Chrome = PlatformShell only (no duplicated WorkspaceHeader).
 * Studios own their UI — host does not redesign them.
 */

import {
  SelectPilotProgramCta,
  ensureCanonicalProjectAuthority,
} from '@embed-engine/platform-access';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode} from 'react';

import { Embed, registerClientStudioCss } from '@embed-engine/embed';
import {
  clearOperatorPartnerEnvironment,
  createPlatformAccessAuthClient,
  isHouseInProject,
  isWorkspaceHouseChangeMessage,
  isWorkspaceHouseScopeRequestMessage,
  isWorkspaceProjectChangeMessage,
  getSharedWorkspaceContext,
  getCanonicalProject,
  isCanonicalProjectId,
  loadPlatformSession,
  logout as platformLogout,
  PLATFORM_ROLE_LABELS,
  primaryRole,
  projectPartnerBrand,
  resolveCloudStudioHref,
  resolveMountProjectView,
  resolveWorkspaceHouseBinding,
  resolveWorkspaceHostHref,
  savePlatformSession,
  finishWelcomeJourney,
  switchOperatorPartnerStudio,
  updateSession,
  withWorkspaceShellEmbed,
  WORKSPACE_HOUSE_CHANGE_MESSAGE_TYPE,
  WORKSPACE_STUDIO_LABELS,
  workspaceStudiosForRoles,
  type WorkspaceStudioSurface,
} from '@embed-engine/platform-access';
import {
  buildPlatformWorkspaceState,
  buildWorkspaceBreadcrumb,
  PlatformShell,
  type PlatformBreadcrumbItem,
  type PlatformStudioId,
} from '@embed-engine/platform-shell';

import clientStudioCss from '../../client-studio/src/index.css?inline';


type WorkspaceEntryStage = 'heslo' | 'start';
registerClientStudioCss(clientStudioCss);

const CLIENT_MOUNT_ID = 'workspace-host-client-root';
const WORKSPACE_SCOPE_WRITER_SURFACES = [
  'builder',
  'manager',
  'sales',
  'client',
] as const;

type AuthoritativeMutationResult = {
  readonly ok: boolean;
  readonly error?: string;
  readonly projectId?: string | null;
  readonly activeHouseId?: string | null;
};

/** PT-OS-02 / B-02 / B-03 — bind iframe studios to Shared Project from session. */
function withProjectIdQuery(
  href: string,
  projectId: string | null,
  activeHouseId: string | null,
): string {
  if (projectId === null) return href;
  try {
    const url = new URL(href);
    url.searchParams.set('projectId', projectId);
    if (activeHouseId !== null) {
      url.searchParams.set('houseId', activeHouseId);
    }
    return url.toString();
  } catch {
    const join = href.includes('?') ? '&' : '?';
    const projectQuery = `projectId=${encodeURIComponent(projectId)}`;
    const houseQuery =
      activeHouseId === null
        ? ''
        : `&houseId=${encodeURIComponent(activeHouseId)}`;
    return `${href}${join}${projectQuery}${houseQuery}`;
  }
}

function studioFrameSrc(
  surface: Exclude<WorkspaceStudioSurface, 'client'>,
  projectId: string | null,
  activeHouseId: string | null,
): string {
  return withWorkspaceShellEmbed(
    withProjectIdQuery(
      resolveCloudStudioHref(surface),
      projectId,
      surface === 'office' ? null : activeHouseId,
    ),
  );
}

/** PlatformShell studio id — Client is a first-class switcher surface (PT-OS-02). */
function WorkspaceStudioFrame({
  surface,
  projectId,
  activeHouseId,
}: {
  readonly surface: Exclude<WorkspaceStudioSurface, 'client'>;
  readonly projectId: string | null;
  readonly activeHouseId: string | null;
}) {
  const [src] = useState(() =>
    studioFrameSrc(surface, projectId, activeHouseId),
  );

  return (
    <iframe
      className="workspace-shell__view workspace-shell__frame"
      title={WORKSPACE_STUDIO_LABELS[surface]}
      src={src}
      data-testid={`workspace-shell-frame-${surface}`}
    />
  );
}

function partnerCommercialJourneyFrameSrc(
  projectId: string | null,
): string {
  const base = resolveCloudStudioHref('office');
  const url = new URL(
    withWorkspaceShellEmbed(
      withProjectIdQuery(base, projectId, null),
    ),
  );
  url.searchParams.set('partnerJourney', '1');
  return url.toString();
}

function PartnerCommercialJourneyFrame({
  projectId,
}: {
  readonly projectId: string | null;
}) {
  return (
    <iframe
      className="workspace-shell__view workspace-shell__frame"
      title="Pilotní program"
      src={partnerCommercialJourneyFrameSrc(projectId)}
      data-testid="workspace-partner-commercial-journey"
      style={{
        width: '100%',
        height: 'calc(100vh - 64px)',
        minHeight: 'calc(100vh - 64px)',
        border: 0,
        display: 'block',
      }}
    />
  );
}

function platformStudioIdForSurface(
  surface: WorkspaceStudioSurface,
): PlatformStudioId {
  return surface;
}

const PARTNER_WORKSPACE_STUDIOS = [
  'client',
  'sales',
  'manager',
] as const satisfies readonly WorkspaceStudioSurface[];

function partnerWorkspaceStudiosForRoles(
  roles: Parameters<typeof workspaceStudiosForRoles>[0],
): readonly WorkspaceStudioSurface[] {
  const authorized = new Set(
    workspaceStudiosForRoles(roles),
  );

  return PARTNER_WORKSPACE_STUDIOS.filter(
    (studio) => authorized.has(studio),
  );
}

function task42Trace(
  event: string,
  detail: Record<string, unknown> = {},
): void {
  if (
    typeof window === 'undefined' ||
    new URLSearchParams(window.location.search).get('task42trace') !== '1'
  ) {
    return;
  }

  const session = loadPlatformSession();
  const context = getSharedWorkspaceContext();

  console.info('[TASK-42-TRACE]', event, {
    at: new Date().toISOString(),
    session: session === null
      ? null
      : {
          projectId: session.projectId,
          activeHouseId: session.activeHouseId,
          activeStudioId: session.activeStudioId,
        },
    workspaceContext: context === null
      ? null
      : {
          projectId: context.projectId,
          activeHouseId: context.activeHouseId,
          activeStudio: context.activeStudio,
        },
    ...detail,
  });
}

function authoritativeStudioForSurface(
  surface: WorkspaceStudioSurface,
): 'client' | 'builder' | 'manager' | 'sales' {
  return surface === 'builder' ||
    surface === 'manager' ||
    surface === 'sales' ||
    surface === 'client'
    ? surface
    : 'client';
}

/**
 * Shared Workspace Shell — hosts studios without modifying their layouts.
 * Top chrome is PlatformShell only (VR-005).
 */

export function WorkspaceHostEntryShell({
  stage,
  children,
}: {
  readonly stage: WorkspaceEntryStage;
  readonly children: ReactNode;
}) {
  const session = loadPlatformSession();
  const ctx = getSharedWorkspaceContext();

  const projectId =
    session?.projectId ??
    ctx?.projectId ??
    null;

  const canonicalProject =
    projectId !== null
      ? getCanonicalProject(projectId)
      : null;

  const projectLabel =
    canonicalProject?.project.name ??
    projectId ??
    'Projekt';

  const projectSlug =
    canonicalProject?.project.slug ??
    null;

  const workspaceState = buildPlatformWorkspaceState({
    companyLabel:
      session?.companyId ??
      ctx?.companyId ??
      'Partner',
    projectLabel,
    projects: [],
  });

  const sectionLabel =
    stage === 'heslo'
      ? 'Aktivace'
      : 'START';

  const entryStudios =
    stage === 'start' && session !== null
      ? partnerWorkspaceStudiosForRoles(session.user.roles)
      : [];

  const handleEntryStudioSelect = async (
    studioId: PlatformStudioId,
  ): Promise<void> => {
    if (
      stage !== 'start' ||
      session === null ||
      (
        studioId !== 'client' &&
        studioId !== 'sales' &&
        studioId !== 'manager'
      ) ||
      !entryStudios.includes(studioId)
    ) {
      return;
    }

    // Same START lifecycle authority as the Welcome cards:
    // complete Welcome synchronously before any async persistence.
    finishWelcomeJourney(session.user.email);

    const nextLocal = updateSession({
      activeStudioId: studioId === 'client' ? null : studioId,
      workspaceContext:
        session.workspaceContext === null
          ? session.workspaceContext
          : {
              ...session.workspaceContext,
              activeStudio: studioId,
            },
    });

    const nextSession = nextLocal ?? session;

    if (nextSession.projectId !== null) {
      try {
        const persisted =
          await createPlatformAccessAuthClient().mutateSessionContext({
            action: 'switch',
            activeStudio: studioId,
            projectId: nextSession.projectId,
            activeHouseId: nextSession.activeHouseId,
            authoredHouseIdentities:
              nextSession.workspaceContext?.authoredHouseIdentities,
          });

        if (persisted.ok) {
          savePlatformSession(persisted.session);
        }
      } catch {
        // Local START handoff remains authoritative for navigation.
      }
    }

    if (typeof window !== 'undefined') {
      const href = new URL(resolveWorkspaceHostHref());
      href.searchParams.set('studio', studioId);
      window.location.assign(href.toString());
    }
  };

  const breadcrumb: readonly PlatformBreadcrumbItem[] =
    projectSlug !== null
      ? buildWorkspaceBreadcrumb({
          projectSlug,
          studioLabel: sectionLabel,
        })
      : [
          { id: 'conis', label: 'CONIS' },
          { id: 'workspace', label: 'Workspace' },
          { id: 'project', label: 'Projekt' },
          { id: 'studio', label: sectionLabel },
        ];

  return (
    <div
      className="workspace-shell"
      data-testid="workspace-host-entry"
      data-workspace-entry-stage={stage}
    >
      <PlatformShell
        activeStudioId="manager"
        availableStudioIds={entryStudios}
        userLabel={
          session?.user.displayName ??
          (stage === 'heslo' ? 'Aktivace účtu' : 'Partner')
        }
        roleLabel={
          session !== null
            ? PLATFORM_ROLE_LABELS[primaryRole(session.user.roles)]
            : 'Partner'
        }
        workspace={workspaceState}
        partnerBrandLabel={null}
        breadcrumb={breadcrumb}
        capabilityHost={null}
        onLogout={() => undefined}
        onOpenLanding={() => undefined}
        onSelectStudio={(studioId) => {
          void handleEntryStudioSelect(studioId);
        }}
        onSubmitFeedback={() => undefined}
      >
        <main
          className="workspace-shell__main"
          data-testid="workspace-shell-entry-main"
        >
          {children}
        </main>
      </PlatformShell>
    </div>
  );
}

export function WorkspaceHostApp() {
  const initialSessionRef = useRef(loadPlatformSession());
  const initialContextRef = useRef(getSharedWorkspaceContext());

  const [surface, setSurface] = useState<WorkspaceStudioSurface>(() => {
    const requestedStudio =
      typeof window === 'undefined'
        ? null
        : new URLSearchParams(window.location.search).get('studio');

    if (
      requestedStudio === 'client' ||
      requestedStudio === 'sales' ||
      requestedStudio === 'manager'
    ) {
      return requestedStudio;
    }

    const sessionStudio =
      initialSessionRef.current?.workspaceContext?.activeStudio ??
      initialSessionRef.current?.activeStudioId ??
      null;

    if (
      sessionStudio === 'client' ||
      sessionStudio === 'sales' ||
      sessionStudio === 'manager'
    ) {
      return sessionStudio;
    }

    return initialContextRef.current?.activeStudio ?? 'client';
  });
  const [partnerJourneyOpen, setPartnerJourneyOpen] = useState(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('journey') === 'pilot',
  );
  const [sharedProjectId, setSharedProjectId] = useState<string | null>(() => {
    const sessionProjectId = initialSessionRef.current?.projectId?.trim() ?? '';
    const contextProjectId = initialContextRef.current?.projectId?.trim() ?? '';

    if (
      sessionProjectId.length > 0 &&
      isCanonicalProjectId(sessionProjectId)
    ) {
      return sessionProjectId;
    }

    if (
      contextProjectId.length > 0 &&
      isCanonicalProjectId(contextProjectId)
    ) {
      return contextProjectId;
    }

    return null;
  });
  const [sharedActiveHouseId, setSharedActiveHouseId] = useState<string | null>(
    () => {
      const session = initialSessionRef.current;
      const context = initialContextRef.current;
      const projectId =
        session?.projectId ??
        context?.projectId ??
        null;
      const houseId =
        session?.activeHouseId ??
        context?.activeHouseId ??
        null;
      return projectId !== null &&
        houseId !== null &&
        isHouseInProject(houseId, projectId)
        ? houseId
        : null;
    },
  );
  const clientMountedRef = useRef(false);
  const clientObjectIdRef = useRef<string | null>(null);
  const clientFinalDisposeTimerRef = useRef<number | null>(null);
  const ctx = getSharedWorkspaceContext();
  const session = loadPlatformSession();

  const effectiveCompanyId = session?.companyId ?? ctx?.companyId ?? null;
  const effectiveProjectId = session?.projectId ?? ctx?.projectId ?? null;
  const authoritativeMutationQueueRef = useRef<Promise<AuthoritativeMutationResult>>(
    Promise.resolve({ ok: true }),
  );

  const enqueueAuthoritativeMutation = useCallback(
    (
      mutation: Parameters<
        ReturnType<
          typeof createPlatformAccessAuthClient
        >['mutateSessionContext']
      >[0],
    ): Promise<AuthoritativeMutationResult> => {
      const queued = authoritativeMutationQueueRef.current.then(async () => {
        task42Trace('authoritative-mutation:start', { mutation });

        if (
          mutation.action === 'switch' &&
          mutation.projectId !== undefined
        ) {
          const reconciled =
            await ensureCanonicalProjectAuthority(mutation.projectId);

          if (!reconciled.ok) {
            task42Trace('authoritative-mutation:authority-fail', {
              mutation,
              error: reconciled.error,
            });
            return {
              ok: false,
              error: reconciled.error,
            };
          }
        }

        let result;
        try {
          result =
            await createPlatformAccessAuthClient().mutateSessionContext(mutation);
        } catch {
          task42Trace('authoritative-mutation:fail', { mutation });
          return { ok: false, error: 'Platform API se nepodařilo spojit.' };
        }

        if (!result.ok) {
          task42Trace('authoritative-mutation:fail', { mutation });
          return { ok: false, error: result.error };
        }

        task42Trace('authoritative-mutation:response', {
          mutation,
          response: {
            projectId: result.session.projectId,
            activeHouseId: result.session.activeHouseId,
            activeStudioId: result.session.activeStudioId,
            workspaceContextActiveHouseId:
              result.session.workspaceContext?.activeHouseId ?? null,
          },
        });

        savePlatformSession(result.session);
        setSharedProjectId(result.session.projectId);
        setSharedActiveHouseId(result.session.activeHouseId);

        task42Trace('authoritative-mutation:applied', { mutation });
        return {
          ok: true,
          projectId: result.session.projectId,
          activeHouseId: result.session.activeHouseId,
        };
      });

      authoritativeMutationQueueRef.current = queued;
      return queued;
    },
    [],
  );

  useEffect(() => {
    task42Trace('workspace-bootstrap', {
      surface,
      sharedProjectId,
      sharedActiveHouseId,
    });
  }, []);

  const brand = useMemo(
    () =>
      projectPartnerBrand({
        companyId: effectiveCompanyId,
        projectId: sharedProjectId ?? effectiveProjectId,
      }),
    [effectiveCompanyId, effectiveProjectId, sharedProjectId],
  );

  const selectSurface = useCallback(
    async (next: WorkspaceStudioSurface) => {
      setPartnerJourneyOpen(false);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('journey')) {
          url.searchParams.delete('journey');
          window.history.replaceState({}, '', url.toString());
        }
      }

      task42Trace('surface-select:start', {
        from: surface,
        to: next,
      });

      const previousSession = loadPlatformSession();
      const result = switchOperatorPartnerStudio(next, {
        navigate: false,
        retainWorkspace: true,
      });

      task42Trace('surface-select:local-result', {
        from: surface,
        to: next,
        ok: result.ok,
        error: result.ok ? null : result.error,
      });

      if (!result.ok) return;

      const nextSession = loadPlatformSession();

      task42Trace('surface-select:local-session', {
        from: surface,
        to: next,
        projectId: nextSession?.projectId ?? null,
        activeHouseId: nextSession?.activeHouseId ?? null,
        activeStudioId: nextSession?.activeStudioId ?? null,
        workspaceContextActiveStudio:
          nextSession?.workspaceContext?.activeStudio ?? null,
      });

      // TASK-42AC / H2
      // Local role authorization + local session mutation have already
      // succeeded. Reflect the selected Studio immediately; authoritative
      // persistence must not block the visible Workspace surface transition.
      setSurface(next);

      task42Trace('surface-select:applied', {
        from: surface,
        to: next,
      });

      if (nextSession?.projectId !== null && nextSession?.projectId !== undefined) {
        void enqueueAuthoritativeMutation({
          action: 'switch',
          activeStudio: authoritativeStudioForSurface(next),
          projectId: nextSession.projectId,
          activeHouseId: nextSession.activeHouseId,
          authoredHouseIdentities:
            nextSession.workspaceContext?.authoredHouseIdentities,
        }).then((accepted) => {
          if (!accepted.ok && previousSession !== null) {
            savePlatformSession(previousSession);
            setSharedProjectId(previousSession.projectId);
            setSharedActiveHouseId(previousSession.activeHouseId);
            task42Trace('surface-select:persistence-fail', {
              from: surface,
              to: next,
            });
          }
        });
      }
    },
    [enqueueAuthoritativeMutation, surface],
  );

  useEffect(() => {
    const scopeWriterOrigins = new Set(
      WORKSPACE_SCOPE_WRITER_SURFACES.map(
        (studio) => new URL(resolveCloudStudioHref(studio)).origin,
      ),
    );
    const applyHouseChange = (
      houseId: string | null,
      source: 'post-message' | 'direct-client',
    ): void => {
      task42Trace('house-change:received', {
        source,
        houseId,
      });

      const currentContext = getSharedWorkspaceContext();
      if (currentContext === null) return;
      const previousSession = loadPlatformSession();
      const projectId = previousSession?.projectId ?? currentContext.projectId;
      if (
        projectId === null ||
        (houseId !== null && !isHouseInProject(houseId, projectId))
      ) {
        return;
      }
      const next = updateSession({
        activeHouseId: houseId,
        workspaceContext: {
          ...currentContext,
          activeHouseId: houseId,
        },
      });
      if (next !== null) {
        task42Trace('house-change:local-session-updated', {
          source,
          requestedHouseId: houseId,
          resultingProjectId: next.projectId,
          resultingHouseId: next.activeHouseId,
        });

        setSharedProjectId(next.projectId);
        setSharedActiveHouseId(next.activeHouseId);

        if (next.projectId !== null) {
          void enqueueAuthoritativeMutation({
            action: 'switch',
            activeStudio: authoritativeStudioForSurface(surface),
            projectId: next.projectId,
            activeHouseId: next.activeHouseId,
            authoredHouseIdentities:
              next.workspaceContext?.authoredHouseIdentities,
          }).then((accepted) => {
            if (!accepted.ok && previousSession !== null) {
              savePlatformSession(previousSession);
              setSharedProjectId(previousSession.projectId);
              setSharedActiveHouseId(previousSession.activeHouseId);
              task42Trace('house-change:persistence-fail', {
                source,
                requestedHouseId: houseId,
              });
            }
          });
        }
      }
    };
    const onWorkspaceChange = (event: MessageEvent<unknown>) => {
      if (!scopeWriterOrigins.has(event.origin)) return;
      const currentContext = getSharedWorkspaceContext();
      if (currentContext === null) return;

      if (isWorkspaceHouseScopeRequestMessage(event.data)) {
        const replyPort = event.ports[0];
        if (replyPort === undefined) return;
        const projectId =
          loadPlatformSession()?.projectId ?? currentContext.projectId;
        const requestedIdentity = event.data.authoredHouseIdentity;
        const isRequestedAuthoredHouse =
          event.data.houseId !== null &&
          requestedIdentity?.houseId === event.data.houseId &&
          requestedIdentity.canonicalProjectId === projectId &&
          requestedIdentity.status === 'draft' &&
          requestedIdentity.dataMode === 'LIVE_EMPTY';
        const isAllowed =
          projectId !== null &&
          (event.data.houseId === null ||
            isHouseInProject(event.data.houseId, projectId) ||
            isRequestedAuthoredHouse);
        if (!isAllowed) {
          replyPort.postMessage({
            ok: false,
            error: 'House Package není pro tuto relaci povolen.',
          });
          return;
        }
        const authoredHouseIdentities =
          requestedIdentity === undefined
            ? (currentContext.authoredHouseIdentities ?? [])
            : [
                ...(currentContext.authoredHouseIdentities ?? []).filter(
                  (identity) => identity.houseId !== requestedIdentity.houseId,
                ),
                requestedIdentity,
              ];
        const requestedHouseId = event.data.houseId;
        void enqueueAuthoritativeMutation({
          action: 'switch',
          activeStudio: authoritativeStudioForSurface(surface),
          projectId,
          activeHouseId: requestedHouseId,
          authoredHouseIdentities,
        }).then((result) => {
          const accepted =
            result.ok &&
            result.projectId === projectId &&
            result.activeHouseId === requestedHouseId;
          replyPort.postMessage(
            accepted
              ? { ok: true }
              : {
                  ok: false,
                  error:
                    result.error ??
                    'Platform API nepotvrdilo požadovaný House scope.',
                },
          );
        });
        return;
      }

      if (
        isWorkspaceProjectChangeMessage(event.data) &&
        isCanonicalProjectId(event.data.projectId)
      ) {
        task42Trace('project-change:received', {
          projectId: event.data.projectId,
          origin: event.origin,
        });
        const requestedProjectId = event.data.projectId;
        const currentHouseId =
          loadPlatformSession()?.activeHouseId ??
          currentContext.activeHouseId ??
          null;
        const nextActiveHouseId =
          currentHouseId !== null &&
          isHouseInProject(currentHouseId, requestedProjectId)
            ? currentHouseId
            : null;

        const previousSession = loadPlatformSession();
        const next = updateSession({
          projectId: requestedProjectId,
          activeHouseId: nextActiveHouseId,
          workspaceContext: {
            ...currentContext,
            projectId: requestedProjectId,
            activeHouseId: nextActiveHouseId,
          },
        });
        if (next !== null) {
          setSharedProjectId(next.projectId);
          setSharedActiveHouseId(next.activeHouseId);

          if (next.projectId !== null) {
            void enqueueAuthoritativeMutation({
              action: 'switch',
              activeStudio: authoritativeStudioForSurface(surface),
              projectId: next.projectId,
              activeHouseId: next.activeHouseId,
              authoredHouseIdentities:
                next.workspaceContext?.authoredHouseIdentities,
            }).then((accepted) => {
              if (!accepted.ok && previousSession !== null) {
                savePlatformSession(previousSession);
                setSharedProjectId(previousSession.projectId);
                setSharedActiveHouseId(previousSession.activeHouseId);
                task42Trace('project-change:persistence-fail', {
                  projectId: requestedProjectId,
                });
              }
            });
          }
        }
        return;
      }

      if (!isWorkspaceHouseChangeMessage(event.data)) {
        return;
      }
      applyHouseChange(event.data.houseId, 'post-message');
    };
    const onDirectClientHouseChange = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (!isWorkspaceHouseChangeMessage(detail)) return;
      applyHouseChange(detail.houseId, 'direct-client');
    };

    window.addEventListener('message', onWorkspaceChange);
    window.addEventListener(
      WORKSPACE_HOUSE_CHANGE_MESSAGE_TYPE,
      onDirectClientHouseChange,
    );
    return () => {
      window.removeEventListener('message', onWorkspaceChange);
      window.removeEventListener(
        WORKSPACE_HOUSE_CHANGE_MESSAGE_TYPE,
        onDirectClientHouseChange,
      );
    };
  }, [enqueueAuthoritativeMutation, surface]);

  useEffect(() => {
    if (surface !== 'client') {
      if (clientMountedRef.current) {
        Embed.unmount(`#${CLIENT_MOUNT_ID}`);
        clientMountedRef.current = false;
        clientObjectIdRef.current = null;
      }
      return;
    }

    const target = document.getElementById(CLIENT_MOUNT_ID);
    if (target === null) return;

    const view = resolveMountProjectView(
      sharedActiveHouseId ?? sharedProjectId,
    );
    const draftBinding =
      sharedActiveHouseId !== null && sharedProjectId !== null
        ? resolveWorkspaceHouseBinding({
            projectId: sharedProjectId,
            houseId: sharedActiveHouseId,
          })
        : null;
    if (view === null && draftBinding?.authoringDraftPackage === null) {
      return;
    }

    const objectId = sharedActiveHouseId ?? view?.project.id;
    if (objectId === undefined) {
      return;
    }

    if (
      clientMountedRef.current &&
      clientObjectIdRef.current === objectId
    ) {
      return;
    }

    if (clientMountedRef.current) {
      Embed.unmount(`#${CLIENT_MOUNT_ID}`);
      clientMountedRef.current = false;
      clientObjectIdRef.current = null;
    }

    Embed.mount({
      mode: 'standalone',
      target: `#${CLIENT_MOUNT_ID}`,
      objectId,
      hostId: 'conis-workspace-host',
      entryPoint: 'workspace-host',
    });
    clientMountedRef.current = true;
    clientObjectIdRef.current = objectId;

  }, [surface, sharedActiveHouseId, sharedProjectId]);

  useEffect(() => {
    // React development StrictMode intentionally runs effect
    // setup → cleanup → setup once during initial mount.
    // Never synchronously destroy the nested Client React root
    // from that synthetic cleanup while React is still rendering.
    if (clientFinalDisposeTimerRef.current !== null) {
      window.clearTimeout(clientFinalDisposeTimerRef.current);
      clientFinalDisposeTimerRef.current = null;
    }

    return () => {
      clientFinalDisposeTimerRef.current = window.setTimeout(() => {
        if (clientMountedRef.current) {
          Embed.unmount(`#${CLIENT_MOUNT_ID}`);
          clientMountedRef.current = false;
          clientObjectIdRef.current = null;
        }
        clientFinalDisposeTimerRef.current = null;
      }, 0);
    };
  }, []);

  const handleLogout = () => {
    void (async () => {
      clearOperatorPartnerEnvironment();
      try {
        await createPlatformAccessAuthClient().logout();
      } catch {
        // Continue clearing local projection even when the API is unreachable.
      }
      platformLogout();
      window.location.assign(resolveCloudStudioHref('office'));
    })();
  };

  if (session === null) {
    return (
      <p className="workspace-host__redirect" data-testid="workspace-host-redirect">
        Přesměrování do Office Studio…
      </p>
    );
  }

  const authoritativeProjectId =
    sharedProjectId ?? effectiveProjectId;

  const canonicalProject =
    authoritativeProjectId !== null
      ? getCanonicalProject(authoritativeProjectId)
      : null;

  const projectLabel =
    canonicalProject?.project.name ??
    authoritativeProjectId ??
    'Projekt';

  const projectSlug =
    canonicalProject?.project.slug ??
    null;

  const workspaceState = buildPlatformWorkspaceState({
    companyLabel:
      brand.personalized
        ? brand.companyName
        : (effectiveCompanyId ?? 'Partner'),
    projectLabel,
    projects: [],
  });

  const sectionLabel =
    partnerJourneyOpen
      ? 'Pilotní program'
      : surface === 'client'
        ? 'Client Studio'
        : WORKSPACE_STUDIO_LABELS[surface];

  const breadcrumb: readonly PlatformBreadcrumbItem[] =
    projectSlug !== null
      ? buildWorkspaceBreadcrumb({
          projectSlug,
          studioLabel: sectionLabel,
          onOpenWorkspace: () => selectSurface('client'),
        })
      : [
          {
            id: 'conis',
            label: 'CONIS',
            onSelect: () => selectSurface('client'),
          },
          { id: 'workspace', label: 'Workspace' },
          { id: 'project', label: 'Projekt' },
          { id: 'studio', label: sectionLabel },
        ];

  return (
    <div
      className="workspace-shell"
      data-testid="workspace-host"
      data-workspace-surface={surface}
    >
      {!partnerJourneyOpen && (
        <SelectPilotProgramCta variant="bar" />
      )}
      <PlatformShell
        activeStudioId={platformStudioIdForSurface(surface)}
        availableStudioIds={
          partnerJourneyOpen
            ? []
            : partnerWorkspaceStudiosForRoles(session.user.roles)
        }
        userLabel={session.user.displayName}
        roleLabel={PLATFORM_ROLE_LABELS[primaryRole(session.user.roles)]}
        workspace={workspaceState}
        partnerBrandLabel={brand.personalized ? brand.logoLabel : null}
        breadcrumb={breadcrumb}
        capabilityHost={null}
        onLogout={handleLogout}
        onOpenLanding={() => selectSurface('client')}
        onSelectStudio={(studioId) => selectSurface(studioId)}
        onSubmitFeedback={() => {
          // Feedback stays available; Workspace Host has no separate store.
        }}
      >
        <main className="workspace-shell__main" data-testid="workspace-shell-main">
          {partnerJourneyOpen ? (
            <div
              className="workspace-partner-journey"
              data-testid="workspace-partner-journey-shell-content"
            >
              <PartnerCommercialJourneyFrame
                projectId={sharedProjectId}
              />
            </div>
          ) : surface === 'client' ? (
            <div
              id={CLIENT_MOUNT_ID}
              className="workspace-shell__view"
              data-testid="workspace-host-client-root"
              data-client-initial-landing-offset="20"
            />
          ) : (
            <WorkspaceStudioFrame
              key={surface}
              surface={surface}
              projectId={sharedProjectId}
              activeHouseId={sharedActiveHouseId}
            />
          )}
        </main>
      </PlatformShell>
    </div>
  );
}

/** Kept for architecture tests — Workspace Host URL SSOT. */
export function workspaceHostEntryHref(): string {
  return resolveWorkspaceHostHref();
}
