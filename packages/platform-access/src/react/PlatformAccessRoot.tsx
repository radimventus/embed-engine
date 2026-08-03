import type { ReactNode } from 'react';
import { useState } from 'react';

import { resolveCloudStudioHref } from '../cloud/cloudConfig';
import type { PlatformStudioId } from '../domain/types';
import type { WorkspaceStudioSurface } from '../domain/workspaceStudioNavigation';
import { getOperatorPartnerEnvironment } from '../pilot/operatorPartnerEnvironment';
import { updateSession } from '../session/authService';
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

function operatorSurfaceForStudio(
  studioId: PlatformStudioId,
): WorkspaceStudioSurface | null {
  if (studioId === 'manager') return 'manager';
  if (studioId === 'sales') return 'sales';
  if (studioId === 'builder') return 'builder';
  if (studioId === 'office') return 'office';
  return null;
}

/**
 * Auth → Invite → Landing → Studio.
 * OF-13 — CONIS operator Workspace skips Platform Landing.
 */
function AccessGateInner({ children }: AccessGateProps) {
  const { session } = usePlatformSession();
  const urlToken = readInviteTokenFromUrl();
  const [inviteMode, setInviteMode] = useState(urlToken.length > 0);
  const operatorPe = getOperatorPartnerEnvironment();

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
    // OF-13 — operator Workspace never lands on technical Platform Landing.
    if (operatorPe !== null) {
      updateSession({
        companyId: operatorPe.companyId,
        workspaceId: operatorPe.workspaceId,
        projectId: operatorPe.projectId,
        activeStudioId: 'manager',
      });
      if (typeof window !== 'undefined') {
        window.location.replace(resolveCloudStudioHref('manager'));
      }
      return null;
    }
    return <PlatformLanding />;
  }

  const peSurface =
    operatorPe !== null
      ? operatorSurfaceForStudio(session.activeStudioId)
      : null;

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
 * EPIC-BX-14 / BX-15 / OF-12 / OF-13 — Session → Auth/Invite → Landing|Workspace → Studio.
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
