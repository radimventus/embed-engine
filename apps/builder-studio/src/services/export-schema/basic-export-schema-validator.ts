import type {
  ExportSchema,
  ExportSchemaValidation,
  ExportSchemaValidationIssue,
} from '../../model';

export type ExportSchemaValidator = {
  validate(schemas: readonly ExportSchema[]): ExportSchemaValidation;
  validateVersion(schema: ExportSchema): readonly string[];
  validateMetadata(schema: ExportSchema): readonly string[];
  validateIntegrity(schemas: readonly ExportSchema[]): readonly string[];
};

export function createBasicExportSchemaValidator(): ExportSchemaValidator {
  const asIssues = (
    code: string,
    messages: readonly string[],
    severity: 'error' | 'warning',
  ): readonly ExportSchemaValidationIssue[] =>
    messages.map((message) => ({ code, severity, message }));

  return {
    validate(schemas) {
      const allIssues: ExportSchemaValidationIssue[] = [];
      for (const schema of schemas) {
        allIssues.push(...asIssues('version', this.validateVersion(schema), 'error'));
        allIssues.push(...asIssues('metadata', this.validateMetadata(schema), 'error'));
      }
      allIssues.push(...asIssues('integrity', this.validateIntegrity(schemas), 'warning'));
      return {
        valid: allIssues.every((i) => i.severity !== 'error'),
        issues: allIssues,
        validatedAt: new Date().toISOString(),
      };
    },

    validateVersion(schema) {
      const issues: string[] = [];
      if (!schema.schemaVersion.trim()) {
        issues.push(`Schema "${schema.name}" has empty schemaVersion.`);
      }
      return issues;
    },

    validateMetadata(schema) {
      const issues: string[] = [];
      if (!schema.metadata.title.trim()) {
        issues.push(`Schema "${schema.name}" has empty metadata.title.`);
      }
      return issues;
    },

    validateIntegrity(schemas) {
      const issues: string[] = [];
      const ids = schemas.map((s) => s.id);
      if (new Set(ids).size !== ids.length) {
        issues.push('Duplicate schema IDs detected.');
      }
      return issues;
    },
  };
}
