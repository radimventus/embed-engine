import type { ReactNode } from 'react';
import { useState } from 'react';

import type { PlatformStudioId } from '../domain/types';
import { getOperatorPartnerEnvironment } from '../pilot/operatorPartnerEnvironment';
import { AuthShell } from './AuthShell';
import { InviteShell } from './InviteShell';
import { OperatorPartnerEnvironmentBar } from './OperatorPartnerEnvironmentBar';
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
): 'client' | 'manager' | 'sales' | null {
  if (studioId === 'manager') return 'manager';
  if (studioId === 'sales') return 'sales';
  return null;
}

/**
 * Auth → Invite → Landing → Studio. Platform Shell is the entry (BX-14/15).
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
    return <PlatformLanding />;
  }

  const peSurface =
    operatorPe !== null
      ? operatorSurfaceForStudio(session.activeStudioId)
      : null;

  return (
    <>
      {peSurface !== null ? (
        <OperatorPartnerEnvironmentBar activeSurface={peSurface} />
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
 * EPIC-BX-14 / BX-15 / OF-12 — wrap each Studio app: Session → Auth/Invite → Landing → Studio.
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
