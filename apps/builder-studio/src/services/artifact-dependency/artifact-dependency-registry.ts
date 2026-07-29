import type {
  ArtifactDependency,
  ArtifactDependencyEvent,
  ArtifactDependencyIndexEntry,
  ArtifactDependencyPackage,
  ArtifactDependencyValidation,
  InitializeArtifactDependencyRegistryInput,
  RegisterArtifactDependencyInput,
} from '../../model';
import {
  buildInitialArtifactDependencyPackage,
  createArtifactDependencyValidator,
  createBasicArtifactDependencyStrategy,
  type ArtifactDependencyStrategy,
  type ArtifactDependencyValidator,
} from './basic-artifact-dependency-strategy';
import {
  createArtifactDependencyIndex,
  type ArtifactDependencyIndex,
} from './artifact-dependency-index';

export type ArtifactDependencyRegistryOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: ArtifactDependencyStrategy;
  readonly validator?: ArtifactDependencyValidator;
  readonly index?: ArtifactDependencyIndex;
};

export type ArtifactDependencyRegistry = {
  initialize(
    input: InitializeArtifactDependencyRegistryInput,
  ): ArtifactDependencyPackage;
  register(
    packageId: string,
    input: RegisterArtifactDependencyInput,
  ): ArtifactDependencyPackage;
  remove(packageId: string, dependencyId: string): ArtifactDependencyPackage;
  find(artifactId: string): readonly ArtifactDependency[];
  list(): readonly ArtifactDependencyPackage[];
  dispose(packageId: string): ArtifactDependencyPackage;
  validate(packageId: string): ArtifactDependencyValidation;
  getPackage(packageId: string): ArtifactDependencyPackage | null;
  listArtifactDependencies(): readonly ArtifactDependency[];
  getEvents(): readonly ArtifactDependencyEvent[];
  getIndex(): readonly ArtifactDependencyIndexEntry[];
};

export function createArtifactDependencyRegistry(
  options: ArtifactDependencyRegistryOptions = {},
): ArtifactDependencyRegistry {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicArtifactDependencyStrategy();
  const validator =
    options.validator ?? createArtifactDependencyValidator({ now });
  const index = options.index ?? createArtifactDependencyIndex();

  const packages = new Map<string, ArtifactDependencyPackage>();
  const events: ArtifactDependencyEvent[] = [];

  const emit = (
    type: ArtifactDependencyEvent['type'],
    packageId: string,
    dependencyId: string | null,
    sourceArtifactId: string | null,
    message: string,
  ) => {
    events.push({
      eventId: createId('artifact-dependency-event'),
      type,
      packageId,
      dependencyId,
      sourceArtifactId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): ArtifactDependencyPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Artifact dependency package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: ArtifactDependencyPackage): ArtifactDependencyPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    emit(
      'ArtifactDependencyIndexed',
      pkg.id,
      null,
      null,
      `Indexed ${pkg.dependencies.length} dependencies.`,
    );
    return pkg;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Artifact dependency registry requires sessionId.');
      }
      let pkg = store(buildInitialArtifactDependencyPackage(input, createId, now));
      if (input.dependency !== undefined) {
        pkg = this.register(pkg.id, input.dependency);
      }
      return pkg;
    },

    register(packageId, input) {
      const pkg = requirePackage(packageId);
      if (!strategy.supports(input)) {
        throw new Error('Artifact dependency strategy does not support this input.');
      }
      const dependency = strategy.register(input, createId);
      const next: ArtifactDependencyPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        dependencies: [...pkg.dependencies, dependency],
        validation: null,
        metadata: {
          ...pkg.metadata,
          status: 'Active',
          notes: 'Registered artifact dependency.',
        },
      };
      store(next);
      emit(
        'ArtifactDependencyRegistered',
        next.id,
        dependency.id,
        dependency.sourceArtifactId,
        `Registered ${dependency.sourceArtifactId} -> ${dependency.targetArtifactId}.`,
      );
      return next;
    },

    remove(packageId, dependencyId) {
      const pkg = requirePackage(packageId);
      const target = pkg.dependencies.find((item) => item.id === dependencyId);
      if (!target) {
        throw new Error(`Artifact dependency not found: ${dependencyId}`);
      }
      const next: ArtifactDependencyPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        dependencies: pkg.dependencies.map((dependency) =>
          dependency.id === dependencyId
            ? { ...dependency, status: 'Removed' as const }
            : dependency,
        ),
        validation: null,
        metadata: {
          ...pkg.metadata,
          status: 'Active',
          notes: 'Removed artifact dependency.',
        },
      };
      store(next);
      emit(
        'ArtifactDependencyRemoved',
        next.id,
        target.id,
        target.sourceArtifactId,
        `Removed ${target.sourceArtifactId} -> ${target.targetArtifactId}.`,
      );
      return next;
    },

    find(artifactId) {
      return this.listArtifactDependencies().filter(
        (dependency) =>
          dependency.sourceArtifactId === artifactId ||
          dependency.targetArtifactId === artifactId,
      );
    },

    list() {
      return [...packages.values()];
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: ArtifactDependencyPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed artifact dependency package (read-only archive).',
        },
      };
      store(next);
      return next;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const duplicateMessages = strategy.validate(pkg.dependencies);
      const next: ArtifactDependencyPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        validation: {
          ...validation,
          valid:
            validation.valid &&
            duplicateMessages.length === 0,
          issues: [
            ...validation.issues,
            ...duplicateMessages.map((message) => ({
              code: 'artifact-duplicates',
              severity: 'warning' as const,
              message,
            })),
          ],
        },
      };
      store(next);
      emit(
        'ArtifactDependencyValidated',
        next.id,
        null,
        null,
        next.validation?.valid
          ? 'Validated artifact dependency package.'
          : 'Artifact dependency package validation failed.',
      );
      return next.validation as ArtifactDependencyValidation;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listArtifactDependencies() {
      return [...packages.values()].flatMap((pkg) => pkg.dependencies);
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
