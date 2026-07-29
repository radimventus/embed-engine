import type {
  ClientPublicationEvent,
  ClientPublicationIndexEntry,
  ClientPublicationModel,
  ClientPublicationPackage,
  ClientPublicationValidation,
  InitializeClientPublicationInput,
  LoadClientPublicationInput,
} from '../../model';
import {
  buildInitialClientPublicationPackage,
  createBasicClientPublicationStrategy,
  createClientPublicationValidator,
  type ClientPublicationStrategy,
  type ClientPublicationValidator,
} from './basic-client-publication-strategy';
import {
  createClientPublicationIndex,
  type ClientPublicationIndex,
} from './client-publication-index';

export type ClientPublicationAdapterOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: ClientPublicationStrategy;
  readonly validator?: ClientPublicationValidator;
  readonly index?: ClientPublicationIndex;
};

export type ClientPublicationAdapter = {
  initialize(input: InitializeClientPublicationInput): ClientPublicationPackage;
  load(packageId: string, input: LoadClientPublicationInput): ClientPublicationPackage;
  transform(packageId: string): ClientPublicationPackage;
  publish(packageId: string): ClientPublicationPackage;
  dispose(packageId: string): ClientPublicationPackage;
  validate(packageId: string): ClientPublicationValidation;
  getPackage(packageId: string): ClientPublicationPackage | null;
  listPackages(): readonly ClientPublicationPackage[];
  listClientPublications(): readonly ClientPublicationModel[];
  findClientPublication(objectId: string): ClientPublicationModel | null;
  getEvents(): readonly ClientPublicationEvent[];
  getIndex(): readonly ClientPublicationIndexEntry[];
};

export function createClientPublicationAdapter(
  options: ClientPublicationAdapterOptions = {},
): ClientPublicationAdapter {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicClientPublicationStrategy();
  const validator = options.validator ?? createClientPublicationValidator({ now });
  const index = options.index ?? createClientPublicationIndex();

  const packages = new Map<string, ClientPublicationPackage>();
  const events: ClientPublicationEvent[] = [];

  const emit = (
    type: ClientPublicationEvent['type'],
    packageId: string,
    publicationModelId: string | null,
    publicationId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('client-publication-event'),
      type,
      packageId,
      publicationModelId,
      publicationId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): ClientPublicationPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Client publication package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: ClientPublicationPackage): ClientPublicationPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const loadInto = (
    packageId: string,
    input: LoadClientPublicationInput,
  ): ClientPublicationPackage => {
    const pkg = requirePackage(packageId);
    if (pkg.metadata.status === 'Disposed') {
      throw new Error('Cannot load into disposed Client publication package.');
    }
    if (!strategy.supports(input)) {
      throw new Error('Client publication strategy does not support this input.');
    }
    const next: ClientPublicationPackage = {
      ...pkg,
      updatedAt: now().toISOString(),
      publicationModel: {
        id: createId('client-publication-model'),
        publicationId: input.publicationId,
        objectId: input.objectId,
        version: input.version,
        assets: input.assets ?? [],
        metadata: {
          title: input.title?.trim() || input.objectId,
          notes:
            input.notes?.trim() ||
            'Loaded publication artifact for Client Studio adapter.',
          sourceCatalogPackageId: input.sourceCatalogPackageId ?? null,
          sourcePlatformEntryId: input.sourcePlatformEntryId ?? null,
          status: 'Loaded',
        },
      },
      validation: null,
      metadata: {
        ...pkg.metadata,
        title: input.title?.trim() || pkg.metadata.title,
        status: 'Active',
        notes: 'Loaded Builder publication artifact.',
      },
    };
    store(next);
    emit(
      'ClientPublicationLoaded',
      next.id,
      next.publicationModel.id,
      next.publicationModel.publicationId,
      `Loaded publication ${next.publicationModel.publicationId}.`,
    );
    return next;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Client publication adapter requires sessionId.');
      }
      let pkg = store(buildInitialClientPublicationPackage(input, createId, now));
      if (input.publication !== undefined) {
        pkg = loadInto(pkg.id, input.publication);
      }
      return pkg;
    },

    load(packageId, input) {
      return loadInto(packageId, input);
    },

    transform(packageId) {
      const pkg = requirePackage(packageId);
      const transformed = strategy.transform(
        {
          publicationId: pkg.publicationModel.publicationId,
          objectId: pkg.publicationModel.objectId,
          version: pkg.publicationModel.version,
          title: pkg.publicationModel.metadata.title,
          notes: pkg.publicationModel.metadata.notes,
          sourceCatalogPackageId: pkg.publicationModel.metadata.sourceCatalogPackageId,
          sourcePlatformEntryId: pkg.publicationModel.metadata.sourcePlatformEntryId,
          assets: pkg.publicationModel.assets,
        },
        createId,
      );
      const next: ClientPublicationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        publicationModel: transformed,
        validation: null,
        metadata: {
          ...pkg.metadata,
          status: 'Active',
          notes: 'Transformed publication into Client Publication Model.',
        },
      };
      store(next);
      emit(
        'ClientPublicationTransformed',
        next.id,
        next.publicationModel.id,
        next.publicationModel.publicationId,
        `Transformed ${next.publicationModel.publicationId}.`,
      );
      return next;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid Client Publication Model.');
      }
      const next: ClientPublicationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        publicationModel: strategy.publish(pkg.publicationModel),
        validation,
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Client Publication Model.',
        },
      };
      store(next);
      emit(
        'ClientPublicationPublished',
        next.id,
        next.publicationModel.id,
        next.publicationModel.publicationId,
        `Published client publication ${next.publicationModel.publicationId}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: ClientPublicationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed Client publication package (read-only archive).',
        },
      };
      store(next);
      return next;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: ClientPublicationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        validation,
        metadata: {
          ...pkg.metadata,
          status: pkg.metadata.status === 'Disposed' ? 'Disposed' : 'Active',
          notes: validation.valid
            ? 'Client publication validated.'
            : 'Client publication validation failed.',
        },
      };
      store(next);
      emit(
        'ClientPublicationValidated',
        next.id,
        next.publicationModel.id,
        next.publicationModel.publicationId,
        validation.valid
          ? `Validated ${next.publicationModel.publicationId}.`
          : `Validation failed for ${next.publicationModel.publicationId}.`,
      );
      return validation;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    listClientPublications() {
      return [...packages.values()].map((item) => item.publicationModel);
    },

    findClientPublication(objectId) {
      return (
        [...packages.values()].find(
          (item) => item.publicationModel.objectId === objectId,
        )?.publicationModel ?? null
      );
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
