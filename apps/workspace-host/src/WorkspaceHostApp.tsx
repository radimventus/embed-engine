/**
 * ARCH-01 / OF-14A — CONIS Workspace Host shell.
 * Shared Workspace chrome only: studio switcher + active Client Studio surface.
 * No partner landing, no Reference Hero entry, no Embed launcher.
 */

import { useEffect, useRef } from 'react';

import { Embed, registerClientStudioCss } from '@embed-engine/embed';
import {
  getSharedWorkspaceContext,
  resolveCloudStudioHref,
  WorkspaceStudioNavigation,
} from '@embed-engine/platform-access';

import clientStudioCss from '../../client-studio/src/index.css?inline';

registerClientStudioCss(clientStudioCss);

const CLIENT_MOUNT_ID = 'workspace-host-client-root';

/**
 * Operator Workspace — Client Studio is the default surface.
 * Partner path stays on the separate Client Embed Host.
 */
export function WorkspaceHostApp() {
  const mountedRef = useRef(false);

  useEffect(() => {
    const context = getSharedWorkspaceContext();
    if (context === null) {
      window.location.replace(resolveCloudStudioHref('office'));
      return;
    }

    if (mountedRef.current) return;
    mountedRef.current = true;

    document.documentElement.dataset.conisWorkspaceHost = '1';

    Embed.mount({
      mode: 'standalone',
      target: `#${CLIENT_MOUNT_ID}`,
      objectId: 'house-modern-01',
      hostId: 'conis-workspace-host',
      entryPoint: 'workspace-host',
    });

    return () => {
      Embed.unmount(`#${CLIENT_MOUNT_ID}`);
      delete document.documentElement.dataset.conisWorkspaceHost;
      mountedRef.current = false;
    };
  }, []);

  if (getSharedWorkspaceContext() === null) {
    return (
      <p className="workspace-host__redirect" data-testid="workspace-host-redirect">
        Přesměrování do Office Studio…
      </p>
    );
  }

  return (
    <div
      className="workspace-host"
      data-testid="workspace-host"
      data-conis-workspace-host=""
    >
      <WorkspaceStudioNavigation activeSurface="client" />
      <div
        id={CLIENT_MOUNT_ID}
        className="workspace-host__client"
        data-testid="workspace-host-client-root"
      />
    </div>
  );
}
