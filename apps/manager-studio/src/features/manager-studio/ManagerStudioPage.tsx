import { CustomerSuccessCanvas } from './customer-success/CustomerSuccessCanvas';
import { RuntimeBootstrapGate } from './foundation';
import { OperationsCenterCanvas } from './operations-center/OperationsCenterCanvas';
import { OperationsCanvas } from './operations/OperationsCanvas';
import { ProductLearningCanvas } from './product-learning/ProductLearningCanvas';
import { DecisionSessionRuntimeProvider } from './runtime/DecisionSessionRuntimeProvider';

/**
 * Manager Studio host — Platform Ops + Product Learning + CS + Operations.
 */
export function ManagerStudioPage() {
  return (
    <DecisionSessionRuntimeProvider>
      <RuntimeBootstrapGate>
        <OperationsCenterCanvas />
        <ProductLearningCanvas />
        <CustomerSuccessCanvas />
        <OperationsCanvas />
      </RuntimeBootstrapGate>
    </DecisionSessionRuntimeProvider>
  );
}
