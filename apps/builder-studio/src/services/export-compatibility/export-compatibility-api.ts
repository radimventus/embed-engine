import type {
  ExportCompatibility,
  ExportCompatibilityEvent,
  ExportCompatibilityIndexEntry,
  ExportCompatibilityPackage,
  ExportCompatibilityValidation,
  InitializeExportCompatibilityRegistryInput,
  RegisterExportCompatibilityInput,
} from '../../model';
import { createExportCompatibilityRegistry, type ExportCompatibilityRegistry } from './export-compatibility-registry';

export type ExportCompatibilityApi = {
  registerExportCompatibility(packageId: string | null, input: RegisterExportCompatibilityInput, init?: InitializeExportCompatibilityRegistryInput): ExportCompatibilityPackage;
  findExportCompatibility(sourceVersion: string): readonly ExportCompatibility[];
  listExportCompatibilities(): readonly ExportCompatibility[];
  validateExportCompatibility(packageId: string): ExportCompatibilityValidation;
  deprecateExportCompatibility(packageId: string, compatibilityId: string): ExportCompatibilityPackage;
  removeExportCompatibility(packageId: string, compatibilityId: string): ExportCompatibilityPackage;
  initialize(input: InitializeExportCompatibilityRegistryInput): ExportCompatibilityPackage;
  getPackage(packageId: string): ExportCompatibilityPackage | null;
  listPackages(): readonly ExportCompatibilityPackage[];
  listEvents(): readonly ExportCompatibilityEvent[];
  listIndex(): readonly ExportCompatibilityIndexEntry[];
  dispose(packageId: string): ExportCompatibilityPackage;
};

export function createExportCompatibilityApi(registry?: ExportCompatibilityRegistry): ExportCompatibilityApi {
  const service = registry ?? createExportCompatibilityRegistry();
  return {
    registerExportCompatibility(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'export-compat-session-demo',
          title: init?.title ?? 'Builder Export Compatibility',
          compatibility: init?.compatibility ?? input,
        });
      }
      return service.register(packageId, input);
    },
    findExportCompatibility(sourceVersion) { return service.find(sourceVersion); },
    listExportCompatibilities() { return service.list(); },
    validateExportCompatibility(packageId) { return service.validate(packageId); },
    deprecateExportCompatibility(packageId, cId) { return service.deprecate(packageId, cId); },
    removeExportCompatibility(packageId, cId) { return service.remove(packageId, cId); },
    initialize(input) { return service.initialize(input); },
    getPackage(packageId) { return service.getPackage(packageId); },
    listPackages() { return service.listPackages(); },
    listEvents() { return service.getEvents(); },
    listIndex() { return service.getIndex(); },
    dispose(packageId) { return service.dispose(packageId); },
  };
}
