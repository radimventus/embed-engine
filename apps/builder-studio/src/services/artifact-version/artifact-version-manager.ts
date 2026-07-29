import type {
  ArtifactVersion,
  ArtifactVersionEvent,
  ArtifactVersionIndexEntry,
  ArtifactVersionPackage,
  ArtifactVersionValidation,
  InitializeArtifactVersionManagerInput,
  RegisterArtifactVersionInput,
} from '../../model';
import {
  buildInitialArtifactVersionPackage,
  createArtifactVersionValidator,
  createBasicArtifactVersionStrategy,
  type ArtifactVersionStrategy,
  type ArtifactVersionValidator,
} from './basic-artifact-version-strategy';
import {
  createArtifactVersionIndex,
  type ArtifactVersionIndex,
} from './artifact-version-index';

export type ArtifactVersionManagerOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: ArtifactVersionStrategy;
  readonly validator?: ArtifactVersionValidator;
  readonly index?: ArtifactVersionIndex;
};

export type ArtifactVersionManager = {
  initialize(
    input: InitializeArtifactVersionManagerInput,
  ): ArtifactVersionPackage;
  register(
    packageId: string,
    input: RegisterArtifactVersionInput,
  ): ArtifactVersionPackage;
  activate(packageId: string, artifactVersionId: string): ArtifactVersionPackage;
  deprecate(packageId: string, artifactVersionId: string): ArtifactVersionPackage;
  list(): readonly ArtifactVersionPackage[];
  dispose(packageId: string): ArtifactVersionPackage;
  validate(packageId: string): ArtifactVersionValidation;
  getPackage(packageId: string): ArtifactVersionPackage | null;
  listArtifactVersions(): readonly ArtifactVersion[];
  findArtifactVersion(artifactId: string): readonly ArtifactVersion[];
  getEvents(): readonly ArtifactVersionEvent[];
  getIndex(): readonly ArtifactVersionIndexEntry[];
};

export function createArtifactVersionManager(
  options: ArtifactVersionManagerOptions = {},
): ArtifactVersionManager {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicArtifactVersionStrategy();
  const validator = options.validator ?? createArtifactVersionValidator({ now });
  const index = options.index ?? createArtifactVersionIndex();

  const packages = new Map<string, ArtifactVersionPackage>();
  const events: ArtifactVersionEvent[] = [];

  const emit = (
    type: ArtifactVersionEvent['type'],
    packageId: string,
    artifactVersionId: string | null,
    artifactId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('artifact-version-event'),
      type,
      packageId,
      artifactVersionId,
      artifactId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): ArtifactVersionPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Artifact version package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: ArtifactVersionPackage): ArtifactVersionPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Artifact version manager requires sessionId.');
      }
      let pkg = store(buildInitialArtifactVersionPackage(input, createId, now));
      if (input.version !== undefined) {
        pkg = this.register(pkg.id, input.version);
      }
      return pkg;
    },

    register(packageId, input) {
      const pkg = requirePackage(packageId);
      if (!strategy.supports(input)) {
        throw new Error('Artifact version strategy does not support this input.');
      }
      const version = strategy.register(input, createId, now);
      const next: ArtifactVersionPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        artifactVersions: [...pkg.artifactVersions, version],
        validation: null,
        metadata: {
          ...pkg.metadata,
          status: 'Active',
          notes: 'Registered artifact version.',
        },
      };
      store(next);
      emit(
        'ArtifactVersionRegistered',
        next.id,
        version.id,
        version.artifactId,
        `Registered ${version.artifactId}@${version.version}.`,
      );
      return next;
    },

    activate(packageId, artifactVersionId) {
      const pkg = requirePackage(packageId);
      const target = pkg.artifactVersions.find((item) => item.id === artifactVersionId);
      if (!target) {
        throw new Error(`Artifact version not found: ${artifactVersionId}`);
      }
      const next: ArtifactVersionPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        artifactVersions: strategy.activate(target, pkg.artifactVersions),
        validation: null,
        metadata: {
          ...pkg.metadata,
          status: 'Active',
          notes: 'Activated artifact version.',
        },
      };
      store(next);
      emit(
        'ArtifactVersionActivated',
        next.id,
        target.id,
        target.artifactId,
        `Activated ${target.artifactId}@${target.version}.`,
      );
      return next;
    },

    deprecate(packageId, artifactVersionId) {
      const pkg = requirePackage(packageId);
      const nextVersions = pkg.artifactVersions.map((item) =>
        item.id === artifactVersionId
          ? {
              ...item,
              status: 'DEPRECATED' as const,
              metadata: {
                ...item.metadata,
                active: false,
              },
            }
          : item,
      );
      const target = nextVersions.find((item) => item.id === artifactVersionId);
      if (!target) {
        throw new Error(`Artifact version not found: ${artifactVersionId}`);
      }
      const next: ArtifactVersionPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        artifactVersions: nextVersions,
        validation: null,
        metadata: {
          ...pkg.metadata,
          status: 'Active',
          notes: 'Deprecated artifact version.',
        },
      };
      store(next);
      emit(
        'ArtifactVersionDeprecated',
        next.id,
        target.id,
        target.artifactId,
        `Deprecated ${target.artifactId}@${target.version}.`,
      );
      return next;
    },

    list() {
      return [...packages.values()];
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: ArtifactVersionPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed artifact version package (read-only archive).',
        },
      };
      store(next);
      return next;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: ArtifactVersionPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        validation,
      };
      store(next);
      emit(
        'ArtifactVersionValidated',
        next.id,
        null,
        null,
        validation.valid
          ? 'Validated artifact version package.'
          : 'Artifact version package validation failed.',
      );
      return validation;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listArtifactVersions() {
      return [...packages.values()].flatMap((pkg) => pkg.artifactVersions);
    },

    findArtifactVersion(artifactId) {
      return this.listArtifactVersions().filter(
        (version) => version.artifactId === artifactId,
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
