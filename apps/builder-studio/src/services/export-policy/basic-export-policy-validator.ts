import type {
  ExportPolicy,
  ExportPolicyValidation,
  ExportPolicyValidationIssue,
} from '../../model';

export type ExportPolicyValidator = {
  validate(policies: readonly ExportPolicy[]): ExportPolicyValidation;
  validateConditions(policy: ExportPolicy): readonly string[];
  validateIntegrity(policies: readonly ExportPolicy[]): readonly string[];
  validateMetadata(policy: ExportPolicy): readonly string[];
};

export function createBasicExportPolicyValidator(): ExportPolicyValidator {
  const toIssues = (
    code: string,
    messages: readonly string[],
    severity: 'error' | 'warning',
  ): readonly ExportPolicyValidationIssue[] =>
    messages.map((message) => ({ code, severity, message }));

  return {
    validate(policies) {
      const issues: ExportPolicyValidationIssue[] = [];
      for (const policy of policies) {
        issues.push(
          ...toIssues('conditions', this.validateConditions(policy), 'error'),
          ...toIssues('metadata', this.validateMetadata(policy), 'error'),
        );
      }
      issues.push(
        ...toIssues('integrity', this.validateIntegrity(policies), 'warning'),
      );

      return {
        valid: issues.every((i) => i.severity !== 'error'),
        issues,
        validatedAt: new Date().toISOString(),
      };
    },

    validateConditions(policy) {
      const issues: string[] = [];
      if (policy.conditions.length === 0) {
        issues.push(`Policy "${policy.name}" has no conditions.`);
      }
      if (policy.conditions.some((c) => c.trim().length === 0)) {
        issues.push(`Policy "${policy.name}" has empty conditions.`);
      }
      return issues;
    },

    validateIntegrity(policies) {
      const ids = policies.map((p) => p.id);
      const names = policies.map((p) => p.name);
      const issues: string[] = [];
      if (new Set(ids).size !== ids.length) {
        issues.push('Duplicate policy IDs detected.');
      }
      if (new Set(names).size !== names.length) {
        issues.push('Duplicate policy names detected.');
      }
      return issues;
    },

    validateMetadata(policy) {
      const issues: string[] = [];
      if (!policy.metadata.title.trim()) {
        issues.push(`Policy "${policy.name}" metadata.title is required.`);
      }
      if (!policy.metadata.notes.trim()) {
        issues.push(`Policy "${policy.name}" metadata.notes is required.`);
      }
      return issues;
    },
  };
}

