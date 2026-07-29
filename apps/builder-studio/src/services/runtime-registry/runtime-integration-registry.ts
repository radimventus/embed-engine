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
  buildInitialRegistryCatalog,
  createBasicRuntimeRegistryStrategy,
  createRuntimeRegistryValidator,
  type RuntimeRegistryStrategy,
  type RuntimeRegistryValidator,
} from './basic-runtime-registry-strategy';
import {
  createRuntimeRegistryIndex,
  type RuntimeRegistryIndex,
} from './runtime-registry-index';

export type RuntimeIntegrationRegistryOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RuntimeRegistryStrategy;
  readonly validator?: RuntimeRegistryValidator;
  readonly index?: RuntimeRegistryIndex;
};

/**
 * RuntimeIntegrationRegistry (EPIC-BLD-49).
 * Evidence / lookup of published Runtime packages — no creation or aggregation.
 */
export type RuntimeIntegrationRegistry = {
  initialize(input: InitializeRegistryInput): RuntimeRegistryPackage;
  register(
    registryPackageId: string,
    input: RegisterRegistryPackageInput,
  ): RuntimeRegistryPackage;
  find(
    registryPackageId: string,
    packageId: string,
  ): RuntimeRegistryEntry | null;
  list(registryPackageId?: string): readonly RuntimeRegistryEntry[];
  dispose(packageId: string): RuntimeRegistryPackage;
  publish(packageId: string): RuntimeRegistryPackage;
  getPackage(packageId: string): RuntimeRegistryPackage | null;
  listPackages(): readonly RuntimeRegistryPackage[];
  getEvents(): readonly RuntimeRegistryEvent[];
  getIndex(): readonly RuntimeRegistryIndexEntry[];
  validate(packageId: string): RuntimeRegistryValidation;
};

export function createRuntimeIntegrationRegistry(
  options: RuntimeIntegrationRegistryOptions = {},
): RuntimeIntegrationRegistry {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicRuntimeRegistryStrategy();
  const validator =
    options.validator ?? createRuntimeRegistryValidator({ now });
  const index = options.index ?? createRuntimeRegistryIndex();

  const packages = new Map<string, RuntimeRegistryPackage>();
  const events: RuntimeRegistryEvent[] = [];

  const emit = (
    type: RuntimeRegistryEvent['type'],
    packageId: string,
    catalogId: string | null,
    entryId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-registry-event'),
      type,
      packageId,
      catalogId,
      entryId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeRegistryPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Registry package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: RuntimeRegistryPackage): RuntimeRegistryPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const registerInto = (
    registryPackageId: string,
    input: RegisterRegistryPackageInput,
  ): RuntimeRegistryPackage => {
    const pkg = requirePackage(registryPackageId);
    if (pkg.metadata.status === 'Disposed') {
      throw new Error('Cannot register into disposed registry package.');
    }
    if (!strategy.supports(input)) {
      throw new Error(
        'Registry strategy does not support this package input.',
      );
    }
    const entry = strategy.register(input, createId, now);
    const existing = pkg.catalog.entries.find(
      (item) =>
        item.packageId === entry.packageId &&
        item.packageType === entry.packageType,
    );
    const withoutDup = pkg.catalog.entries.filter(
      (item) =>
        !(
          item.packageId === entry.packageId &&
          item.packageType === entry.packageType
        ),
    );
    const next: RuntimeRegistryPackage = {
      ...pkg,
      updatedAt: now().toISOString(),
      catalog: {
        ...pkg.catalog,
        entries: [...withoutDup, entry],
      },
      validation: null,
    };
    store(next);
    emit(
      existing ? 'RuntimePackageUpdated' : 'RuntimePackageRegistered',
      next.id,
      next.catalog.id,
      entry.id,
      existing
        ? `Updated ${entry.packageType} package ${entry.packageId} to v${entry.version}.`
        : `Registered ${entry.packageType} package ${entry.packageId}.`,
    );
    return next;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Registry requires sessionId.');
      }
      const stamp = now().toISOString();
      const catalog = buildInitialRegistryCatalog(input, createId, now);
      const pkg: RuntimeRegistryPackage = {
        id: createId('runtime-registry-package'),
        version: '1.0.0',
        catalog,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: catalog.metadata.title,
          sessionId: catalog.metadata.sessionId,
          notes: 'Runtime Integration Registry package — evidence only.',
          status: 'Draft',
        },
        validation: null,
      };
      let current = store(pkg);
      for (const item of input.packages ?? []) {
        current = registerInto(current.id, item);
      }
      return current;
    },

    register(registryPackageId, input) {
      return registerInto(registryPackageId, input);
    },

    find(registryPackageId, packageId) {
      const pkg = requirePackage(registryPackageId);
      return strategy.lookup(pkg.catalog, packageId);
    },

    list(registryPackageId) {
      if (registryPackageId === undefined) {
        return [...packages.values()].flatMap((item) => item.catalog.entries);
      }
      return requirePackage(registryPackageId).catalog.entries;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeRegistryPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RuntimeRegistryValidated',
        next.id,
        next.catalog.id,
        null,
        validation.valid
          ? 'Registry catalog validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid registry package.');
      }
      const next: RuntimeRegistryPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Runtime Integration Registry.',
        },
      };
      store(next);
      emit(
        'RuntimeRegistryPublished',
        next.id,
        next.catalog.id,
        null,
        `Published registry package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeRegistryPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed registry package (read-only archive).',
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
