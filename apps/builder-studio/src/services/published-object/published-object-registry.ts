import type {
  InitializePublishedObjectRegistryInput,
  PublishedObject,
  PublishedObjectEvent,
  PublishedObjectIndexEntry,
  PublishedObjectPackage,
  PublishedObjectValidation,
  RegisterPublishedObjectInput,
} from '../../model';
import {
  buildInitialPublishedObjectCatalog,
  createBasicPublishedObjectStrategy,
  createPublishedObjectValidator,
  type PublishedObjectStrategy,
  type PublishedObjectValidator,
} from './basic-published-object-strategy';
import {
  createPublishedObjectIndex,
  type PublishedObjectIndex,
} from './published-object-index';

export type PublishedObjectRegistryOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: PublishedObjectStrategy;
  readonly validator?: PublishedObjectValidator;
  readonly index?: PublishedObjectIndex;
};

/**
 * PublishedObjectRegistry (EPIC-BLD-56).
 * Evidence registry for published objects — no Object Package mutation.
 */
export type PublishedObjectRegistry = {
  initialize(
    input: InitializePublishedObjectRegistryInput,
  ): PublishedObjectPackage;
  register(
    packageId: string,
    input: RegisterPublishedObjectInput,
  ): PublishedObjectPackage;
  archive(
    packageId: string,
    publishedObjectId: string,
  ): PublishedObjectPackage;
  find(packageId: string, objectId: string): readonly PublishedObject[];
  list(packageId?: string): readonly PublishedObject[];
  dispose(packageId: string): PublishedObjectPackage;
  validate(packageId: string): PublishedObjectValidation;
  getPackage(packageId: string): PublishedObjectPackage | null;
  listPackages(): readonly PublishedObjectPackage[];
  getEvents(): readonly PublishedObjectEvent[];
  getIndex(): readonly PublishedObjectIndexEntry[];
};

export function createPublishedObjectRegistry(
  options: PublishedObjectRegistryOptions = {},
): PublishedObjectRegistry {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicPublishedObjectStrategy();
  const validator =
    options.validator ?? createPublishedObjectValidator({ now });
  const index = options.index ?? createPublishedObjectIndex();

  const packages = new Map<string, PublishedObjectPackage>();
  const events: PublishedObjectEvent[] = [];

  const emit = (
    type: PublishedObjectEvent['type'],
    packageId: string,
    catalogId: string | null,
    publishedObjectId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('published-object-event'),
      type,
      packageId,
      catalogId,
      publishedObjectId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): PublishedObjectPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Published Object package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: PublishedObjectPackage): PublishedObjectPackage => {
    packages.set(pkg.id, pkg);
    const indexed = index.index(pkg.id, pkg);
    if (indexed.length > 0) {
      emit(
        'PublishedObjectIndexed',
        pkg.id,
        pkg.catalog.id,
        null,
        `Indexed ${indexed.length} Published Object(s).`,
      );
    }
    return pkg;
  };

  const updateObjects = (
    pkg: PublishedObjectPackage,
    objects: readonly PublishedObject[],
  ): PublishedObjectPackage => ({
    ...pkg,
    updatedAt: now().toISOString(),
    catalog: {
      ...pkg.catalog,
      objects,
      generatedAt: now().toISOString(),
    },
    validation: null,
  });

  const registerInto = (
    packageId: string,
    input: RegisterPublishedObjectInput,
  ): PublishedObjectPackage => {
    const pkg = requirePackage(packageId);
    if (pkg.metadata.status === 'Disposed') {
      throw new Error('Cannot register into disposed Published Object package.');
    }
    if (!strategy.supports(input)) {
      throw new Error('Published Object strategy does not support this input.');
    }
    const object = strategy.register(input, createId, now);
    const withoutDup = pkg.catalog.objects.filter(
      (item) =>
        !(
          item.objectId === object.objectId &&
          item.version === object.version &&
          item.publicationVersion === object.publicationVersion
        ),
    );
    const next = updateObjects(pkg, [...withoutDup, object]);
    store(next);
    emit(
      'PublishedObjectRegistered',
      next.id,
      next.catalog.id,
      object.id,
      `Registered Published Object ${object.objectId} v${object.version}.`,
    );
    return next;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Published Object Registry requires sessionId.');
      }
      const stamp = now().toISOString();
      const catalog = buildInitialPublishedObjectCatalog(input, createId, now);
      const pkg: PublishedObjectPackage = {
        id: createId('published-object-package'),
        version: '1.0.0',
        catalog,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: catalog.metadata.title,
          sessionId: catalog.metadata.sessionId,
          notes: 'Published Object Registry package — evidence only.',
          status: 'Draft',
        },
        validation: null,
      };
      // Store without index event spam for empty catalog
      packages.set(pkg.id, pkg);
      let current = pkg;
      for (const object of input.objects ?? []) {
        current = registerInto(current.id, object);
      }
      if ((input.objects ?? []).length === 0) {
        index.index(current.id, current);
      }
      return current;
    },

    register(packageId, input) {
      return registerInto(packageId, input);
    },

    archive(packageId, publishedObjectId) {
      const pkg = requirePackage(packageId);
      const object = pkg.catalog.objects.find(
        (item) => item.id === publishedObjectId,
      );
      if (!object) {
        throw new Error(`Published Object not found: ${publishedObjectId}`);
      }
      const archived = strategy.archive(object);
      const next = updateObjects(
        pkg,
        pkg.catalog.objects.map((item) =>
          item.id === publishedObjectId ? archived : item,
        ),
      );
      store(next);
      emit(
        'PublishedObjectArchived',
        next.id,
        next.catalog.id,
        archived.id,
        `Archived Published Object ${archived.objectId}.`,
      );
      return next;
    },

    find(packageId, objectId) {
      return requirePackage(packageId).catalog.objects.filter(
        (object) => object.objectId === objectId,
      );
    },

    list(packageId) {
      if (packageId === undefined) {
        return [...packages.values()].flatMap((item) => item.catalog.objects);
      }
      return requirePackage(packageId).catalog.objects;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: PublishedObjectPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: pkg.metadata.status === 'Disposed' ? 'Disposed' : 'Active',
          notes: validation.valid
            ? 'Published Object Registry validated.'
            : 'Published Object Registry validation failed.',
        },
      };
      packages.set(next.id, next);
      index.index(next.id, next);
      emit(
        'PublishedObjectValidated',
        next.id,
        next.catalog.id,
        null,
        validation.valid
          ? `Validated Published Object package ${next.id}.`
          : `Validation failed for ${next.id}.`,
      );
      return validation;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: PublishedObjectPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed Published Object package (read-only archive).',
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
