/**
 * VR-04 / VR-005 / PT-VR-06 — Canonical CONIS Workspace Shell.
 * Chrome = PlatformShell only (no duplicated WorkspaceHeader).
 * Studios own their UI — host does not redesign them.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Embed, registerClientStudioCss } from '@embed-engine/embed';
import {
  clearOperatorPartnerEnvironment,
  getSharedWorkspaceContext,
  loadPlatformSession,
  logout as platformLogout,
  PLATFORM_ROLE_LABELS,
  primaryRole,
  projectPartnerBrand,
  resolveCloudStudioHref,
  resolveWorkspaceHostHref,
  switchOperatorPartnerStudio,
  withWorkspaceShellEmbed,
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

function readActiveSurface(): WorkspaceStudioSurface {
  return getSharedWorkspaceContext()?.activeStudio ?? 'client';
}

function studioFrameSrc(
  surface: Exclude<WorkspaceStudioSurface, 'client'>,
): string {
  const ctx = getSharedWorkspaceContext();
  if (surface === 'office') {
    const href =
      ctx?.officeReturnHref?.trim() || resolveCloudStudioHref('office');
    return withWorkspaceShellEmbed(href);
  }
  return withWorkspaceShellEmbed(resolveCloudStudioHref(surface));
}

/** PlatformShell studio id — Client Experience has no PlatformStudioId. */
function platformStudioIdForSurface(
  surface: WorkspaceStudioSurface,
): PlatformStudioId {
  if (surface === 'client') return 'office';
  return surface;
}

/**
 * Shared Workspace Shell — hosts studios without modifying their layouts.
 * Top chrome is PlatformShell only (VR-005).
 */
export function WorkspaceHostApp() {
  const [surface, setSurface] = useState<WorkspaceStudioSurface>(readActiveSurface);
  const clientMountedRef = useRef(false);
  const ctx = getSharedWorkspaceContext();
  const session = loadPlatformSession();

  const brand = useMemo(
    () =>
      projectPartnerBrand({
        companyId: ctx?.companyId ?? null,
      }),
    [ctx?.companyId],
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
    if (surface !== 'client') {
      if (clientMountedRef.current) {
        Embed.unmount(`#${CLIENT_MOUNT_ID}`);
        clientMountedRef.current = false;
      }
      return;
    }

    const target = document.getElementById(CLIENT_MOUNT_ID);
    if (target === null) return;
    if (clientMountedRef.current) return;

    Embed.mount({
      mode: 'standalone',
      target: `#${CLIENT_MOUNT_ID}`,
      objectId: 'house-modern-01',
      hostId: 'conis-workspace-host',
      entryPoint: 'workspace-host',
    });
    clientMountedRef.current = true;

    return () => {
      if (clientMountedRef.current) {
        Embed.unmount(`#${CLIENT_MOUNT_ID}`);
        clientMountedRef.current = false;
      }
    };
  }, [surface]);

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
      ? (ctx.projectId || 'Projekt')
      : ctx.projectId;

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
              src={studioFrameSrc(surface)}
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
