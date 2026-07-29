import type {
  InitializePlatformPublicationInput,
  PlatformPublicationEntry,
  PlatformPublicationEvent,
  PlatformPublicationIndexEntry,
  PlatformPublicationPackage,
  PlatformPublicationValidation,
  RegisterPlatformPublicationInput,
} from '../../model';
import {
  createPlatformPublicationCatalog,
  type PlatformPublicationCatalog,
} from './platform-publication-catalog';

/**
 * Platform Publication Catalog API (EPIC-BLD-57).
 */
export type PlatformPublicationApi = {
  registerPlatformPublication(
    packageId: string | null,
    input: RegisterPlatformPublicationInput,
    init?: InitializePlatformPublicationInput,
  ): PlatformPublicationPackage;
  refreshPlatformPublication(packageId: string): PlatformPublicationPackage;
  listPlatformPublications(
    packageId?: string,
  ): readonly PlatformPublicationEntry[];
  findPlatformPublication(
    packageId: string,
    objectId: string,
  ): readonly PlatformPublicationEntry[];
  validatePlatformPublication(
    packageId: string,
  ): PlatformPublicationValidation;
  initialize(
    input: InitializePlatformPublicationInput,
  ): PlatformPublicationPackage;
  preview(packageId: string): PlatformPublicationPackage | null;
  listPackages(): readonly PlatformPublicationPackage[];
  listEvents(): readonly PlatformPublicationEvent[];
  listIndex(): readonly PlatformPublicationIndexEntry[];
  dispose(packageId: string): PlatformPublicationPackage;
};

export function createPlatformPublicationApi(
  catalog?: PlatformPublicationCatalog,
): PlatformPublicationApi {
  const service = catalog ?? createPlatformPublicationCatalog();

  return {
    initialize(input) {
      return service.initialize(input);
    },
    registerPlatformPublication(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'platform-publication-session-demo',
          title: init?.title ?? 'Builder Platform Publication Catalog',
          entries: init?.entries ?? [input],
        });
      }
      return service.register(packageId, input);
    },
    refreshPlatformPublication(packageId) {
      return service.refresh(packageId);
    },
    listPlatformPublications(packageId) {
      return service.list(packageId);
    },
    findPlatformPublication(packageId, objectId) {
      return service.find(packageId, objectId);
    },
    validatePlatformPublication(packageId) {
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
