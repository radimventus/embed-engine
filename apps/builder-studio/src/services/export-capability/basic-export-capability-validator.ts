import type {
  ExportCapability,
  ExportCapabilityValidation,
  ExportCapabilityValidationIssue,
} from '../../model';

export type ExportCapabilityValidator = {
  validate(capabilities: readonly ExportCapability[]): ExportCapabilityValidation;
  validateSchemas(capability: ExportCapability): readonly string[];
  validateIntegrity(capabilities: readonly ExportCapability[]): readonly string[];
  validateMetadata(capability: ExportCapability): readonly string[];
};

export function createBasicExportCapabilityValidator(): ExportCapabilityValidator {
  const toIssues = (
    code: string,
    messages: readonly string[],
    severity: 'error' | 'warning',
  ): readonly ExportCapabilityValidationIssue[] =>
    messages.map((message) => ({ code, severity, message }));

  return {
    validate(capabilities) {
      const issues: ExportCapabilityValidationIssue[] = [];
      for (const c of capabilities) {
        issues.push(
          ...toIssues('schemas', this.validateSchemas(c), 'error'),
          ...toIssues('metadata', this.validateMetadata(c), 'error'),
        );
      }
      issues.push(
        ...toIssues('integrity', this.validateIntegrity(capabilities), 'warning'),
      );

      return {
        valid: issues.every((i) => i.severity !== 'error'),
        issues,
        validatedAt: new Date().toISOString(),
      };
    },

    validateSchemas(capability) {
      const issues: string[] = [];
      if (capability.supportedSchemaVersions.length === 0) {
        issues.push(`Capability \"${capability.name}\" has no supportedSchemaVersions.`);
      }
      if (capability.supportedSchemaVersions.some((v) => v.trim().length === 0)) {
        issues.push(`Capability \"${capability.name}\" has empty supportedSchemaVersions entries.`);
      }
      return issues;
    },

    validateIntegrity(capabilities) {
      const ids = capabilities.map((c) => c.id);
      const names = capabilities.map((c) => c.name);
      const issues: string[] = [];
      if (new Set(ids).size !== ids.length) {
        issues.push('Duplicate capability IDs detected.');
      }
      // Duplicate names are allowed across versions/registrations in principle,
      // but for determinism we flag them as warnings.
      if (new Set(names).size !== names.length) {
        issues.push('Duplicate capability names detected.');
      }
      return issues;
    },

    validateMetadata(capability) {
      const issues: string[] = [];
      if (!capability.metadata.title.trim()) {
        issues.push(`Capability \"${capability.name}\" metadata.title is required.`);
      }
      if (!capability.metadata.notes.trim()) {
        issues.push(`Capability \"${capability.name}\" metadata.notes is required.`);
      }
      return issues;
    },
  };
}

