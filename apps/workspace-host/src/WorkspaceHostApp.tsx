/**
 * VR-04 / VR-005 / PT-VR-06 — Canonical CONIS Workspace Shell.
 * Chrome = PlatformShell only (no duplicated WorkspaceHeader).
 * Studios own their UI — host does not redesign them.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Embed, registerClientStudioCss } from '@embed-engine/embed';
import {
  clearOperatorPartnerEnvironment,
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
  switchOperatorPartnerStudio,
  updateSession,
  withWorkspaceShellEmbed,
  WORKSPACE_HOUSE_CHANGE_MESSAGE_TYPE,
  WORKSPACE_STUDIO_LABELS,
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
  const ctx = getSharedWorkspaceContext();
  if (surface === 'office') {
    const href =
      ctx?.officeReturnHref?.trim() || resolveCloudStudioHref('office');
    return withWorkspaceShellEmbed(
      withProjectIdQuery(href, projectId, null),
    );
  }
  return withWorkspaceShellEmbed(
    withProjectIdQuery(
      resolveCloudStudioHref(surface),
      projectId,
      activeHouseId,
    ),
  );
}

/** PlatformShell studio id — Client is a first-class switcher surface (PT-OS-02). */
function platformStudioIdForSurface(
  surface: WorkspaceStudioSurface,
): PlatformStudioId {
  return surface;
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
  const ctx = getSharedWorkspaceContext();
  const session = loadPlatformSession();

  const brand = useMemo(
    () =>
      projectPartnerBrand({
        companyId: ctx?.companyId ?? null,
        projectId: sharedProjectId,
      }),
    [ctx?.companyId, sharedProjectId],
  );

  const selectSurface = useCallback((next: WorkspaceStudioSurface) => {
    const result = switchOperatorPartnerStudio(next, {
      navigate: false,
      retainWorkspace: true,
    });
    if (!result.ok) return;
    setSurface(next);
  }, []);

  useEffect(() => {
    const scopeWriterOrigins = new Set(
      WORKSPACE_SCOPE_WRITER_SURFACES.map(
        (studio) => new URL(resolveCloudStudioHref(studio)).origin,
      ),
    );
    const applyHouseChange = (houseId: string | null): void => {
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
        setSharedProjectId(next.projectId);
        setSharedActiveHouseId(next.activeHouseId);
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
        const next = updateSession({
          projectId: event.data.projectId,
          workspaceContext: {
            ...currentContext,
            projectId: event.data.projectId,
          },
        });
        if (next !== null) {
          setSharedProjectId(next.projectId);
          setSharedActiveHouseId(next.activeHouseId);
        }
        return;
      }

      if (!isWorkspaceHouseChangeMessage(event.data)) {
        return;
      }
      applyHouseChange(event.data.houseId);
    };
    const onDirectClientHouseChange = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (!isWorkspaceHouseChangeMessage(detail)) return;
      applyHouseChange(detail.houseId);
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
  }, []);

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

    return () => {
      if (clientMountedRef.current) {
        Embed.unmount(`#${CLIENT_MOUNT_ID}`);
        clientMountedRef.current = false;
        clientObjectIdRef.current = null;
      }
    };
  }, [surface, sharedActiveHouseId, sharedProjectId]);

  const handleLogout = () => {
    clearOperatorPartnerEnvironment();
    platformLogout();
    window.location.assign(resolveCloudStudioHref('office'));
  };

  if (ctx === null || session === null) {
    return (
      <p className="workspace-host__redirect" data-testid="workspace-host-redirect">
        Přesměrování do Office Studio…
      </p>
    );
  }

  const projectLabel =
    brand.personalized && brand.companyName.trim().length > 0
      ? (sharedProjectId || ctx.projectId || 'Projekt')
      : (sharedProjectId || ctx.projectId);

  const workspaceState = buildPlatformWorkspaceState({
    companyLabel: brand.personalized ? brand.companyName : ctx.companyId,
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
      label: brand.personalized ? brand.companyName : ctx.companyId,
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
            <iframe
              key={surface}
              className="workspace-shell__view workspace-shell__frame"
              title={WORKSPACE_STUDIO_LABELS[surface]}
              src={studioFrameSrc(
                surface,
                sharedProjectId,
                sharedActiveHouseId,
              )}
              data-testid={`workspace-shell-frame-${surface}`}
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
