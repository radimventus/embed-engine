import type {
  BuildObjectPublicationInput,
  InitializePublicationInput,
  ObjectPublicationEvent,
  PublicationIndexEntry,
  PublicationObjectPackage,
  PublicationPackage,
  PublicationValidation,
} from '../../model';
import {
  createObjectPublicationPipeline,
  type ObjectPublicationPipeline,
} from './object-publication-pipeline';

/**
 * Object Publication Pipeline API (EPIC-BLD-55).
 */
export type ObjectPublicationApi = {
  buildObjectPublication(
    packageId: string | null,
    input: BuildObjectPublicationInput,
    init?: InitializePublicationInput,
  ): PublicationPackage;
  publishObject(packageId: string): PublicationPackage;
  listPublishedObjects(): readonly PublicationObjectPackage[];
  findPublishedObject(objectId: string): PublicationObjectPackage | null;
  validatePublication(packageId: string): PublicationValidation;
  initialize(input: InitializePublicationInput): PublicationPackage;
  preview(packageId: string): PublicationPackage | null;
  listPackages(): readonly PublicationPackage[];
  listEvents(): readonly ObjectPublicationEvent[];
  listIndex(): readonly PublicationIndexEntry[];
  dispose(packageId: string): PublicationPackage;
};

export function createObjectPublicationApi(
  pipeline?: ObjectPublicationPipeline,
): ObjectPublicationApi {
  const service = pipeline ?? createObjectPublicationPipeline();

  return {
    initialize(input) {
      return service.initialize(input);
    },
    buildObjectPublication(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'publication-session-demo',
          title: init?.title ?? 'Builder Object Publication',
          build: init?.build ?? input,
        });
      }
      return service.build(packageId, input);
    },
    publishObject(packageId) {
      service.validate(packageId);
      return service.publish(packageId);
    },
    listPublishedObjects() {
      return service.listPublishedObjects();
    },
    findPublishedObject(objectId) {
      return service.findPublishedObject(objectId);
    },
    validatePublication(packageId) {
      return service.validate(packageId);
    },
    preview(packageId) {
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
