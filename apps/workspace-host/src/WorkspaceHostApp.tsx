/**
 * VR-04 / VR-005 / PT-VR-06 — Canonical CONIS Workspace Shell.
 * Chrome = PlatformShell only (no duplicated WorkspaceHeader).
 * Studios own their UI — host does not redesign them.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Embed, registerClientStudioCss } from '@embed-engine/embed';
import {
  clearOperatorPartnerEnvironment,
  createPlatformAccessAuthClient,
  isHouseInProject,
  isWorkspaceHouseChangeMessage,
  isWorkspaceProjectChangeMessage,
  getSharedWorkspaceContext,
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
  PlatformShell,
  type PlatformBreadcrumbItem,
  type PlatformStudioId,
} from '@embed-engine/platform-shell';

import clientStudioCss from '../../client-studio/src/index.css?inline';

registerClientStudioCss(clientStudioCss);

const CLIENT_MOUNT_ID = 'workspace-host-client-root';
const WORKSPACE_SCOPE_WRITER_SURFACES = [
  'builder',
  'manager',
  'sales',
  'client',
] as const;

function readActiveSurface(): WorkspaceStudioSurface {
  return getSharedWorkspaceContext()?.activeStudio ?? 'client';
}

/** PT-OS-02 / B-02 / B-03 — bind iframe studios to Shared Project from session. */
function boundSharedProjectId(): string | null {
  const session = loadPlatformSession();
  const ctx = getSharedWorkspaceContext();
  const candidates = [session?.projectId, ctx?.projectId];
  for (const candidate of candidates) {
    const id = candidate?.trim() ?? '';
    if (id.length > 0 && isCanonicalProjectId(id)) {
      return id;
    }
  }
  return null;
}

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

function platformStudioIdForSurface(
  surface: WorkspaceStudioSurface,
): PlatformStudioId {
  return surface;
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
export function WorkspaceHostApp() {
  const [surface, setSurface] = useState<WorkspaceStudioSurface>(readActiveSurface);
  const [sharedProjectId, setSharedProjectId] = useState<string | null>(
    boundSharedProjectId,
  );
  const [sharedActiveHouseId, setSharedActiveHouseId] = useState<string | null>(
    () => {
      const projectId = boundSharedProjectId();
      const session = loadPlatformSession();
      const houseId =
        session?.activeHouseId ??
        getSharedWorkspaceContext()?.activeHouseId ??
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
  const authoritativeMutationQueueRef = useRef<Promise<void>>(
    Promise.resolve(),
  );

  const enqueueAuthoritativeMutation = useCallback(
    (
      mutation: Parameters<
        ReturnType<
          typeof createPlatformAccessAuthClient
        >['mutateSessionContext']
      >[0],
    ): Promise<void> => {
      const queued = authoritativeMutationQueueRef.current.then(async () => {
        task42Trace('authoritative-mutation:start', { mutation });

        const result =
          await createPlatformAccessAuthClient().mutateSessionContext(mutation);

        if (!result.ok) {
          task42Trace('authoritative-mutation:fail', { mutation });
          return;
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
      });

      authoritativeMutationQueueRef.current = queued.catch(() => undefined);
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
      task42Trace('surface-select:start', {
        from: surface,
        to: next,
      });

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
      if (nextSession?.projectId !== null && nextSession?.projectId !== undefined) {
        await enqueueAuthoritativeMutation({
          action: 'switch',
          activeStudio: authoritativeStudioForSurface(next),
          projectId: nextSession.projectId,
          activeHouseId: nextSession.activeHouseId,
          authoredHouseIdentities:
            nextSession.workspaceContext?.authoredHouseIdentities,
        });
      }

      setSurface(next);

      task42Trace('surface-select:applied', {
        from: surface,
        to: next,
      });
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
      const projectId = loadPlatformSession()?.projectId ?? currentContext.projectId;
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
          });
        }
      }
    };
    const onWorkspaceChange = (event: MessageEvent<unknown>) => {
      if (!scopeWriterOrigins.has(event.origin)) return;
      const currentContext = getSharedWorkspaceContext();
      if (currentContext === null) return;

      if (
        isWorkspaceProjectChangeMessage(event.data) &&
        isCanonicalProjectId(event.data.projectId)
      ) {
        task42Trace('project-change:received', {
          projectId: event.data.projectId,
          origin: event.origin,
        });
        const currentHouseId =
          loadPlatformSession()?.activeHouseId ??
          currentContext.activeHouseId ??
          null;
        const nextActiveHouseId =
          currentHouseId !== null &&
          isHouseInProject(currentHouseId, event.data.projectId)
            ? currentHouseId
            : null;

        const next = updateSession({
          projectId: event.data.projectId,
          activeHouseId: nextActiveHouseId,
          workspaceContext: {
            ...currentContext,
            projectId: event.data.projectId,
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
    clearOperatorPartnerEnvironment();
    platformLogout();
    window.location.assign(resolveCloudStudioHref('office'));
  };

  if (session === null) {
    return (
      <p className="workspace-host__redirect" data-testid="workspace-host-redirect">
        Přesměrování do Office Studio…
      </p>
    );
  }

  const projectLabel =
    sharedProjectId || effectiveProjectId || 'Projekt';

  const workspaceState = buildPlatformWorkspaceState({
    companyLabel:
      brand.personalized
        ? brand.companyName
        : (effectiveCompanyId ?? 'Partner'),
    projectLabel,
    projects: [],
  });

  const sectionLabel =
    surface === 'client'
      ? 'Client Studio'
      : WORKSPACE_STUDIO_LABELS[surface];

  const breadcrumb: readonly PlatformBreadcrumbItem[] = [
    {
      id: 'conis',
      label: 'CONIS',
      onSelect: () => selectSurface('client'),
    },
    { id: 'workspace', label: 'Workspace' },
    {
      id: 'company',
      label:
        brand.personalized
          ? brand.companyName
          : (effectiveCompanyId ?? 'Partner'),
    },
    { id: 'section', label: sectionLabel },
  ];

  return (
    <div
      className="workspace-shell"
      data-testid="workspace-host"
      data-workspace-surface={surface}
    >
      <PlatformShell
        activeStudioId={platformStudioIdForSurface(surface)}
        availableStudioIds={workspaceStudiosForRoles(session.user.roles)}
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
          {surface === 'client' ? (
            <div
              id={CLIENT_MOUNT_ID}
              className="workspace-shell__view"
              data-testid="workspace-host-client-root"
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
