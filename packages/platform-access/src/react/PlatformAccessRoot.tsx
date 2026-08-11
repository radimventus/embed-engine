import type { ReactNode } from 'react';
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
import { getSharedWorkspaceContext, updateSession } from '../session/authService';
import { AuthShell } from './AuthShell';
import { InviteShell } from './InviteShell';
import { PlatformLanding } from './PlatformLanding';
import { SessionProvider, usePlatformSession } from './SessionProvider';
import { shouldPrioritizeInviteRoute } from './inviteRouting';

type AccessGateProps = {
  readonly children: ReactNode;
};

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
  const { session } = usePlatformSession();
  hydratePilotFromUrlOnce();
  const urlToken = readInviteTokenFromUrl();
  const [inviteMode, setInviteMode] = useState(urlToken.length > 0);
  const workspaceContext = getSharedWorkspaceContext();
  const shellEmbed = isWorkspaceShellEmbed();
  const dismissInviteRoute = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('invite');
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
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
      <InviteShell
        initialToken={urlToken}
        onCancel={dismissInviteRoute}
      />
    );
  }

  if (session === null) {
    if (inviteMode) {
      return (
        <InviteShell
          initialToken={urlToken}
          onCancel={dismissInviteRoute}
        />
      );
    }
    return <AuthShell onOpenInvite={() => setInviteMode(true)} />;
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

  if (session.activeStudioId === null) {
    if (workspaceContext !== null) {
      updateSession({
        companyId: workspaceContext.companyId,
        workspaceId: workspaceContext.workspaceId,
        projectId: workspaceContext.projectId,
        activeStudioId: 'manager',
        workspaceContext: {
          ...workspaceContext,
          activeStudio: 'client',
        },
      });
      if (typeof window !== 'undefined') {
        window.location.replace(resolveWorkspaceHostHref());
      }
      return null;
    }
    return <PlatformLanding />;
  }

  // Nested Workspace Shell views — content only (no second PE switcher).
  if (shellEmbed) {
    return <>{children}</>;
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
