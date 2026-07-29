import type {
  InitializePlatformPublicationInput,
  PlatformPublicationEntry,
  PlatformPublicationEvent,
  PlatformPublicationIndexEntry,
  PlatformPublicationPackage,
  PlatformPublicationValidation,
  RegisterPlatformPublicationInput,
} from '../../model';
import {
  buildInitialPlatformPublicationSnapshot,
  createBasicPlatformPublicationStrategy,
  createPlatformPublicationValidator,
  type PlatformPublicationStrategy,
  type PlatformPublicationValidator,
} from './basic-platform-publication-strategy';
import {
  createPlatformPublicationIndex,
  type PlatformPublicationIndex,
} from './platform-publication-index';

export type PlatformPublicationCatalogOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: PlatformPublicationStrategy;
  readonly validator?: PlatformPublicationValidator;
  readonly index?: PlatformPublicationIndex;
};

/**
 * PlatformPublicationCatalog (EPIC-BLD-57).
 * Public catalog projection — does not mutate Published Object Registry.
 */
export type PlatformPublicationCatalog = {
  initialize(
    input: InitializePlatformPublicationInput,
  ): PlatformPublicationPackage;
  register(
    packageId: string,
    input: RegisterPlatformPublicationInput,
  ): PlatformPublicationPackage;
  refresh(packageId: string): PlatformPublicationPackage;
  find(
    packageId: string,
    objectId: string,
  ): readonly PlatformPublicationEntry[];
  list(packageId?: string): readonly PlatformPublicationEntry[];
  dispose(packageId: string): PlatformPublicationPackage;
  validate(packageId: string): PlatformPublicationValidation;
  getPackage(packageId: string): PlatformPublicationPackage | null;
  listPackages(): readonly PlatformPublicationPackage[];
  getEvents(): readonly PlatformPublicationEvent[];
  getIndex(): readonly PlatformPublicationIndexEntry[];
};

export function createPlatformPublicationCatalog(
  options: PlatformPublicationCatalogOptions = {},
): PlatformPublicationCatalog {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy =
    options.strategy ?? createBasicPlatformPublicationStrategy();
  const validator =
    options.validator ?? createPlatformPublicationValidator({ now });
  const index = options.index ?? createPlatformPublicationIndex();

  const packages = new Map<string, PlatformPublicationPackage>();
  const events: PlatformPublicationEvent[] = [];

  const emit = (
    type: PlatformPublicationEvent['type'],
    packageId: string,
    snapshotId: string | null,
    entryId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('platform-publication-event'),
      type,
      packageId,
      snapshotId,
      entryId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (
    packageId: string,
  ): PlatformPublicationPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Platform Publication package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (
    pkg: PlatformPublicationPackage,
  ): PlatformPublicationPackage => {
    packages.set(pkg.id, pkg);
    const indexed = index.index(pkg.id, pkg);
    if (indexed.length > 0) {
      emit(
        'PlatformPublicationIndexed',
        pkg.id,
        pkg.snapshot.id,
        null,
        `Indexed ${indexed.length} catalog entr${indexed.length === 1 ? 'y' : 'ies'}.`,
      );
    }
    return pkg;
  };

  const updateEntries = (
    pkg: PlatformPublicationPackage,
    entries: readonly PlatformPublicationEntry[],
  ): PlatformPublicationPackage => ({
    ...pkg,
    updatedAt: now().toISOString(),
    snapshot: {
      ...pkg.snapshot,
      entries,
      generatedAt: now().toISOString(),
    },
    validation: null,
  });

  const registerInto = (
    packageId: string,
    input: RegisterPlatformPublicationInput,
  ): PlatformPublicationPackage => {
    const pkg = requirePackage(packageId);
    if (pkg.metadata.status === 'Disposed') {
      throw new Error(
        'Cannot register into disposed Platform Publication package.',
      );
    }
    if (!strategy.supports(input)) {
      throw new Error(
        'Platform Publication strategy does not support this input.',
      );
    }
    const entry = strategy.register(input, createId);
    const withoutDup = pkg.snapshot.entries.filter(
      (item) =>
        !(
          item.objectId === entry.objectId &&
          item.publicationVersion === entry.publicationVersion
        ),
    );
    const next = updateEntries(pkg, [...withoutDup, entry]);
    store(next);
    emit(
      'PlatformPublicationRegistered',
      next.id,
      next.snapshot.id,
      entry.id,
      `Registered catalog entry ${entry.objectId} v${entry.publicationVersion}.`,
    );
    return next;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Platform Publication Catalog requires sessionId.');
      }
      const stamp = now().toISOString();
      const snapshot = buildInitialPlatformPublicationSnapshot(
        input,
        createId,
        now,
      );
      const pkg: PlatformPublicationPackage = {
        id: createId('platform-publication-package'),
        version: '1.0.0',
        snapshot,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: snapshot.metadata.title,
          sessionId: snapshot.metadata.sessionId,
          notes: 'Platform Publication Catalog package — projection only.',
          status: 'Draft',
        },
        validation: null,
      };
      packages.set(pkg.id, pkg);
      let current = pkg;
      for (const entry of input.entries ?? []) {
        current = registerInto(current.id, entry);
      }
      if ((input.entries ?? []).length === 0) {
        index.index(current.id, current);
      }
      return current;
    },

    register(packageId, input) {
      return registerInto(packageId, input);
    },

    refresh(packageId) {
      const pkg = requirePackage(packageId);
      if (pkg.metadata.status === 'Disposed') {
        throw new Error('Cannot refresh disposed Platform Publication package.');
      }
      const entries = pkg.snapshot.entries.map((entry) =>
        strategy.refresh(entry, {
          status: entry.status === 'Registered' ? 'Active' : entry.status,
        }),
      );
      const next: PlatformPublicationPackage = {
        ...updateEntries(pkg, entries),
        metadata: {
          ...pkg.metadata,
          status: 'Active',
          notes: 'Refreshed Platform Publication Catalog snapshot.',
        },
      };
      store(next);
      emit(
        'PlatformPublicationRefreshed',
        next.id,
        next.snapshot.id,
        null,
        `Refreshed snapshot ${next.snapshot.id} (${entries.length} entries).`,
      );
      return next;
    },

    find(packageId, objectId) {
      return requirePackage(packageId).snapshot.entries.filter(
        (entry) => entry.objectId === objectId,
      );
    },

    list(packageId) {
      if (packageId === undefined) {
        return [...packages.values()].flatMap(
          (item) => item.snapshot.entries,
        );
      }
      return requirePackage(packageId).snapshot.entries;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: PlatformPublicationPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: pkg.metadata.status === 'Disposed' ? 'Disposed' : 'Active',
          notes: validation.valid
            ? 'Platform Publication Catalog validated.'
            : 'Platform Publication Catalog validation failed.',
        },
      };
      packages.set(next.id, next);
      index.index(next.id, next);
      emit(
        'PlatformPublicationValidated',
        next.id,
        next.snapshot.id,
        null,
        validation.valid
          ? `Validated Platform Publication package ${next.id}.`
          : `Validation failed for ${next.id}.`,
      );
      return validation;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: PlatformPublicationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed Platform Publication package (read-only archive).',
        },
      };
      packages.set(next.id, next);
      index.index(next.id, next);
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
