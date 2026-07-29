import type {
  ExportCapability,
  ExportCapabilityEvent,
  ExportCapabilityEventType,
  ExportCapabilityIndexEntry,
  ExportCapabilityPackage,
  ExportCapabilityValidation,
  InitializeExportCapabilityRegistryInput,
  RegisterExportCapabilityInput,
} from '../../model';
import {
  createBasicExportCapabilityStrategy,
  type ExportCapabilityStrategy,
} from './basic-export-capability-strategy';
import {
  createBasicExportCapabilityValidator,
  type ExportCapabilityValidator,
} from './basic-export-capability-validator';
import {
  createExportCapabilityIndex,
  type ExportCapabilityIndex,
} from './export-capability-index';

export type ExportCapabilityRegistryOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: ExportCapabilityStrategy;
  readonly validator?: ExportCapabilityValidator;
  readonly index?: ExportCapabilityIndex;
};

export type ExportCapabilityRegistry = {
  initialize(input: InitializeExportCapabilityRegistryInput): ExportCapabilityPackage;
  register(
    packageId: string,
    input: RegisterExportCapabilityInput,
  ): ExportCapabilityPackage;
  find(capabilityName: string): readonly ExportCapability[];
  list(): readonly ExportCapability[];
  validate(packageId: string): ExportCapabilityValidation;
  deprecate(packageId: string, capabilityId: string): ExportCapabilityPackage;
  remove(packageId: string, capabilityId: string): ExportCapabilityPackage;
  dispose(packageId: string): ExportCapabilityPackage;
  getPackage(packageId: string): ExportCapabilityPackage | null;
  listPackages(): readonly ExportCapabilityPackage[];
  getEvents(): readonly ExportCapabilityEvent[];
  getIndex(): readonly ExportCapabilityIndexEntry[];
};

export function createExportCapabilityRegistry(
  options: ExportCapabilityRegistryOptions = {},
): ExportCapabilityRegistry {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicExportCapabilityStrategy();
  const validator =
    options.validator ?? createBasicExportCapabilityValidator();
  const index = options.index ?? createExportCapabilityIndex();

  const packages = new Map<string, ExportCapabilityPackage>();
  const events: ExportCapabilityEvent[] = [];

  const emit = (
    type: ExportCapabilityEventType,
    packageId: string,
    capabilityId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('export-cap-event'),
      type,
      packageId,
      capabilityId,
      at: now().toISOString(),
      message,
    });
  };

  const req = (packageId: string): ExportCapabilityPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Export capability package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: ExportCapabilityPackage): ExportCapabilityPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildInitialPackage = (
    input: InitializeExportCapabilityRegistryInput,
  ): ExportCapabilityPackage => {
    const stamp = now().toISOString();
    return {
      id: createId('export-cap-package'),
      version: '1.0.0',
      capabilities: [],
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: input.title?.trim() || `Export Capabilities ${input.sessionId}`,
        sessionId: input.sessionId,
        notes: 'Export capability registry package.',
        status: 'Draft',
      },
      validation: null,
    };
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error(
          'Export capability registry requires sessionId.',
        );
      }
      let pkg = store(buildInitialPackage(input));
      if (input.capability) {
        pkg = this.register(pkg.id, input.capability);
      }
      return pkg;
    },

    register(packageId, input) {
      const pkg = req(packageId);
      if (!strategy.supports(input)) {
        throw new Error(
          'Export capability strategy does not support this input.',
        );
      }
      const capability = strategy.register(input, () => createId('export-cap'));
      const next: ExportCapabilityPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        capabilities: [...pkg.capabilities, capability],
        validation: null,
        metadata: {
          ...pkg.metadata,
          status: 'Active',
          notes: `Registered capability \"${capability.name}\".`,
        },
      };
      store(next);
      emit(
        'ExportCapabilityRegistered',
        next.id,
        capability.id,
        `Registered capability ${capability.name}.`,
      );
      return next;
    },

    find(capabilityName) {
      return [...packages.values()]
        .flatMap((p) => p.capabilities)
        .filter((c) => c.name === capabilityName);
    },

    list() {
      return [...packages.values()].flatMap((p) => p.capabilities);
    },

    validate(packageId) {
      const pkg = req(packageId);
      const validation = validator.validate(pkg.capabilities);
      const next: ExportCapabilityPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        validation,
        metadata: {
          ...pkg.metadata,
          notes: validation.valid
            ? 'Export capability registry validated.'
            : 'Export capability registry validation failed.',
        },
      };
      store(next);
      emit(
        'ExportCapabilityValidated',
        next.id,
        null,
        validation.valid
          ? 'Validated export capabilities.'
          : 'Invalid export capabilities.',
      );
      return validation;
    },

    deprecate(packageId, capabilityId) {
      const pkg = req(packageId);
      const next: ExportCapabilityPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        capabilities: pkg.capabilities.map((c) =>
          c.id === capabilityId
            ? { ...c, status: 'Deprecated' as const }
            : c,
        ),
        validation: null,
      };
      store(next);
      emit(
        'ExportCapabilityDeprecated',
        next.id,
        capabilityId,
        `Deprecated capability ${capabilityId}.`,
      );
      return next;
    },

    remove(packageId, capabilityId) {
      const pkg = req(packageId);
      const next: ExportCapabilityPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        capabilities: pkg.capabilities.map((c) =>
          c.id === capabilityId
            ? { ...c, status: 'Removed' as const }
            : c,
        ),
        validation: null,
      };
      store(next);
      emit(
        'ExportCapabilityRemoved',
        next.id,
        capabilityId,
        `Removed capability ${capabilityId}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = req(packageId);
      const next: ExportCapabilityPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed export capability registry package.',
        },
      };
      store(next);
      return next;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}

