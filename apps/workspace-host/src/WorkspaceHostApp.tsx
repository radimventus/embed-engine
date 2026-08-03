/**
 * VR-04 / PT-VR-06 — Canonical CONIS Workspace Shell.
 * Workspace = context only (partner · project · switcher · user).
 * Studios own their UI — host does not redesign them.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Embed, registerClientStudioCss } from '@embed-engine/embed';
import {
  clearOperatorPartnerEnvironment,
  getSharedWorkspaceContext,
  loadPlatformSession,
  logout as platformLogout,
  projectPartnerBrand,
  resolveCloudStudioHref,
  resolveWorkspaceHostHref,
  switchOperatorPartnerStudio,
  withWorkspaceShellEmbed,
  WorkspaceStudioNavigation,
  WORKSPACE_STUDIO_LABELS,
  type WorkspaceStudioSurface,
} from '@embed-engine/platform-access';

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

/**
 * Shared Workspace Shell — hosts studios without modifying their layouts.
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

  const projectLabel = ctx.projectId;

  return (
    <div
      className="workspace-shell"
      data-testid="workspace-host"
      data-workspace-surface={surface}
    >
      <header className="workspace-shell__header" data-testid="workspace-shell-header">
        <div className="workspace-shell__top">
          <div className="workspace-shell__context">
            <p className="workspace-shell__partner" data-testid="workspace-shell-partner">
              {brand.personalized ? brand.companyName : ctx.companyId}
            </p>
            <p className="workspace-shell__project" data-testid="workspace-shell-project">
              Projekt · {projectLabel}
            </p>
          </div>
          <div className="workspace-shell__user">
            <span data-testid="workspace-shell-user">{session.user.displayName}</span>
            <button
              type="button"
              className="workspace-shell__logout"
              onClick={handleLogout}
            >
              Odhlásit
            </button>
          </div>
        </div>
        <WorkspaceStudioNavigation
          activeSurface={surface}
          onSelectSurface={selectSurface}
        />
      </header>

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
    </div>
  );
}

/** Kept for architecture tests — Workspace Host URL SSOT. */
export function workspaceHostEntryHref(): string {
  return resolveWorkspaceHostHref();
}
