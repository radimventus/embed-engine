import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';

import { resolveWorkspaceHostHref } from '../cloud/cloudConfig';
import type { PlatformStudioId } from '../domain/types';
import {
  isOnWorkspaceHost,
  isWorkspaceShellEmbed,
} from '../domain/workspaceShellEmbed';
import {
  hydratePilotProvisionSnapshot,
  readPilotProvisionFromUrl,
} from '../pilot/pilotProvisionSnapshot';
import { isPilotPartnerRoles } from '../domain/pilotPartnerAccess';
import { shouldShowPartnerWelcome } from '../pilot/welcomeStore';
import { getSharedWorkspaceContext, updateSession } from '../session/authService';
import { AuthShell } from './AuthShell';
import { InviteShell } from './InviteShell';
import { PlatformLanding } from './PlatformLanding';
import { SessionProvider, usePlatformSession } from './SessionProvider';
import { shouldPrioritizeInviteRoute, urlWithoutInviteParam } from './inviteRouting';

type AccessGateProps = {
  readonly children: ReactNode;
};

type WorkspaceEntryStage = 'heslo' | 'start';

const ENTRY_NAVY = '#071b33';
const ENTRY_CREAM = '#efede8';

const entryRootStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#f7f7f6',
  color: ENTRY_NAVY,
};

const entryHeaderStyle: CSSProperties = {
  height: 64,
  boxSizing: 'border-box',
  padding: '0 28px',
  background: ENTRY_NAVY,
  color: '#fff',
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  alignItems: 'center',
  gap: 20,
};

const entryBrandStyle: CSSProperties = {
  fontSize: 16,
  lineHeight: 1,
  fontWeight: 800,
  letterSpacing: '0.31em',
};

const entrySwitcherStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  padding: 4,
  borderRadius: 999,
  background: ENTRY_CREAM,
  color: ENTRY_NAVY,
};

const entrySwitcherItemStyle: CSSProperties = {
  padding: '8px 14px',
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const entryBreadcrumbStyle: CSSProperties = {
  height: 34,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 28px',
  background: '#fff',
  borderBottom: '1px solid #e6e7e8',
  color: '#78879a',
  fontSize: 11,
};

function WorkspaceEntryFrame({
  stage,
  children,
}: {
  readonly stage: WorkspaceEntryStage;
  readonly children: ReactNode;
}) {
  return (
    <div
      style={entryRootStyle}
      data-testid={`workspace-entry-${stage}`}
    >
      <header style={entryHeaderStyle}>
        <div style={entryBrandStyle}>
          CONIS
        </div>

        <nav
          style={entrySwitcherStyle}
          aria-label="CONIS Studio"
        >
          <span style={entrySwitcherItemStyle}>Client studio</span>
          <span style={entrySwitcherItemStyle}>Sales studio</span>
          <span style={entrySwitcherItemStyle}>Manager studio</span>
        </nav>

        <div aria-hidden="true" />
      </header>

      <div style={entryBreadcrumbStyle}>
        <span>CONIS</span>
        <span>/</span>
        <span>Workspace</span>
        <span>/</span>
        <strong style={{ color: ENTRY_NAVY }}>{stage}</strong>
      </div>

      {children}
    </div>
  );
}

function readInviteTokenFromUrl(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('invite') ?? '';
}

function hydratePilotFromUrlOnce(): void {
  if (typeof window === 'undefined') return;
  const flag = 'conis.pilot.hydrate.done';
  try {
    if (sessionStorage.getItem(flag) === window.location.search) return;
  } catch {
    // ignore
  }
  const snapshot = readPilotProvisionFromUrl();
  if (snapshot === null) return;
  hydratePilotProvisionSnapshot(snapshot);
  try {
    sessionStorage.setItem(flag, window.location.search);
  } catch {
    // ignore
  }
}

/**
 * Auth → Invite → Landing → Studio.
 * VR-04 — operator Workspace is a single host; nested embeds skip outer chrome.
 */
function AccessGateInner({ children }: AccessGateProps) {
  const { session, isRestoring } = usePlatformSession();
  hydratePilotFromUrlOnce();
  const urlToken = readInviteTokenFromUrl();
  const [inviteMode, setInviteMode] = useState(urlToken.length > 0);
  const workspaceContext = getSharedWorkspaceContext();
  const shellEmbed = isWorkspaceShellEmbed();
  const dismissInviteRoute = () => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', urlWithoutInviteParam(window.location.href));
    }
    setInviteMode(false);
  };

  // A bearer invite URL is an explicit activation route. It must take
  // precedence over any restored Studio session until InviteShell validates it.
  if (
    shouldPrioritizeInviteRoute({
      inviteToken: urlToken,
      hasRestoredSession: session !== null,
    })
  ) {
    return (
      <WorkspaceEntryFrame stage="heslo">
        <InviteShell
          initialToken={urlToken}
          onCancel={dismissInviteRoute}
          onActivated={dismissInviteRoute}
        />
      </WorkspaceEntryFrame>
    );
  }

  if (isRestoring) {
    return (
      <div className="platform-access" data-testid="platform-session-restoring">
        <p className="platform-access__lead">Obnovuji přihlášení…</p>
      </div>
    );
  }

  if (session === null) {
    if (inviteMode) {
      return (
        <WorkspaceEntryFrame stage="heslo">
          <InviteShell
            initialToken={urlToken}
            onCancel={dismissInviteRoute}
            onActivated={dismissInviteRoute}
          />
        </WorkspaceEntryFrame>
      );
    }
    return <AuthShell onOpenInvite={() => setInviteMode(true)} />;
  }

  // TASK-81 — first successful partner activation enters START before
  // any Studio surface. The pending Welcome Journey is the lifecycle
  // authority prepared by InviteShell during activation.
  if (
    !shellEmbed &&
    isPilotPartnerRoles(session.user.roles) &&
    shouldShowPartnerWelcome(session.user.email)
  ) {
    return (
      <WorkspaceEntryFrame stage="start">
        <PlatformLanding />
      </WorkspaceEntryFrame>
    );
  }

  // VR-04 — PE mode on a standalone studio host redirects into Workspace Host.
  if (
    workspaceContext !== null &&
    !shellEmbed &&
    !isOnWorkspaceHost() &&
    typeof window !== 'undefined'
  ) {
    window.location.replace(resolveWorkspaceHostHref());
    return null;
  }

  // Nested Workspace Shell views are already authenticated by the outer
  // Workspace Host. They must render their requested content directly;
  // otherwise a null activeStudioId incorrectly falls back to PlatformLanding.
  if (shellEmbed) {
    return <>{children}</>;
  }

  if (session.activeStudioId === null) {
    if (workspaceContext !== null) {
      updateSession({
        companyId: workspaceContext.companyId,
        workspaceId: workspaceContext.workspaceId,
        projectId: workspaceContext.projectId,
        activeStudioId: 'manager',
        workspaceContext: {
          ...workspaceContext,
          activeStudio: 'manager',
        },
      });
      if (typeof window !== 'undefined') {
        window.location.replace(resolveWorkspaceHostHref());
      }
      return null;
    }
    return <PlatformLanding />;
  }


  return <>{children}</>;
}

type PlatformAccessRootProps = {
  readonly studioId: PlatformStudioId;
  readonly children: ReactNode;
};

/**
 * EPIC-BX-14 / BX-15 / OF-12 / OF-13 / OF-14 / VR-04 —
 * Session → Auth/Invite → Landing|Workspace Host|Studio.
 */
export function PlatformAccessRoot({
  studioId,
  children,
}: PlatformAccessRootProps) {
  return (
    <SessionProvider bindStudioId={studioId}>
      <AccessGateInner>{children}</AccessGateInner>
    </SessionProvider>
  );
}
