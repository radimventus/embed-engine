import type {
  DecisionExecutionPackage,
  StartExecutionInput,
} from '../../model';
import type { DecisionOrchestrator } from './decision-orchestrator';

/**
 * Public Decision Orchestrator API (EPIC-BLD-31).
 */
export type DecisionOrchestratorApi = {
  startExecution(input: StartExecutionInput): DecisionExecutionPackage;
  advanceExecution(packageId: string): DecisionExecutionPackage;
  completeExecution(packageId: string): DecisionExecutionPackage;
  listExecutions(): readonly DecisionExecutionPackage[];
  validateExecution(packageId: string): DecisionExecutionPackage;
};

export function createDecisionOrchestratorApi(
  orchestrator: DecisionOrchestrator,
): DecisionOrchestratorApi {
  return {
    startExecution(input) {
      return orchestrator.start(input);
    },
    advanceExecution(packageId) {
      return orchestrator.advance(packageId);
    },
    completeExecution(packageId) {
      return orchestrator.complete(packageId);
    },
    listExecutions() {
      return orchestrator.list();
    },
    validateExecution(packageId) {
      return orchestrator.validate(packageId);
    },
  };
}
