import { RuntimeBootstrapGate } from './foundation';
import { OperationsCanvas } from './operations/OperationsCanvas';
import { DecisionSessionRuntimeProvider } from './runtime/DecisionSessionRuntimeProvider';

/**
 * Operations Terminal host (MSCB-01).
 *
 * Provider tree is Context transport only:
 * DecisionSessionRuntimeProvider → RuntimeBootstrapGate → OperationsCanvas.
 *
 * Runtime is bootstrapped exactly once. Surfaces project operations overview only.
 */
export function ManagerStudioPage() {
  return (
    <DecisionSessionRuntimeProvider>
      <RuntimeBootstrapGate>
        <OperationsCanvas />
      </RuntimeBootstrapGate>
    </DecisionSessionRuntimeProvider>
  );
}
