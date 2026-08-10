import { RuntimeBootstrapGate } from './foundation';
import { ManagerWorkCenterHome } from './ManagerWorkCenterHome';
import { OperationsCenterCanvas } from './operations-center/OperationsCenterCanvas';
import { OperationsCanvas } from './operations/OperationsCanvas';
import { ProductLearningCanvas } from './product-learning/ProductLearningCanvas';
import { DecisionSessionRuntimeProvider } from './runtime/DecisionSessionRuntimeProvider';

/**
 * PR-026 — Partner Manager page: Přehled · Provoz · Shrnutí only.
 */
export function ManagerStudioPage() {
  return (
    <DecisionSessionRuntimeProvider>
      <ManagerWorkCenterHome />
      <RuntimeBootstrapGate>
        <OperationsCanvas partnerOnly />
        <OperationsCenterCanvas partnerOnly />
        <ProductLearningCanvas partnerOnly />
      </RuntimeBootstrapGate>
    </DecisionSessionRuntimeProvider>
  );
}
