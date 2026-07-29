import type {
  InitializeIntegrationInput,
  RegisterRuntimePackageInput,
  RuntimeIntegrationEvent,
  RuntimeIntegrationIndexEntry,
  RuntimeIntegrationPackage,
  RuntimeIntegrationRecord,
  RuntimeIntegrationValidation,
} from '../../model';
import {
  createRuntimeIntegrationHub,
  type RuntimeIntegrationHub,
} from './runtime-integration-hub';

/**
 * Runtime Integration Hub API (EPIC-BLD-48).
 */
export type RuntimeIntegrationApi = {
  registerRuntimePackage(
    integrationPackageId: string | null,
    input: RegisterRuntimePackageInput,
    init?: InitializeIntegrationInput,
  ): RuntimeIntegrationPackage;
  resolveRuntimePackage(
    integrationPackageId: string,
    packageId: string,
  ): RuntimeIntegrationRecord | null;
  publishRuntimeCatalog(packageId: string): RuntimeIntegrationPackage;
  listRuntimePackages(
    integrationPackageId?: string,
  ): readonly RuntimeIntegrationRecord[];
  validateRuntimeCatalog(packageId: string): RuntimeIntegrationValidation;
  initialize(input: InitializeIntegrationInput): RuntimeIntegrationPackage;
  preview(packageId: string): RuntimeIntegrationPackage | null;
  listCatalogs(): readonly RuntimeIntegrationPackage[];
  listEvents(): readonly RuntimeIntegrationEvent[];
  listIndex(): readonly RuntimeIntegrationIndexEntry[];
  dispose(packageId: string): RuntimeIntegrationPackage;
};

export function createRuntimeIntegrationApi(
  hub?: RuntimeIntegrationHub,
): RuntimeIntegrationApi {
  const integration = hub ?? createRuntimeIntegrationHub();

  return {
    initialize(input) {
      return integration.initialize(input);
    },
    registerRuntimePackage(integrationPackageId, input, init) {
      if (integrationPackageId === null) {
        const created = integration.initialize(
          init ?? {
            sessionId: 'runtime-session-demo',
            title: 'Builder Runtime Integration',
            packages: [input],
          },
        );
        if ((init?.packages?.length ?? 0) > 0) {
          return created;
        }
        if (created.catalog.records.some((r) => r.packageId === input.packageId)) {
          return created;
        }
        return integration.register(created.id, input);
      }
      return integration.register(integrationPackageId, input);
    },
    resolveRuntimePackage(integrationPackageId, packageId) {
      return integration.resolve(integrationPackageId, packageId);
    },
    publishRuntimeCatalog(packageId) {
      integration.validate(packageId);
      return integration.publish(packageId);
    },
    listRuntimePackages(integrationPackageId) {
      return integration.listRecords(integrationPackageId);
    },
    validateRuntimeCatalog(packageId) {
      return integration.validate(packageId);
    },
    preview(packageId) {
      return integration.getPackage(packageId);
    },
    listCatalogs() {
      return integration.listPackages();
    },
    listEvents() {
      return integration.getEvents();
    },
    listIndex() {
      return integration.getIndex();
    },
    dispose(packageId) {
      return integration.dispose(packageId);
    },
  };
}
