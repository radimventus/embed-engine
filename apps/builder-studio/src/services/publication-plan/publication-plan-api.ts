import type {
  BuildPublicationPlanInput,
  InitializePublicationPlanInput,
  PublicationPlan,
  PublicationPlanEvent,
  PublicationPlanIndexEntry,
  PublicationPlanPackage,
  PublicationPlanValidation,
} from '../../model';
import {
  createPublicationPlanBuilder,
  type PublicationPlanBuilder,
} from './publication-plan-builder';

export type PublicationPlanApi = {
  buildPublicationPlan(
    packageId: string | null,
    input: BuildPublicationPlanInput,
    init?: InitializePublicationPlanInput,
  ): PublicationPlanPackage;
  publishPublicationPlan(packageId: string): PublicationPlanPackage;
  listPublicationPlans(): readonly PublicationPlan[];
  findPublicationPlan(rootArtifactId: string): PublicationPlan | null;
  validatePublicationPlan(packageId: string): PublicationPlanValidation;
  initialize(input: InitializePublicationPlanInput): PublicationPlanPackage;
  getPackage(packageId: string): PublicationPlanPackage | null;
  listPackages(): readonly PublicationPlanPackage[];
  listEvents(): readonly PublicationPlanEvent[];
  listIndex(): readonly PublicationPlanIndexEntry[];
  dispose(packageId: string): PublicationPlanPackage;
};

export function createPublicationPlanApi(
  builder?: PublicationPlanBuilder,
): PublicationPlanApi {
  const service = builder ?? createPublicationPlanBuilder();

  return {
    buildPublicationPlan(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'publication-plan-session-demo',
          title: init?.title ?? 'Builder Publication Plan',
          plan: init?.plan ?? input,
        });
      }
      return service.build(packageId, input);
    },
    publishPublicationPlan(packageId) {
      return service.publish(packageId);
    },
    listPublicationPlans() {
      return service.listPublicationPlans();
    },
    findPublicationPlan(rootArtifactId) {
      return service.findPublicationPlan(rootArtifactId);
    },
    validatePublicationPlan(packageId) {
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
    dispose(packageId) {
      return service.dispose(packageId);
    },
  };
}
