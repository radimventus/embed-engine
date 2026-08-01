import { CommercialPlatformCanvas } from './commercial/CommercialPlatformCanvas';
import { CustomerSuccessCanvas } from './customer-success/CustomerSuccessCanvas';
import { RuntimeBootstrapGate } from './foundation';
import { OperationsCenterCanvas } from './operations-center/OperationsCenterCanvas';
import { OperationsCanvas } from './operations/OperationsCanvas';
import { ProductLearningCanvas } from './product-learning/ProductLearningCanvas';
import { DecisionSessionRuntimeProvider } from './runtime/DecisionSessionRuntimeProvider';

/**
 * Manager Studio host — platform capability projections (BX-17..21 + MSCB).
 */
export function ManagerStudioPage() {
  return (
    <DecisionSessionRuntimeProvider>
      <RuntimeBootstrapGate>
        <OperationsCenterCanvas />
        <CommercialPlatformCanvas />
        <ProductLearningCanvas />
        <CustomerSuccessCanvas />
        <OperationsCanvas />
      </RuntimeBootstrapGate>
    </DecisionSessionRuntimeProvider>
  );
}
