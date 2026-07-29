import type {
  ExportSchema,
  ExportSchemaEvent,
  ExportSchemaEventType,
  ExportSchemaIndexEntry,
  ExportSchemaPackage,
  ExportSchemaValidation,
  InitializeExportSchemaRegistryInput,
  RegisterExportSchemaInput,
} from '../../model';
import {
  createBasicExportSchemaStrategy,
  type ExportSchemaStrategy,
} from './basic-export-schema-strategy';
import {
  createBasicExportSchemaValidator,
  type ExportSchemaValidator,
} from './basic-export-schema-validator';
import { createExportSchemaIndex, type ExportSchemaIndex } from './export-schema-index';

export type ExportSchemaRegistryOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: ExportSchemaStrategy;
  readonly validator?: ExportSchemaValidator;
  readonly index?: ExportSchemaIndex;
};

export type ExportSchemaRegistry = {
  initialize(input: InitializeExportSchemaRegistryInput): ExportSchemaPackage;
  register(packageId: string, input: RegisterExportSchemaInput): ExportSchemaPackage;
  find(name: string): readonly ExportSchema[];
  list(): readonly ExportSchema[];
  validate(packageId: string): ExportSchemaValidation;
  deprecate(packageId: string, schemaId: string): ExportSchemaPackage;
  remove(packageId: string, schemaId: string): ExportSchemaPackage;
  dispose(packageId: string): ExportSchemaPackage;
  getPackage(packageId: string): ExportSchemaPackage | null;
  listPackages(): readonly ExportSchemaPackage[];
  getEvents(): readonly ExportSchemaEvent[];
  getIndex(): readonly ExportSchemaIndexEntry[];
};

export function createExportSchemaRegistry(
  options: ExportSchemaRegistryOptions = {},
): ExportSchemaRegistry {
  let seq = 0;
  const createId =
    options.createId ?? ((prefix: string) => { seq += 1; return `${prefix}-${String(seq).padStart(4, '0')}`; });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicExportSchemaStrategy();
  const validator = options.validator ?? createBasicExportSchemaValidator();
  const index = options.index ?? createExportSchemaIndex();

  const packages = new Map<string, ExportSchemaPackage>();
  const events: ExportSchemaEvent[] = [];

  const emit = (type: ExportSchemaEventType, packageId: string, schemaId: string | null, message: string) => {
    events.push({ eventId: createId('export-schema-event'), type, packageId, schemaId, at: now().toISOString(), message });
  };

  const req = (packageId: string): ExportSchemaPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) throw new Error(`Export schema package not found: ${packageId}`);
    return pkg;
  };

  const store = (pkg: ExportSchemaPackage): ExportSchemaPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) throw new Error('Export schema registry requires sessionId.');
      const stamp = now().toISOString();
      let pkg: ExportSchemaPackage = {
        id: createId('export-schema-package'),
        version: '1.0.0',
        schemas: [],
        createdAt: stamp,
        updatedAt: stamp,
        metadata: { title: input.title?.trim() || `Export Schemas ${input.sessionId}`, sessionId: input.sessionId, notes: 'Export schema registry package.', status: 'Draft' },
        validation: null,
      };
      pkg = store(pkg);
      if (input.schema) pkg = this.register(pkg.id, input.schema);
      return pkg;
    },

    register(packageId, input) {
      const pkg = req(packageId);
      if (!strategy.supports(input)) throw new Error('Export schema strategy does not support this input.');
      const schema = strategy.register(input, () => createId('export-schema'));
      const next: ExportSchemaPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        schemas: [...pkg.schemas, schema],
        validation: null,
        metadata: { ...pkg.metadata, status: 'Active', notes: `Registered schema "${schema.name}" v${schema.schemaVersion}.` },
      };
      store(next);
      emit('ExportSchemaRegistered', next.id, schema.id, `Registered "${schema.name}" v${schema.schemaVersion}.`);
      return next;
    },

    find(name) {
      return [...packages.values()].flatMap((p) => p.schemas).filter((s) => s.name === name);
    },

    list() {
      return [...packages.values()].flatMap((p) => p.schemas);
    },

    validate(packageId) {
      const pkg = req(packageId);
      const validation = validator.validate(pkg.schemas);
      const next: ExportSchemaPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        validation,
        metadata: { ...pkg.metadata, notes: validation.valid ? 'Schema registry validated.' : 'Schema registry validation failed.' },
      };
      store(next);
      emit(
        'ExportSchemaValidated', next.id, null,
        validation.valid ? `Validated ${pkg.schemas.length} schemas.` : `Validation failed for ${pkg.schemas.length} schemas.`,
      );
      return validation;
    },

    deprecate(packageId, schemaId) {
      const pkg = req(packageId);
      const next: ExportSchemaPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        schemas: pkg.schemas.map((s) => s.id === schemaId ? { ...s, status: 'Deprecated' as const } : s),
        validation: null,
      };
      store(next);
      emit('ExportSchemaDeprecated', next.id, schemaId, `Deprecated schema ${schemaId}.`);
      return next;
    },

    remove(packageId, schemaId) {
      const pkg = req(packageId);
      const next: ExportSchemaPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        schemas: pkg.schemas.map((s) => s.id === schemaId ? { ...s, status: 'Removed' as const } : s),
        validation: null,
      };
      store(next);
      emit('ExportSchemaRemoved', next.id, schemaId, `Removed schema ${schemaId}.`);
      return next;
    },

    dispose(packageId) {
      const pkg = req(packageId);
      const next: ExportSchemaPackage = { ...pkg, updatedAt: now().toISOString(), metadata: { ...pkg.metadata, status: 'Disposed', notes: 'Disposed export schema package.' } };
      store(next);
      return next;
    },

    getPackage(packageId) { return packages.get(packageId) ?? null; },
    listPackages() { return [...packages.values()]; },
    getEvents() { return [...events]; },
    getIndex() { return index.list(); },
  };
}
