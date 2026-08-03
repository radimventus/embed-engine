/**
 * ARCH-01 — CONIS Workspace Host entry.
 * Operator path only — partner journey stays on Client Embed Host (:4173).
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import {
  getSharedWorkspaceContext,
  loadPlatformSession,
  resolveCloudStudioHref,
  restoreSession,
} from '@embed-engine/platform-access';
import '@embed-engine/platform-access/styles.css';

import { WorkspaceHostApp } from './WorkspaceHostApp';
import './workspace-host.css';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Workspace Host root element is missing');
}

const session = restoreSession() ?? loadPlatformSession();
const workspaceContext = getSharedWorkspaceContext();

if (session === null || workspaceContext === null) {
  window.location.replace(resolveCloudStudioHref('office'));
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <WorkspaceHostApp />
    </StrictMode>,
  );
}
