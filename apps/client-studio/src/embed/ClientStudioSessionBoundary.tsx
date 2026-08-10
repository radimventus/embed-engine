import type { ReactNode } from 'react';
import { SessionProvider } from '@embed-engine/platform-access';

type ClientStudioSessionBoundaryProps = {
  readonly children: ReactNode;
};

/** Shared Session tree for every Client mount surface. */
export function ClientStudioSessionBoundary({
  children,
}: ClientStudioSessionBoundaryProps) {
  return (
    <SessionProvider bindStudioId="client">
      {children}
    </SessionProvider>
  );
}
