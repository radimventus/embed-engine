import type { ReactNode } from 'react';

import { useManagerStudioRuntime } from '../runtime/DecisionSessionRuntimeProvider';
import { StudioLoading } from './StudioLoading';

type RuntimeBootstrapGateProps = {
  readonly children: ReactNode;
};

/**
 * Gates Operations Terminal content until Runtime projection is ready.
 */
export function RuntimeBootstrapGate({ children }: RuntimeBootstrapGateProps) {
  const { ready } = useManagerStudioRuntime();

  if (!ready) {
    return <StudioLoading label="Připravuji provozní projekci…" />;
  }

  return children;
}
