import { CommercialPlatformCanvas } from './commercial/CommercialPlatformCanvas';
import { CustomerSuccessCanvas } from './customer-success/CustomerSuccessCanvas';
import { RuntimeBootstrapGate } from './foundation';
import { LaunchCenterCanvas } from './launch/LaunchCenterCanvas';
import { ManagerWorkCenterHome } from './ManagerWorkCenterHome';
import { OperationsCenterCanvas } from './operations-center/OperationsCenterCanvas';
import { OperationsCanvas } from './operations/OperationsCanvas';
import { ProductLearningCanvas } from './product-learning/ProductLearningCanvas';
import { DecisionSessionRuntimeProvider } from './runtime/DecisionSessionRuntimeProvider';

/**
 * PR-005 — Manager Studio: pracovní centrum (capability canvases remain composed, not primary UX).
 */
export function ManagerStudioPage() {
  return (
    <DecisionSessionRuntimeProvider>
      <RuntimeBootstrapGate>
        <ManagerWorkCenterHome />
        {/* Capability projections remain composed for host wiring; not part of work-center UX. */}
        <div className="hidden" aria-hidden="true">
          <LaunchCenterCanvas />
          <OperationsCenterCanvas />
          <CommercialPlatformCanvas />
          <ProductLearningCanvas />
          <CustomerSuccessCanvas />
          <OperationsCanvas />
        </div>
      </RuntimeBootstrapGate>
    </DecisionSessionRuntimeProvider>
  );
}
