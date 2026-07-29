import type {
  InitializePublicationExecutionInput,
  PublicationExecutionEvent,
  PublicationExecutionIndexEntry,
  PublicationExecutionPackage,
  PublicationExecutionSession,
  PublicationExecutionValidation,
  StartPublicationExecutionInput,
} from '../../model';
import {
  createPublicationExecutionCoordinator,
  type PublicationExecutionCoordinator,
} from './publication-execution-coordinator';

export type PublicationExecutionApi = {
  startPublicationExecution(
    packageId: string | null,
    input: StartPublicationExecutionInput,
    init?: InitializePublicationExecutionInput,
  ): PublicationExecutionPackage;
  executePublicationStep(packageId: string): PublicationExecutionPackage;
  listPublicationExecutions(): readonly PublicationExecutionSession[];
  findPublicationExecution(planId: string): PublicationExecutionSession | null;
  validatePublicationExecution(packageId: string): PublicationExecutionValidation;
  initialize(input: InitializePublicationExecutionInput): PublicationExecutionPackage;
  getPackage(packageId: string): PublicationExecutionPackage | null;
  listPackages(): readonly PublicationExecutionPackage[];
  listEvents(): readonly PublicationExecutionEvent[];
  listIndex(): readonly PublicationExecutionIndexEntry[];
  completePublicationExecution(packageId: string): PublicationExecutionPackage;
  dispose(packageId: string): PublicationExecutionPackage;
};

export function createPublicationExecutionApi(
  coordinator?: PublicationExecutionCoordinator,
): PublicationExecutionApi {
  const service = coordinator ?? createPublicationExecutionCoordinator();

  return {
    startPublicationExecution(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'publication-execution-session-demo',
          title: init?.title ?? 'Builder Publication Execution',
          execution: init?.execution ?? input,
        });
      }
      return service.start(packageId, input);
    },
    executePublicationStep(packageId) {
      return service.executeStep(packageId);
    },
    listPublicationExecutions() {
      return service.listPublicationExecutions();
    },
    findPublicationExecution(planId) {
      return service.findPublicationExecution(planId);
    },
    validatePublicationExecution(packageId) {
      return service.validate(packageId);
    },
    initialize(input) {
      return service.initialize(input);
    },
    getPackage(packageId) {
      return service.getPackage(packageId);
    },
    listPackages() {
      return service.listPackages();
    },
    listEvents() {
      return service.getEvents();
    },
    listIndex() {
      return service.getIndex();
    },
    completePublicationExecution(packageId) {
      return service.complete(packageId);
    },
    dispose(packageId) {
      return service.dispose(packageId);
    },
  };
}
