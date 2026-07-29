import type {
  InitializeRegistryInput,
  RegisterRegistryPackageInput,
  RuntimeRegistryEntry,
  RuntimeRegistryEvent,
  RuntimeRegistryIndexEntry,
  RuntimeRegistryPackage,
  RuntimeRegistryValidation,
} from '../../model';
import {
  createRuntimeIntegrationRegistry,
  type RuntimeIntegrationRegistry,
} from './runtime-integration-registry';

/**
 * Runtime Integration Registry API (EPIC-BLD-49).
 */
export type RuntimeRegistryApi = {
  registerRuntimePackage(
    registryPackageId: string | null,
    input: RegisterRegistryPackageInput,
    init?: InitializeRegistryInput,
  ): RuntimeRegistryPackage;
  findRuntimePackage(
    registryPackageId: string,
    packageId: string,
  ): RuntimeRegistryEntry | null;
  listRuntimePackages(
    registryPackageId?: string,
  ): readonly RuntimeRegistryEntry[];
  publishRuntimeRegistry(packageId: string): RuntimeRegistryPackage;
  validateRuntimeRegistry(packageId: string): RuntimeRegistryValidation;
  initialize(input: InitializeRegistryInput): RuntimeRegistryPackage;
  preview(packageId: string): RuntimeRegistryPackage | null;
  listCatalogs(): readonly RuntimeRegistryPackage[];
  listEvents(): readonly RuntimeRegistryEvent[];
  listIndex(): readonly RuntimeRegistryIndexEntry[];
  dispose(packageId: string): RuntimeRegistryPackage;
};

export function createRuntimeRegistryApi(
  registry?: RuntimeIntegrationRegistry,
): RuntimeRegistryApi {
  const service = registry ?? createRuntimeIntegrationRegistry();

  return {
    initialize(input) {
      return service.initialize(input);
    },
    registerRuntimePackage(registryPackageId, input, init) {
      if (registryPackageId === null) {
        const created = service.initialize(
          init ?? {
            sessionId: 'runtime-session-demo',
            title: 'Builder Runtime Registry',
            packages: [input],
          },
        );
        if (
          created.catalog.entries.some(
            (entry) => entry.packageId === input.packageId,
          )
        ) {
          return created;
        }
        return service.register(created.id, input);
      }
      return service.register(registryPackageId, input);
    },
    findRuntimePackage(registryPackageId, packageId) {
      return service.find(registryPackageId, packageId);
    },
    listRuntimePackages(registryPackageId) {
      return service.list(registryPackageId);
    },
    publishRuntimeRegistry(packageId) {
      service.validate(packageId);
      return service.publish(packageId);
    },
    validateRuntimeRegistry(packageId) {
      return service.validate(packageId);
    },
    preview(packageId) {
      return service.getPackage(packageId);
    },
    listCatalogs() {
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
