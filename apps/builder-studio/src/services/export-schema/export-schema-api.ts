import type {
  ExportSchema,
  ExportSchemaEvent,
  ExportSchemaIndexEntry,
  ExportSchemaPackage,
  ExportSchemaValidation,
  InitializeExportSchemaRegistryInput,
  RegisterExportSchemaInput,
} from '../../model';
import { createExportSchemaRegistry, type ExportSchemaRegistry } from './export-schema-registry';

export type ExportSchemaApi = {
  registerExportSchema(packageId: string | null, input: RegisterExportSchemaInput, init?: InitializeExportSchemaRegistryInput): ExportSchemaPackage;
  findExportSchema(name: string): readonly ExportSchema[];
  listExportSchemas(): readonly ExportSchema[];
  validateExportSchema(packageId: string): ExportSchemaValidation;
  deprecateExportSchema(packageId: string, schemaId: string): ExportSchemaPackage;
  removeExportSchema(packageId: string, schemaId: string): ExportSchemaPackage;
  initialize(input: InitializeExportSchemaRegistryInput): ExportSchemaPackage;
  getPackage(packageId: string): ExportSchemaPackage | null;
  listPackages(): readonly ExportSchemaPackage[];
  listEvents(): readonly ExportSchemaEvent[];
  listIndex(): readonly ExportSchemaIndexEntry[];
  dispose(packageId: string): ExportSchemaPackage;
};

export function createExportSchemaApi(registry?: ExportSchemaRegistry): ExportSchemaApi {
  const service = registry ?? createExportSchemaRegistry();
  return {
    registerExportSchema(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'export-schema-session-demo',
          title: init?.title ?? 'Builder Export Schemas',
          schema: init?.schema ?? input,
        });
      }
      return service.register(packageId, input);
    },
    findExportSchema(name) { return service.find(name); },
    listExportSchemas() { return service.list(); },
    validateExportSchema(packageId) { return service.validate(packageId); },
    deprecateExportSchema(packageId, schemaId) { return service.deprecate(packageId, schemaId); },
    removeExportSchema(packageId, schemaId) { return service.remove(packageId, schemaId); },
    initialize(input) { return service.initialize(input); },
    getPackage(packageId) { return service.getPackage(packageId); },
    listPackages() { return service.listPackages(); },
    listEvents() { return service.getEvents(); },
    listIndex() { return service.getIndex(); },
    dispose(packageId) { return service.dispose(packageId); },
  };
}
