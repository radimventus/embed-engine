import type {
  ArtifactExportModel,
  ArtifactExportValidation,
  ArtifactExportValidationIssue,
} from '../../model';

export type ArtifactExportValidator = {
  validate(input: ArtifactExportModel): ArtifactExportValidation;
  validateSchema(model: ArtifactExportModel): readonly string[];
  validateMetadata(model: ArtifactExportModel): readonly string[];
  validateIntegrity(model: ArtifactExportModel): readonly string[];
};

export function createBasicArtifactExportValidator(options?: {
  readonly supportedSchemaVersions?: readonly string[];
}): ArtifactExportValidator {
  const supportedSchemaVersions = options?.supportedSchemaVersions ?? ['1'];

  const asIssues = (
    code: string,
    messages: readonly string[],
    severity: 'error' | 'warning',
  ): readonly ArtifactExportValidationIssue[] =>
    messages.map((message) => ({
      code,
      severity,
      message,
    }));

  return {
    validate(model) {
      const schemaIssues = this.validateSchema(model);
      const metadataIssues = this.validateMetadata(model);
      const integrityIssues = this.validateIntegrity(model);

      const issues: ArtifactExportValidationIssue[] = [
        ...asIssues('schema', schemaIssues, 'error'),
        ...asIssues('metadata', metadataIssues, 'error'),
        ...asIssues('integrity', integrityIssues, 'warning'),
      ];

      return {
        valid: issues.every((issue) => issue.severity !== 'error'),
        issues,
        validatedAt: new Date().toISOString(),
      };
    },

    validateSchema(model) {
      if (!supportedSchemaVersions.includes(model.schemaVersion)) {
        return [`Unsupported schemaVersion: ${model.schemaVersion}.`];
      }
      return [];
    },

    validateMetadata(model) {
      const messages: string[] = [];
      if (!model.metadata.title.trim()) {
        messages.push('metadata.title is required.');
      }
      if (!model.metadata.status) {
        messages.push('metadata.status is required.');
      }
      return messages;
    },

    validateIntegrity(model) {
      // Contract-level integrity: deterministic status mapping, stable versions.
      const issues: string[] = [];
      if (!model.id.includes(model.artifactId)) {
        issues.push('exportModel.id does not appear to reference artifactId.');
      }
      if (!model.id.includes(model.exportVersion)) {
        issues.push('exportModel.id does not appear to reference exportVersion.');
      }
      return issues;
    },
  };
}
