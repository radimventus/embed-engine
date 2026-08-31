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
  PlatformAccessRoot,
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

function hasExplicitInviteRoute(): boolean {
  return (
    (new URLSearchParams(window.location.search).get('invite')?.trim().length ?? 0) >
    0
  );
}

async function bootstrapWorkspaceHost(): Promise<void> {
  // TASK-80 / VR-FIX-01
  // A bearer invite is an explicit activation route. Workspace Host normally
  // performs its durable-session bootstrap before rendering Platform Access,
  // so the invite must be intercepted here first. This keeps the established
  // cold-session restore path untouched for every non-invite Workspace entry.
  if (hasExplicitInviteRoute()) {
    createRoot(root).render(
      <StrictMode>
        <PlatformAccessRoot studioId="manager">
          <WorkspaceHostApp />
        </PlatformAccessRoot>
      </StrictMode>,
    );
    return;
  }

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

    const isConisAdmin = session.user.roles.includes('conis-admin');

    // TASK-42AC / H9 + H1
    // A normal authenticated partner already owns one canonical scope.
    // Cold/private-browser bootstrap restores that scope locally from the
    // durable authenticated session, including the first canonical House.
    //
    // Do not reinterpret that cold restore as an operator ENTER mutation:
    // ENTER is intentionally a CONIS-admin capability on Platform API.
    // Only an actual CONIS admin may perform authoritative PE entry.
    const restoredPartnerContext =
      restoreAuthenticatedPartnerEnvironment();

    if (restoredPartnerContext !== null) {
      const normalizedSession = loadPlatformSession();
      if (normalizedSession !== null) {
        savePlatformSession(normalizedSession);
      }
    }

    if (isConisAdmin && requiresAuthoritativePartnerEnvironment) {
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
            'Workspace admin Partner Environment reconciliation failed:',
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
