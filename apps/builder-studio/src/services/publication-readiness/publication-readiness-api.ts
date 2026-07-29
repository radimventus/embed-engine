import type {
  InitializePublicationReadinessInput,
  PublicationReadinessEvent,
  PublicationReadinessIndexEntry,
  PublicationReadinessPackage,
  ValidatePublicationReadinessInput,
} from '../../model';
import {
  createPublicationReadinessValidator,
  type PublicationReadinessValidator,
} from './publication-readiness-validator';

export type PublicationReadinessApi = {
  validatePublicationReadiness(
    packageId: string | null,
    input: ValidatePublicationReadinessInput,
    init?: InitializePublicationReadinessInput,
  ): PublicationReadinessPackage;
  getPublicationReadiness(packageId: string): PublicationReadinessPackage | null;
  listPublicationReadinessReports(): readonly PublicationReadinessPackage[];
  findPublicationReadiness(publicationId: string): PublicationReadinessPackage | null;
  publishPublicationReadiness(packageId: string): PublicationReadinessPackage;
  evaluatePublicationReadiness(packageId: string): PublicationReadinessPackage;
  initialize(input: InitializePublicationReadinessInput): PublicationReadinessPackage;
  listEvents(): readonly PublicationReadinessEvent[];
  listIndex(): readonly PublicationReadinessIndexEntry[];
  dispose(packageId: string): PublicationReadinessPackage;
};

export function createPublicationReadinessApi(
  validator?: PublicationReadinessValidator,
): PublicationReadinessApi {
  const service = validator ?? createPublicationReadinessValidator();

  return {
    validatePublicationReadiness(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'publication-readiness-session-demo',
          title: init?.title ?? 'Builder Publication Readiness',
          publication: init?.publication ?? input,
        });
      }
      return service.validate(packageId, input);
    },
    getPublicationReadiness(packageId) {
      return service.getPublicationReadiness(packageId);
    },
    listPublicationReadinessReports() {
      return service.listPublicationReadinessReports();
    },
    findPublicationReadiness(publicationId) {
      return service.findPublicationReadiness(publicationId);
    },
    publishPublicationReadiness(packageId) {
      return service.publish(packageId);
    },
    evaluatePublicationReadiness(packageId) {
      return service.evaluate(packageId);
    },
    initialize(input) {
      return service.initialize(input);
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
