import type {
  BuildArtifactExportInput,
  ArtifactExportModel,
} from '../../model';

export type ArtifactExportStrategy = {
  readonly id: string;
  supports(input: BuildArtifactExportInput): boolean;
  buildModel(
    input: BuildArtifactExportInput,
    createExportModelId: (input: BuildArtifactExportInput) => string,
  ): ArtifactExportModel;
  exportModel(model: ArtifactExportModel): ArtifactExportModel;
};

export type ArtifactExportValidatorLike = {
  validate(
    input: ArtifactExportModel,
  ): {
    valid: boolean;
    issues: readonly { code: string; severity: 'error' | 'warning'; message: string }[];
  };
};

export function createBasicArtifactExportStrategy(options?: {
  readonly schemaVersionDeterministic?: string;
}): ArtifactExportStrategy {
  const schemaVersionDeterministic = options?.schemaVersionDeterministic ?? '1';

  return {
    id: 'basic-artifact-export-strategy',

    supports(input) {
      return (
        input.artifactId.trim().length > 0 &&
        input.artifactType.trim().length > 0 &&
        input.exportVersion.trim().length > 0 &&
        input.schemaVersion.trim().length > 0
      );
    },

    buildModel(input, createIdOverride) {
      const schemaVersion = input.schemaVersion.trim() || schemaVersionDeterministic;
      const resolvedInput: BuildArtifactExportInput = {
        ...input,
        schemaVersion,
      };
      return {
        id: createIdOverride(resolvedInput),
        artifactId: resolvedInput.artifactId,
        artifactType: resolvedInput.artifactType,
        exportVersion: resolvedInput.exportVersion,
        schemaVersion: resolvedInput.schemaVersion,
        metadata: {
          title: resolvedInput.title?.trim() || resolvedInput.artifactId,
          notes: resolvedInput.notes?.trim() || 'Deterministic export contract payload.',
          status: resolvedInput.status ?? 'Active',
        },
      };
    },

    exportModel(model) {
      return {
        ...model,
        metadata: {
          ...model.metadata,
          status: 'Exported',
        },
      };
    },
  };
}

export function createDeterministicExportModelId(
  input: BuildArtifactExportInput,
): string {
  return `export-${input.artifactId}-${input.exportVersion}-${input.schemaVersion}`;
}

