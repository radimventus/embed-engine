import type {
  InitializePublishedObjectRegistryInput,
  PublishedObject,
  PublishedObjectEvent,
  PublishedObjectIndexEntry,
  PublishedObjectPackage,
  PublishedObjectValidation,
  RegisterPublishedObjectInput,
} from '../../model';
import {
  createPublishedObjectRegistry,
  type PublishedObjectRegistry,
} from './published-object-registry';

/**
 * Published Object Registry API (EPIC-BLD-56).
 */
export type PublishedObjectApi = {
  registerPublishedObject(
    packageId: string | null,
    input: RegisterPublishedObjectInput,
    init?: InitializePublishedObjectRegistryInput,
  ): PublishedObjectPackage;
  archivePublishedObject(
    packageId: string,
    publishedObjectId: string,
  ): PublishedObjectPackage;
  listPublishedObjects(packageId?: string): readonly PublishedObject[];
  findPublishedObject(
    packageId: string,
    objectId: string,
  ): readonly PublishedObject[];
  validatePublishedObject(packageId: string): PublishedObjectValidation;
  initialize(
    input: InitializePublishedObjectRegistryInput,
  ): PublishedObjectPackage;
  preview(packageId: string): PublishedObjectPackage | null;
  listPackages(): readonly PublishedObjectPackage[];
  listEvents(): readonly PublishedObjectEvent[];
  listIndex(): readonly PublishedObjectIndexEntry[];
  dispose(packageId: string): PublishedObjectPackage;
};

export function createPublishedObjectApi(
  registry?: PublishedObjectRegistry,
): PublishedObjectApi {
  const service = registry ?? createPublishedObjectRegistry();

  return {
    initialize(input) {
      return service.initialize(input);
    },
    registerPublishedObject(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'published-object-session-demo',
          title: init?.title ?? 'Builder Published Objects',
          objects: init?.objects ?? [input],
        });
      }
      return service.register(packageId, input);
    },
    archivePublishedObject(packageId, publishedObjectId) {
      return service.archive(packageId, publishedObjectId);
    },
    listPublishedObjects(packageId) {
      return service.list(packageId);
    },
    findPublishedObject(packageId, objectId) {
      return service.find(packageId, objectId);
    },
    validatePublishedObject(packageId) {
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
