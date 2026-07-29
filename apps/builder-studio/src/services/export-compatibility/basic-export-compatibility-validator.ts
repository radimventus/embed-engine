import type {
  ExportCompatibility,
  ExportCompatibilityValidation,
  ExportCompatibilityValidationIssue,
} from '../../model';

export type ExportCompatibilityValidator = {
  validate(items: readonly ExportCompatibility[]): ExportCompatibilityValidation;
  validateVersions(c: ExportCompatibility): readonly string[];
  validateIntegrity(items: readonly ExportCompatibility[]): readonly string[];
  validateConsistency(items: readonly ExportCompatibility[]): readonly string[];
};

export function createBasicExportCompatibilityValidator(): ExportCompatibilityValidator {
  const asIssues = (code: string, msgs: readonly string[], severity: 'error' | 'warning'): readonly ExportCompatibilityValidationIssue[] =>
    msgs.map((message) => ({ code, severity, message }));

  return {
    validate(items) {
      const all: ExportCompatibilityValidationIssue[] = [];
      for (const c of items) {
        all.push(...asIssues('versions', this.validateVersions(c), 'error'));
      }
      all.push(...asIssues('integrity', this.validateIntegrity(items), 'warning'));
      all.push(...asIssues('consistency', this.validateConsistency(items), 'warning'));
      return { valid: all.every((i) => i.severity !== 'error'), issues: all, validatedAt: new Date().toISOString() };
    },

    validateVersions(c) {
      const issues: string[] = [];
      if (!c.sourceSchemaVersion.trim()) issues.push(`Compatibility "${c.id}" has empty sourceSchemaVersion.`);
      if (!c.targetSchemaVersion.trim()) issues.push(`Compatibility "${c.id}" has empty targetSchemaVersion.`);
      if (c.sourceSchemaVersion === c.targetSchemaVersion) issues.push(`Compatibility "${c.id}" has identical source and target versions.`);
      return issues;
    },

    validateIntegrity(items) {
      const ids = items.map((c) => c.id);
      if (new Set(ids).size !== ids.length) return ['Duplicate compatibility IDs detected.'];
      return [];
    },

    validateConsistency(items) {
      const issues: string[] = [];
      const pairs = new Set<string>();
      for (const c of items) {
        const key = `${c.sourceSchemaVersion}->${c.targetSchemaVersion}`;
        if (pairs.has(key)) issues.push(`Duplicate compatibility pair: ${key}.`);
        pairs.add(key);
      }
      return issues;
    },
  };
}
