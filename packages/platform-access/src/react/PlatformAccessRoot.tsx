import type { ReactNode } from 'react';
import { useState } from 'react';

import { resolveWorkspaceHostHref } from '../cloud/cloudConfig';
import type { PlatformStudioId } from '../domain/types';
import { getSharedWorkspaceContext, updateSession } from '../session/authService';
import { AuthShell } from './AuthShell';
import { InviteShell } from './InviteShell';
import { WorkspaceStudioNavigation } from './OperatorPartnerEnvironmentBar';
import { PlatformLanding } from './PlatformLanding';
import { SessionProvider, usePlatformSession } from './SessionProvider';

type AccessGateProps = {
  readonly children: ReactNode;
};

function readInviteTokenFromUrl(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('invite') ?? '';
}

/**
 * Auth → Invite → Landing → Studio.
 * OF-13 / OF-14 — CONIS operator Workspace skips Platform Landing.
 */
function AccessGateInner({ children }: AccessGateProps) {
  const { session } = usePlatformSession();
  const urlToken = readInviteTokenFromUrl();
  const [inviteMode, setInviteMode] = useState(urlToken.length > 0);
  const workspaceContext = getSharedWorkspaceContext();

  if (session === null) {
    if (inviteMode) {
      return (
        <InviteShell
          initialToken={urlToken}
          onCancel={() => setInviteMode(false)}
        />
      );
    }
    return <AuthShell onOpenInvite={() => setInviteMode(true)} />;
  }

  if (session.activeStudioId === null) {
    // OF-13A / OF-14 — operator Workspace entry recovers to Client Studio.
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

  const peSurface =
    workspaceContext !== null ? workspaceContext.activeStudio : null;

  return (
    <>
      {peSurface !== null && peSurface !== 'office' ? (
        <WorkspaceStudioNavigation activeSurface={peSurface} />
      ) : null}
      {children}
    </>
  );
}

type PlatformAccessRootProps = {
  readonly studioId: PlatformStudioId;
  readonly children: ReactNode;
};

/**
 * EPIC-BX-14 / BX-15 / OF-12 / OF-13 / OF-14 — Session → Auth/Invite → Landing|Workspace → Studio.
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
