import type { ReactNode } from 'react';

import { useDecisionSessionRuntime } from '../runtime/DecisionSessionRuntimeProvider';
import { StudioLoading } from './StudioLoading';

type RuntimeBootstrapGateProps = {
  readonly children: ReactNode;
};

/**
 * Gates Decision Journey content until Runtime Context is ready.
 * Single loading contract for the certified Runtime bootstrap (CSCB-01).
 */
export function RuntimeBootstrapGate({ children }: RuntimeBootstrapGateProps) {
  const { ready } = useDecisionSessionRuntime();

  if (!ready) {
    return <StudioLoading label="Připravuji prostředí…" />;
  }

  return children;
}
