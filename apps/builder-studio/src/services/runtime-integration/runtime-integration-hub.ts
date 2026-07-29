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
  buildInitialCatalog,
  createBasicRuntimeIntegrationStrategy,
  createRuntimeIntegrationValidator,
  type RuntimeIntegrationStrategy,
  type RuntimeIntegrationValidator,
} from './basic-runtime-integration-strategy';
import {
  createRuntimeIntegrationIndex,
  type RuntimeIntegrationIndex,
} from './runtime-integration-index';

export type RuntimeIntegrationHubOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RuntimeIntegrationStrategy;
  readonly validator?: RuntimeIntegrationValidator;
  readonly index?: RuntimeIntegrationIndex;
};

/**
 * RuntimeIntegrationHub (EPIC-BLD-48).
 * Registers and catalogs published Runtime packages — no Runtime mutation.
 */
export type RuntimeIntegrationHub = {
  initialize(input: InitializeIntegrationInput): RuntimeIntegrationPackage;
  register(
    integrationPackageId: string,
    input: RegisterRuntimePackageInput,
  ): RuntimeIntegrationPackage;
  resolve(
    integrationPackageId: string,
    packageId: string,
  ): RuntimeIntegrationRecord | null;
  publish(packageId: string): RuntimeIntegrationPackage;
  dispose(packageId: string): RuntimeIntegrationPackage;
  getPackage(packageId: string): RuntimeIntegrationPackage | null;
  listPackages(): readonly RuntimeIntegrationPackage[];
  listRecords(packageId?: string): readonly RuntimeIntegrationRecord[];
  getEvents(): readonly RuntimeIntegrationEvent[];
  getIndex(): readonly RuntimeIntegrationIndexEntry[];
  validate(packageId: string): RuntimeIntegrationValidation;
};

export function createRuntimeIntegrationHub(
  options: RuntimeIntegrationHubOptions = {},
): RuntimeIntegrationHub {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy =
    options.strategy ?? createBasicRuntimeIntegrationStrategy();
  const validator =
    options.validator ?? createRuntimeIntegrationValidator({ now });
  const index = options.index ?? createRuntimeIntegrationIndex();

  const packages = new Map<string, RuntimeIntegrationPackage>();
  const events: RuntimeIntegrationEvent[] = [];

  const emit = (
    type: RuntimeIntegrationEvent['type'],
    packageId: string,
    catalogId: string | null,
    recordId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-integration-event'),
      type,
      packageId,
      catalogId,
      recordId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeIntegrationPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Integration package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: RuntimeIntegrationPackage): RuntimeIntegrationPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildPackage = (
    input: InitializeIntegrationInput,
  ): RuntimeIntegrationPackage => {
    if (!input.sessionId.trim()) {
      throw new Error('Integration hub requires sessionId.');
    }
    const stamp = now().toISOString();
    let catalog = buildInitialCatalog(input, createId, now);
    const pkg: RuntimeIntegrationPackage = {
      id: createId('runtime-integration-package'),
      version: '1.0.0',
      catalog,
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: catalog.metadata.title,
        sessionId: catalog.metadata.sessionId,
        notes: 'Runtime Integration Hub package — registration only.',
        status: 'Draft',
      },
      validation: null,
    };

    let current = store(pkg);
    for (const item of input.packages ?? []) {
      current = registerInto(current.id, item);
    }
    return current;
  };

  const registerInto = (
    integrationPackageId: string,
    input: RegisterRuntimePackageInput,
  ): RuntimeIntegrationPackage => {
    const pkg = requirePackage(integrationPackageId);
    if (pkg.metadata.status === 'Disposed') {
      throw new Error('Cannot register into disposed integration package.');
    }
    if (!strategy.supports(input)) {
      throw new Error(
        'Integration strategy does not support this package input.',
      );
    }
    const record = strategy.register(input, createId, now);
    const withoutDup = pkg.catalog.records.filter(
      (item) =>
        !(
          item.packageId === record.packageId &&
          item.packageType === record.packageType
        ),
    );
    const next: RuntimeIntegrationPackage = {
      ...pkg,
      updatedAt: now().toISOString(),
      catalog: {
        ...pkg.catalog,
        records: [...withoutDup, record],
      },
      validation: null,
    };
    store(next);
    emit(
      'RuntimePackageRegistered',
      next.id,
      next.catalog.id,
      record.id,
      `Registered ${record.packageType} package ${record.packageId}.`,
    );
    emit(
      'RuntimeCatalogUpdated',
      next.id,
      next.catalog.id,
      record.id,
      `Catalog now has ${next.catalog.records.length} record(s).`,
    );
    return next;
  };

  return {
    initialize(input) {
      return buildPackage(input);
    },

    register(integrationPackageId, input) {
      return registerInto(integrationPackageId, input);
    },

    resolve(integrationPackageId, packageId) {
      const pkg = requirePackage(integrationPackageId);
      return strategy.resolve(pkg.catalog, packageId);
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeIntegrationPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RuntimeIntegrationValidated',
        next.id,
        next.catalog.id,
        null,
        validation.valid
          ? 'Integration catalog validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid integration package.');
      }
      const next: RuntimeIntegrationPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Runtime Integration Catalog.',
        },
      };
      store(next);
      emit(
        'RuntimeIntegrationPublished',
        next.id,
        next.catalog.id,
        null,
        `Published integration package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeIntegrationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed integration package (read-only archive).',
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

    listRecords(packageId) {
      if (packageId === undefined) {
        return [...packages.values()].flatMap((item) => item.catalog.records);
      }
      return requirePackage(packageId).catalog.records;
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
