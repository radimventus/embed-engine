import type {
  ExportCapability,
  ExportCapabilityEvent,
  ExportCapabilityIndexEntry,
  ExportCapabilityPackage,
  ExportCapabilityValidation,
  InitializeExportCapabilityRegistryInput,
  RegisterExportCapabilityInput,
} from '../../model';
import {
  createExportCapabilityRegistry,
  type ExportCapabilityRegistry,
} from './export-capability-registry';

export type ExportCapabilityApi = {
  registerExportCapability(
    packageId: string | null,
    input: RegisterExportCapabilityInput,
    init?: InitializeExportCapabilityRegistryInput,
  ): ExportCapabilityPackage;
  findExportCapability(name: string): readonly ExportCapability[];
  listExportCapabilities(): readonly ExportCapability[];
  validateExportCapability(packageId: string): ExportCapabilityValidation;
  disposeExportCapability(packageId: string): ExportCapabilityPackage;
  getPackage(packageId: string): ExportCapabilityPackage | null;
  listPackages(): readonly ExportCapabilityPackage[];
  listEvents(): readonly ExportCapabilityEvent[];
  listIndex(): readonly ExportCapabilityIndexEntry[];
};

export function createExportCapabilityApi(
  registry?: ExportCapabilityRegistry,
): ExportCapabilityApi {
  const service = registry ?? createExportCapabilityRegistry();

  return {
    registerExportCapability(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'export-capability-session-demo',
          title: init?.title ?? 'Builder Export Capabilities',
          capability: init?.capability ?? input,
        });
      }
      return service.register(packageId, input);
    },

    findExportCapability(name) {
      return service.find(name);
    },

    listExportCapabilities() {
      return service.list();
    },

    validateExportCapability(packageId) {
      return service.validate(packageId);
    },

    disposeExportCapability(packageId) {
      return service.dispose(packageId);
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
  };
}

