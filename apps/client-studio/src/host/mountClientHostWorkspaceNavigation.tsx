/**
 * OF-14 — Workspace Studio Navigation on the Client Embed host.
 * Shown immediately when Shared Workspace Context is active (cookie),
 * before Experience mounts via Embed.mount.
 */

import { createRoot } from 'react-dom/client';

import {
  getSharedWorkspaceContext,
  WorkspaceStudioNavigation,
} from '@embed-engine/platform-access';
import '@embed-engine/platform-access/styles.css';

const HOST_NAV_ROOT_ID = 'conis-workspace-studio-navigation-host';

export function mountClientHostWorkspaceNavigation(): void {
  if (getSharedWorkspaceContext() === null) return;
  if (typeof document === 'undefined') return;
  if (document.getElementById(HOST_NAV_ROOT_ID) !== null) return;

  const root = document.createElement('div');
  root.id = HOST_NAV_ROOT_ID;
  root.setAttribute('data-testid', 'client-host-workspace-navigation');
  document.body.insertBefore(root, document.body.firstChild);
  createRoot(root).render(<WorkspaceStudioNavigation activeSurface="client" />);
}
