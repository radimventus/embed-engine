/**
 * ARCH-01 — CONIS Workspace Host entry.
 * Operator path only — partner journey stays on Client Embed Host (:4173).
 * VR-05 — never dump a failed Workspace entry onto Office Platform Switcher.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import {
  createPlatformAccessAuthClient,
  enterOperatorPartnerEnvironmentAuthoritatively,
  getSharedWorkspaceContext,
  loadPlatformSession,
  resolveCloudStudioHref,
  resolveWorkspaceHostHref,
  restoreAuthenticatedPartnerEnvironment,
  restoreSession,
  savePlatformSession,
} from '@embed-engine/platform-access';
import '@embed-engine/platform-access/styles.css';
import '@embed-engine/platform-shell/styles.css';

import { WorkspaceHostApp } from './WorkspaceHostApp';
import './workspace-host.css';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Workspace Host root element is missing');
}

const root = rootElement;

async function bootstrapWorkspaceHost(): Promise<void> {
  try {
    const restored = await createPlatformAccessAuthClient().restoreSession();
    if (restored !== null) {
      savePlatformSession(restored);
    }
  } catch {
    // Fall through to the local durable session restore.
  }

  const session = restoreSession() ?? loadPlatformSession();

  if (session !== null) {
    const requiresAuthoritativePartnerEnvironment =
      session.workspaceContext === null ||
      session.activeHouseId === null;

    restoreAuthenticatedPartnerEnvironment();

    if (requiresAuthoritativePartnerEnvironment) {
      const restoredContext = getSharedWorkspaceContext();

      if (restoredContext !== null) {
        const initialSurface =
          restoredContext.activeStudio === 'office'
            ? 'client'
            : restoredContext.activeStudio;

        const authoritativeResult =
          await enterOperatorPartnerEnvironmentAuthoritatively({
            companyId: restoredContext.companyId,
            workspaceId: restoredContext.workspaceId,
            projectId: restoredContext.projectId,
            officePartnerId: restoredContext.partnerId,
            officeReturnHref: restoredContext.officeReturnHref,
            initialSurface,
            navigate: false,
          });

        if (!authoritativeResult.ok) {
          console.error(
            'Workspace cold Partner Environment reconciliation failed:',
            authoritativeResult.error,
          );
        }
      }
    }
    createRoot(root).render(
      <StrictMode>
        <WorkspaceHostApp />
      </StrictMode>,
    );
    return;
  }

  const officeHref = resolveCloudStudioHref('office');
  createRoot(root).render(
    <StrictMode>
      <div className="workspace-host__redirect" data-testid="workspace-host-missing-session">
        <p>Workspace Host vyžaduje přihlášení.</p>
        <p>
          <a href={officeHref}>Otevřít Office Studio</a>
          {' · '}
          <a href={resolveWorkspaceHostHref()}>Zkusit znovu</a>
        </p>
      </div>
    </StrictMode>,
  );
}

void bootstrapWorkspaceHost();
