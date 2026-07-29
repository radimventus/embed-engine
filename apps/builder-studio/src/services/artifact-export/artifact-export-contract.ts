import type {
  ArtifactExportEvent,
  ArtifactExportEventType,
  ArtifactExportIndexEntry,
  ArtifactExportModel,
  ArtifactExportPackage,
  ArtifactExportValidation,
  BuildArtifactExportInput,
  InitializeArtifactExportInput,
} from '../../model';
import {
  createBasicArtifactExportValidator,
  type ArtifactExportValidator,
} from './basic-artifact-export-validator';
import {
  createBasicArtifactExportStrategy,
  type ArtifactExportStrategy,
} from './basic-artifact-export-strategy';
import { createArtifactExportIndex, type ArtifactExportIndex } from './artifact-export-index';

export type ArtifactExportContractOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: ArtifactExportStrategy;
  readonly validator?: ArtifactExportValidator;
  readonly index?: ArtifactExportIndex;
};

export type ArtifactExportContract = {
  initialize(input: InitializeArtifactExportInput): ArtifactExportPackage;
  build(packageId: string, input: BuildArtifactExportInput): ArtifactExportPackage;
  validate(packageId: string): ArtifactExportValidation;
  export(packageId: string): ArtifactExportPackage;
  dispose(packageId: string): ArtifactExportPackage;
  getPackage(packageId: string): ArtifactExportPackage | null;
  listPackages(): readonly ArtifactExportPackage[];
  listArtifactExports(): readonly ArtifactExportModel[];
  findArtifactExport(artifactId: string): ArtifactExportModel | null;
  getEvents(): readonly ArtifactExportEvent[];
  getIndex(): readonly ArtifactExportIndexEntry[];
};

export function buildInitialArtifactExportPackage(
  input: InitializeArtifactExportInput,
  createId: (prefix: string) => string,
  now: () => Date,
): ArtifactExportPackage {
  const stamp = now().toISOString();
  const model: ArtifactExportModel = {
    id: `export-${input.sessionId}-pending`,
    artifactId: 'artifact-pending',
    artifactType: 'Unknown',
    exportVersion: '0.0.0',
    schemaVersion: '1',
    metadata: {
      title: input.title?.trim() || `Artifact Export ${input.sessionId}`,
      notes: 'Awaiting export build.',
      status: 'Active',
    },
  };

  return {
    id: createId('artifact-export-package'),
    version: '1.0.0',
    exportModel: model,
    createdAt: stamp,
    updatedAt: stamp,
    metadata: {
      title: input.title?.trim() || `Artifact Export ${input.sessionId}`,
      sessionId: input.sessionId,
      notes: 'Artifact export package — contract only.',
      status: 'Draft',
    },
    validation: null,
  };
}

export function createArtifactExportContract(
  options: ArtifactExportContractOptions = {},
): ArtifactExportContract {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy: ArtifactExportStrategy = options.strategy ?? createBasicArtifactExportStrategy();
  const validator: ArtifactExportValidator =
    options.validator ?? createBasicArtifactExportValidator();
  const index = options.index ?? createArtifactExportIndex();

  const packages = new Map<string, ArtifactExportPackage>();
  const events: ArtifactExportEvent[] = [];

  const emit = (
    type: ArtifactExportEventType,
    packageId: string,
    exportModelId: string | null,
    artifactId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('artifact-export-event'),
      type,
      packageId,
      exportModelId,
      artifactId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): ArtifactExportPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Artifact export package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: ArtifactExportPackage): ArtifactExportPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Artifact export contract requires sessionId.');
      }
      let pkg = store(
        buildInitialArtifactExportPackage(input, createId, now),
      );
      if (input.export !== undefined) {
        pkg = this.build(pkg.id, input.export);
      }
      return pkg;
    },

    build(packageId, input) {
      const pkg = requirePackage(packageId);
      if (!strategy.supports(input)) {
        throw new Error('Artifact export strategy does not support this input.');
      }
      const exportModel = strategy.buildModel(input, (resolved) => {
        // Use deterministic export model identity.
        const stable = `export-${resolved.artifactId}-${resolved.exportVersion}-${resolved.schemaVersion}`;
        return stable;
      });

      const next: ArtifactExportPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        exportModel,
        validation: null,
        metadata: {
          ...pkg.metadata,
          status: 'Active',
          notes: 'Built deterministic artifact export contract model.',
        },
      };

      store(next);
      emit(
        'ArtifactExportBuilt',
        next.id,
        next.exportModel.id,
        next.exportModel.artifactId,
        `Built export model ${next.exportModel.id}.`,
      );
      return next;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg.exportModel);
      const next: ArtifactExportPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        validation,
        metadata: {
          ...pkg.metadata,
          status: validation.valid ? 'Active' : pkg.metadata.status,
          notes: validation.valid
            ? 'Artifact export validated.'
            : 'Artifact export invalidated.',
        },
      };
      store(next);
      emit(
        validation.valid ? 'ArtifactExportValidated' : 'ArtifactExportInvalidated',
        next.id,
        next.exportModel.id,
        next.exportModel.artifactId,
        validation.valid
          ? `Validated export ${next.exportModel.id}.`
          : `Invalid export ${next.exportModel.id}.`,
      );
      return validation;
    },

    export(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? this.validate(packageId);
      if (!validation.valid) {
        throw new Error('Cannot export invalid Artifact Export Contract.');
      }
      const exportedModel = strategy.exportModel(pkg.exportModel);
      const next: ArtifactExportPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        exportModel: exportedModel,
        validation,
        metadata: {
          ...pkg.metadata,
          status: 'Exported',
          notes: 'Published deterministic export model (contract payload).',
        },
      };
      store(next);
      emit(
        'ArtifactExportPublished',
        next.id,
        next.exportModel.id,
        next.exportModel.artifactId,
        `Exported artifact ${next.exportModel.artifactId}@${next.exportModel.exportVersion}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: ArtifactExportPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed artifact export package (read-only archive).',
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

    listArtifactExports() {
      return [...packages.values()].map((pkg) => pkg.exportModel);
    },

    findArtifactExport(artifactId) {
      return (
        [...packages.values()]
          .find((pkg) => pkg.exportModel.artifactId === artifactId)
          ?.exportModel ?? null
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

