import type {
  RuntimeExecutionPackage,
  StartRuntimeInput,
} from '../../model';
import type { ExperienceRuntimeOrchestrator } from './experience-runtime-orchestrator';

/**
 * Public Experience Runtime API (EPIC-BLD-32).
 */
export type ExperienceRuntimeApi = {
  startRuntime(input: StartRuntimeInput): RuntimeExecutionPackage;
  nextMove(packageId: string): RuntimeExecutionPackage;
  previousMove(packageId: string): RuntimeExecutionPackage;
  jumpToMove(packageId: string, moveId: string): RuntimeExecutionPackage;
  completeRuntime(packageId: string): RuntimeExecutionPackage;
  listRuntimeExecutions(): readonly RuntimeExecutionPackage[];
  validateRuntime(packageId: string): RuntimeExecutionPackage;
};

export function createExperienceRuntimeApi(
  orchestrator: ExperienceRuntimeOrchestrator,
): ExperienceRuntimeApi {
  return {
    startRuntime(input) {
      return orchestrator.start(input);
    },
    nextMove(packageId) {
      return orchestrator.next(packageId);
    },
    previousMove(packageId) {
      return orchestrator.previous(packageId);
    },
    jumpToMove(packageId, moveId) {
      return orchestrator.jump(packageId, moveId);
    },
    completeRuntime(packageId) {
      return orchestrator.complete(packageId);
    },
    listRuntimeExecutions() {
      return orchestrator.list();
    },
    validateRuntime(packageId) {
      return orchestrator.validate(packageId);
    },
  };
}
