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
 * PR-005 — Manager: pracovní centrum + kompletní funkce (pro návrh finální IA).
 */
export function ManagerStudioPage() {
  return (
    <DecisionSessionRuntimeProvider>
      <RuntimeBootstrapGate>
        <ManagerWorkCenterHome />
        <LaunchCenterCanvas />
        <OperationsCenterCanvas />
        <CommercialPlatformCanvas />
        <ProductLearningCanvas />
        <CustomerSuccessCanvas />
        <OperationsCanvas />
      </RuntimeBootstrapGate>
    </DecisionSessionRuntimeProvider>
  );
}
