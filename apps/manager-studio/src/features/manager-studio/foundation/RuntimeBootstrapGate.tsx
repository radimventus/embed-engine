import type { ReactNode } from 'react';

import { useManagerStudioRuntime } from '../runtime/DecisionSessionRuntimeProvider';
import { StudioLoading } from './StudioLoading';

type RuntimeBootstrapGateProps = {
  readonly children: ReactNode;
};

/**
 * Gates Operations Terminal content until Runtime projection is ready.
 * PT-PLATFORM-01 — when bootstrap degraded, show status (not infinite loading).
 */
export function RuntimeBootstrapGate({ children }: RuntimeBootstrapGateProps) {
  const runtime = useManagerStudioRuntime();

  if (runtime.ready) {
    return children;
  }

  if (runtime.canonicalHouseContext !== null) {
    return children;
  }

  if (runtime.bootstrapStatus !== null) {
    return (
      <div role="status" data-testid="manager-runtime-degraded">
        <StudioLoading label="Provozní projekce není k dispozici" />
        <p>{runtime.bootstrapStatus}</p>
      </div>
    );
  }

  return <StudioLoading label="Připravuji provozní projekci…" />;
}
