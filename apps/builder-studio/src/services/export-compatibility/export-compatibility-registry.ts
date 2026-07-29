import type {
  ExportCompatibility,
  ExportCompatibilityEvent,
  ExportCompatibilityEventType,
  ExportCompatibilityIndexEntry,
  ExportCompatibilityPackage,
  ExportCompatibilityValidation,
  InitializeExportCompatibilityRegistryInput,
  RegisterExportCompatibilityInput,
} from '../../model';
import { createBasicExportCompatibilityStrategy, type ExportCompatibilityStrategy } from './basic-export-compatibility-strategy';
import { createBasicExportCompatibilityValidator, type ExportCompatibilityValidator } from './basic-export-compatibility-validator';
import { createExportCompatibilityIndex, type ExportCompatibilityIndex } from './export-compatibility-index';

export type ExportCompatibilityRegistryOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: ExportCompatibilityStrategy;
  readonly validator?: ExportCompatibilityValidator;
  readonly index?: ExportCompatibilityIndex;
};

export type ExportCompatibilityRegistry = {
  initialize(input: InitializeExportCompatibilityRegistryInput): ExportCompatibilityPackage;
  register(packageId: string, input: RegisterExportCompatibilityInput): ExportCompatibilityPackage;
  find(sourceVersion: string): readonly ExportCompatibility[];
  list(): readonly ExportCompatibility[];
  validate(packageId: string): ExportCompatibilityValidation;
  deprecate(packageId: string, compatibilityId: string): ExportCompatibilityPackage;
  remove(packageId: string, compatibilityId: string): ExportCompatibilityPackage;
  dispose(packageId: string): ExportCompatibilityPackage;
  getPackage(packageId: string): ExportCompatibilityPackage | null;
  listPackages(): readonly ExportCompatibilityPackage[];
  getEvents(): readonly ExportCompatibilityEvent[];
  getIndex(): readonly ExportCompatibilityIndexEntry[];
};

export function createExportCompatibilityRegistry(options: ExportCompatibilityRegistryOptions = {}): ExportCompatibilityRegistry {
  let seq = 0;
  const createId = options.createId ?? ((prefix: string) => { seq += 1; return `${prefix}-${String(seq).padStart(4, '0')}`; });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicExportCompatibilityStrategy();
  const validator = options.validator ?? createBasicExportCompatibilityValidator();
  const index = options.index ?? createExportCompatibilityIndex();

  const packages = new Map<string, ExportCompatibilityPackage>();
  const events: ExportCompatibilityEvent[] = [];

  const emit = (type: ExportCompatibilityEventType, packageId: string, compatibilityId: string | null, message: string) => {
    events.push({ eventId: createId('export-compat-event'), type, packageId, compatibilityId, at: now().toISOString(), message });
  };

  const req = (packageId: string): ExportCompatibilityPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) throw new Error(`Export compatibility package not found: ${packageId}`);
    return pkg;
  };

  const store = (pkg: ExportCompatibilityPackage): ExportCompatibilityPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) throw new Error('Export compatibility registry requires sessionId.');
      const stamp = now().toISOString();
      let pkg: ExportCompatibilityPackage = {
        id: createId('export-compat-package'),
        version: '1.0.0',
        compatibilities: [],
        createdAt: stamp,
        updatedAt: stamp,
        metadata: { title: input.title?.trim() || `Export Compatibility ${input.sessionId}`, sessionId: input.sessionId, notes: 'Export compatibility registry package.', status: 'Draft' },
        validation: null,
      };
      pkg = store(pkg);
      if (input.compatibility) pkg = this.register(pkg.id, input.compatibility);
      return pkg;
    },

    register(packageId, input) {
      const pkg = req(packageId);
      if (!strategy.supports(input)) throw new Error('Export compatibility strategy does not support this input.');
      const compat = strategy.register(input, () => createId('export-compat'));
      const next: ExportCompatibilityPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        compatibilities: [...pkg.compatibilities, compat],
        validation: null,
        metadata: { ...pkg.metadata, status: 'Active', notes: `Registered ${compat.sourceSchemaVersion} -> ${compat.targetSchemaVersion} (${compat.compatibilityLevel}).` },
      };
      store(next);
      emit('ExportCompatibilityRegistered', next.id, compat.id, `Registered ${compat.sourceSchemaVersion} -> ${compat.targetSchemaVersion}.`);
      return next;
    },

    find(sourceVersion) {
      return [...packages.values()].flatMap((p) => p.compatibilities).filter((c) => c.sourceSchemaVersion === sourceVersion);
    },

    list() {
      return [...packages.values()].flatMap((p) => p.compatibilities);
    },

    validate(packageId) {
      const pkg = req(packageId);
      const validation = validator.validate(pkg.compatibilities);
      const next: ExportCompatibilityPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        validation,
        metadata: { ...pkg.metadata, notes: validation.valid ? 'Compatibility registry validated.' : 'Compatibility registry validation failed.' },
      };
      store(next);
      emit('ExportCompatibilityValidated', next.id, null, validation.valid ? `Validated ${pkg.compatibilities.length} entries.` : `Validation failed.`);
      return validation;
    },

    deprecate(packageId, compatibilityId) {
      const pkg = req(packageId);
      const next: ExportCompatibilityPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        compatibilities: pkg.compatibilities.map((c) => c.id === compatibilityId ? { ...c, status: 'Deprecated' as const } : c),
        validation: null,
      };
      store(next);
      emit('ExportCompatibilityDeprecated', next.id, compatibilityId, `Deprecated compatibility ${compatibilityId}.`);
      return next;
    },

    remove(packageId, compatibilityId) {
      const pkg = req(packageId);
      const next: ExportCompatibilityPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        compatibilities: pkg.compatibilities.map((c) => c.id === compatibilityId ? { ...c, status: 'Removed' as const } : c),
        validation: null,
      };
      store(next);
      emit('ExportCompatibilityRemoved', next.id, compatibilityId, `Removed compatibility ${compatibilityId}.`);
      return next;
    },

    dispose(packageId) {
      const pkg = req(packageId);
      const next: ExportCompatibilityPackage = { ...pkg, updatedAt: now().toISOString(), metadata: { ...pkg.metadata, status: 'Disposed', notes: 'Disposed export compatibility package.' } };
      store(next);
      return next;
    },

    getPackage(packageId) { return packages.get(packageId) ?? null; },
    listPackages() { return [...packages.values()]; },
    getEvents() { return [...events]; },
    getIndex() { return index.list(); },
  };
}
