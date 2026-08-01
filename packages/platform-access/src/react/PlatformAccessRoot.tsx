import type { ReactNode } from 'react';

import type { PlatformStudioId } from '../domain/types';
import { AuthShell } from './AuthShell';
import { PlatformLanding } from './PlatformLanding';
import { SessionProvider, usePlatformSession } from './SessionProvider';

type AccessGateProps = {
  readonly children: ReactNode;
};

/**
 * Auth → Landing → Studio. Builder is no longer the platform entry point.
 */
function AccessGateInner({ children }: AccessGateProps) {
  const { session } = usePlatformSession();

  if (session === null) {
    return <AuthShell />;
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
 * EPIC-BX-14 — wrap each Studio app: Session → Auth → Landing → Studio.
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
