import type { ReactNode } from 'react';
import { useState } from 'react';

import type { PlatformStudioId } from '../domain/types';
import { AuthShell } from './AuthShell';
import { InviteShell } from './InviteShell';
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
 * Auth → Invite → Landing → Studio. Platform Shell is the entry (BX-14/15).
 */
function AccessGateInner({ children }: AccessGateProps) {
  const { session } = usePlatformSession();
  const urlToken = readInviteTokenFromUrl();
  const [inviteMode, setInviteMode] = useState(urlToken.length > 0);

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

  return <>{children}</>;
}

type PlatformAccessRootProps = {
  readonly studioId: PlatformStudioId;
  readonly children: ReactNode;
};

/**
 * EPIC-BX-14 / BX-15 — wrap each Studio app: Session → Auth/Invite → Landing → Studio.
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
