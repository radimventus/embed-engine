/**
 * ARCH-01 — CONIS Workspace Host entry.
 * Operator path only — partner journey stays on Client Embed Host (:4173).
 * VR-05 — never dump a failed Workspace entry onto Office Platform Switcher.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import {
  getSharedWorkspaceContext,
  loadPlatformSession,
  resolveCloudStudioHref,
  resolveWorkspaceHostHref,
  restoreSession,
} from '@embed-engine/platform-access';
import '@embed-engine/platform-access/styles.css';
import '@embed-engine/platform-shell/styles.css';

import { WorkspaceHostApp } from './WorkspaceHostApp';
import './workspace-host.css';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Workspace Host root element is missing');
}

const session = restoreSession() ?? loadPlatformSession();
const workspaceContext = getSharedWorkspaceContext();

if (session !== null && workspaceContext !== null) {
  createRoot(rootElement).render(
    <StrictMode>
      <WorkspaceHostApp />
    </StrictMode>,
  );
} else {
  // VR-05 — keep operators off Legacy Platform Studio Switcher (Office-first).
  const officeHref = resolveCloudStudioHref('office');
  createRoot(rootElement).render(
    <StrictMode>
      <div className="workspace-host__redirect" data-testid="workspace-host-missing-context">
        <p>Workspace Host vyžaduje aktivní Partner Environment.</p>
        <p>
          Vraťte se do Office Studio a zvolte <strong>Otevřít Partner Environment</strong>.
        </p>
        <p>
          <a href={officeHref}>Otevřít Office Studio</a>
          {' · '}
          <a href={resolveWorkspaceHostHref()}>Zkusit znovu</a>
        </p>
      </div>
    </StrictMode>,
  );
}
