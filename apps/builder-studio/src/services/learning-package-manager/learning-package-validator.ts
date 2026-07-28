import type {
  LearningPackageValidation,
  LearningPackageValidationIssue,
  LearningPackageVersion,
  LearningRecordReference,
  LearningRecordsPackage,
} from '../../model';

/**
 * LearningPackageValidator (EPIC-BLD-23).
 * Structural validation only — no pattern/heuristic generation.
 */
export type LearningPackageValidator = {
  validate(pkg: LearningRecordsPackage): LearningPackageValidation;
  validateRecords(
    records: readonly LearningRecordReference[],
  ): readonly LearningPackageValidationIssue[];
  validateVersion(
    version: LearningPackageVersion,
  ): readonly LearningPackageValidationIssue[];
};

export function createLearningPackageValidator(options?: {
  readonly now?: () => Date;
}): LearningPackageValidator {
  const now = options?.now ?? (() => new Date());

  const validateRecords = (
    records: readonly LearningRecordReference[],
  ): LearningPackageValidationIssue[] => {
    const issues: LearningPackageValidationIssue[] = [];
    const seen = new Set<string>();
    for (const ref of records) {
      if (ref.recordId.trim() === '') {
        issues.push({
          code: 'empty-record-id',
          severity: 'error',
          message: `Reference ${ref.id} has empty recordId.`,
        });
      }
      if (seen.has(ref.recordId)) {
        issues.push({
          code: 'duplicate-record-ref',
          severity: 'error',
          message: `Duplicate record reference: ${ref.recordId}`,
        });
      }
      seen.add(ref.recordId);
    }
    return issues;
  };

  const validateVersion = (
    version: LearningPackageVersion,
  ): LearningPackageValidationIssue[] => {
    const issues: LearningPackageValidationIssue[] = [];
    if (version.version.trim() === '') {
      issues.push({
        code: 'empty-version',
        severity: 'error',
        message: 'Package version is required.',
      });
    }
    if (version.author.trim() === '') {
      issues.push({
        code: 'empty-author',
        severity: 'warning',
        message: 'Package version author is empty.',
      });
    }
    return issues;
  };

  return {
    validateRecords,
    validateVersion,
    validate(pkg) {
      const issues: LearningPackageValidationIssue[] = [
        ...validateRecords(pkg.records),
      ];
      if (pkg.name.trim() === '') {
        issues.push({
          code: 'empty-name',
          severity: 'error',
          message: 'Package name is required.',
        });
      }
      const currentVersion = pkg.versions[pkg.versions.length - 1];
      if (currentVersion !== undefined) {
        issues.push(...validateVersion(currentVersion));
      } else {
        issues.push({
          code: 'missing-version',
          severity: 'error',
          message: 'Package has no version history.',
        });
      }
      if (pkg.metadata.status === 'Published' && pkg.records.length === 0) {
        issues.push({
          code: 'published-empty',
          severity: 'warning',
          message: 'Published package has no record references.',
        });
      }
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
