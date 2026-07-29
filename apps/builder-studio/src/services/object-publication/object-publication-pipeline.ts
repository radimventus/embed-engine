import type {
  BuildObjectPublicationInput,
  InitializePublicationInput,
  ObjectPublicationEvent,
  PublicationIndexEntry,
  PublicationObjectPackage,
  PublicationPackage,
  PublicationValidation,
} from '../../model';
import {
  buildInitialPublicationPackage,
  createBasicPublicationStrategy,
  createPublicationValidator,
  type PublicationStrategy,
  type PublicationValidator,
} from './basic-publication-strategy';
import {
  createPublicationIndex,
  type PublicationIndex,
} from './publication-index';

export type ObjectPublicationPipelineOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: PublicationStrategy;
  readonly validator?: PublicationValidator;
  readonly index?: PublicationIndex;
};

/**
 * ObjectPublicationPipeline (EPIC-BLD-55).
 * Builds local publishable Object Packages — no Runtime/Experience/AI/remote.
 */
export type ObjectPublicationPipeline = {
  initialize(input: InitializePublicationInput): PublicationPackage;
  build(
    packageId: string,
    input: BuildObjectPublicationInput,
  ): PublicationPackage;
  validate(packageId: string): PublicationValidation;
  publish(packageId: string): PublicationPackage;
  dispose(packageId: string): PublicationPackage;
  getPackage(packageId: string): PublicationPackage | null;
  listPackages(): readonly PublicationPackage[];
  listPublishedObjects(): readonly PublicationObjectPackage[];
  findPublishedObject(objectId: string): PublicationObjectPackage | null;
  getEvents(): readonly ObjectPublicationEvent[];
  getIndex(): readonly PublicationIndexEntry[];
};

export function createObjectPublicationPipeline(
  options: ObjectPublicationPipelineOptions = {},
): ObjectPublicationPipeline {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicPublicationStrategy();
  const validator = options.validator ?? createPublicationValidator({ now });
  const index = options.index ?? createPublicationIndex();

  const packages = new Map<string, PublicationPackage>();
  const events: ObjectPublicationEvent[] = [];

  const emit = (
    type: ObjectPublicationEvent['type'],
    packageId: string,
    objectPackageId: string | null,
    objectId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('object-publication-event'),
      type,
      packageId,
      objectPackageId,
      objectId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): PublicationPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Publication package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: PublicationPackage): PublicationPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const fail = (
    packageId: string,
    message: string,
  ): PublicationPackage => {
    const pkg = requirePackage(packageId);
    const next: PublicationPackage = {
      ...pkg,
      updatedAt: now().toISOString(),
      metadata: {
        ...pkg.metadata,
        status: 'Failed',
        notes: message,
      },
    };
    store(next);
    emit(
      'ObjectPublicationFailed',
      next.id,
      next.objectPackage.id,
      next.objectPackage.objectId,
      message,
    );
    return next;
  };

  const buildInto = (
    packageId: string,
    input: BuildObjectPublicationInput,
  ): PublicationPackage => {
    const pkg = requirePackage(packageId);
    if (pkg.metadata.status === 'Disposed') {
      throw new Error('Cannot build disposed publication package.');
    }
    if (!strategy.supports(input)) {
      return fail(packageId, 'Publication strategy does not support input.');
    }
    try {
      const objectPackage = strategy.build(input, createId, now);
      const next: PublicationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        objectPackage,
        validation: null,
        metadata: {
          ...pkg.metadata,
          title: objectPackage.metadata.title,
          status: 'Built',
          notes: 'Object Package built — awaiting validation.',
        },
      };
      store(next);
      emit(
        'ObjectPublicationCreated',
        next.id,
        objectPackage.id,
        objectPackage.objectId,
        `Built Object Package ${objectPackage.id} for ${objectPackage.objectId}.`,
      );
      return next;
    } catch (error) {
      return fail(
        packageId,
        error instanceof Error ? error.message : 'Build failed.',
      );
    }
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Publication pipeline requires sessionId.');
      }
      let pkg = store(buildInitialPublicationPackage(input, createId, now));
      emit(
        'ObjectPublicationCreated',
        pkg.id,
        pkg.objectPackage.id,
        null,
        `Created publication package ${pkg.id}.`,
      );
      if (input.build !== undefined) {
        pkg = buildInto(pkg.id, input.build);
      }
      return pkg;
    },

    build(packageId, input) {
      return buildInto(packageId, input);
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      if (pkg.objectPackage.objectId === 'object-pending') {
        fail(packageId, 'Cannot validate before build.');
        return {
          valid: false,
          issues: [
            {
              code: 'not-built',
              severity: 'error',
              message: 'Cannot validate before build.',
            },
          ],
          validatedAt: now().toISOString(),
        };
      }
      const validation = validator.validate(pkg);
      const next: PublicationPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: validation.valid ? 'Validated' : 'Failed',
          notes: validation.valid
            ? 'Object Package validated.'
            : 'Object Package validation failed.',
        },
      };
      store(next);
      if (validation.valid) {
        emit(
          'ObjectPublicationValidated',
          next.id,
          next.objectPackage.id,
          next.objectPackage.objectId,
          `Validated Object Package ${next.objectPackage.id}.`,
        );
      } else {
        emit(
          'ObjectPublicationFailed',
          next.id,
          next.objectPackage.id,
          next.objectPackage.objectId,
          `Validation failed for ${next.objectPackage.id}.`,
        );
      }
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      if (pkg.metadata.status === 'Disposed') {
        throw new Error('Cannot publish disposed publication package.');
      }
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        fail(packageId, 'Cannot publish invalid Object Package.');
        throw new Error('Cannot publish invalid Object Package.');
      }
      const publishedObject = strategy.publish(pkg.objectPackage);
      const next: PublicationPackage = {
        ...pkg,
        objectPackage: publishedObject,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Object Package — local artifact only.',
        },
      };
      store(next);
      emit(
        'ObjectPublicationPublished',
        next.id,
        publishedObject.id,
        publishedObject.objectId,
        `Published Object Package ${publishedObject.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: PublicationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed publication package (read-only archive).',
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

    listPublishedObjects() {
      return [...packages.values()]
        .filter((item) => item.metadata.status === 'Published')
        .map((item) => item.objectPackage);
    },

    findPublishedObject(objectId) {
      const match = [...packages.values()].find(
        (item) =>
          item.metadata.status === 'Published' &&
          item.objectPackage.objectId === objectId,
      );
      return match?.objectPackage ?? null;
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
