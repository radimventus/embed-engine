import type {
  InitializeIntegrationInput,
  RegisterRuntimePackageInput,
  RuntimeIntegrationCatalog,
  RuntimeIntegrationPackage,
  RuntimeIntegrationRecord,
  RuntimeIntegrationValidation,
  RuntimeIntegrationValidationIssue,
} from '../../model';

/**
 * RuntimeIntegrationStrategy (EPIC-BLD-48).
 * Deterministic registration / resolve only — no Runtime mutation.
 */
export type RuntimeIntegrationStrategy = {
  readonly id: string;
  supports(input: RegisterRuntimePackageInput): boolean;
  register(
    input: RegisterRuntimePackageInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): RuntimeIntegrationRecord;
  resolve(
    catalog: RuntimeIntegrationCatalog,
    packageId: string,
  ): RuntimeIntegrationRecord | null;
};

/**
 * BasicRuntimeIntegrationStrategy — maps published package refs into records.
 */
export function createBasicRuntimeIntegrationStrategy(): RuntimeIntegrationStrategy {
  return {
    id: 'basic-runtime-integration-strategy',

    supports(input) {
      return (
        input.packageId.trim().length > 0 &&
        input.version.trim().length > 0 &&
        input.source.trim().length > 0
      );
    },

    register(input, createId, now) {
      const stamp = input.publishedAt?.trim() || now().toISOString();
      return {
        id: createId('runtime-integration-record'),
        packageId: input.packageId,
        packageType: input.packageType,
        version: input.version,
        source: input.source,
        publishedAt: stamp,
        metadata: {
          title:
            input.title?.trim() ||
            `${input.packageType} ${input.packageId}`,
          notes:
            input.notes?.trim() ||
            'Registered published Runtime package — integration only.',
          status: input.status?.trim() || 'Published',
        },
      };
    },

    resolve(catalog, packageId) {
      return (
        catalog.records.find((record) => record.packageId === packageId) ??
        null
      );
    },
  };
}

/**
 * RuntimeIntegrationValidator (EPIC-BLD-48).
 */
export type RuntimeIntegrationValidator = {
  validate(pkg: RuntimeIntegrationPackage): RuntimeIntegrationValidation;
  validateCatalog(
    pkg: RuntimeIntegrationPackage,
  ): readonly RuntimeIntegrationValidationIssue[];
  validateRecords(
    pkg: RuntimeIntegrationPackage,
  ): readonly RuntimeIntegrationValidationIssue[];
  validateIntegrity(
    pkg: RuntimeIntegrationPackage,
  ): readonly RuntimeIntegrationValidationIssue[];
};

export function createRuntimeIntegrationValidator(options?: {
  readonly now?: () => Date;
}): RuntimeIntegrationValidator {
  const now = options?.now ?? (() => new Date());

  const validateCatalog = (
    pkg: RuntimeIntegrationPackage,
  ): RuntimeIntegrationValidationIssue[] => {
    const issues: RuntimeIntegrationValidationIssue[] = [];
    if (!pkg.catalog.id.trim()) {
      issues.push({
        code: 'catalog-missing-id',
        severity: 'error',
        message: 'Catalog missing id.',
      });
    }
    if (!pkg.catalog.metadata.sessionId.trim()) {
      issues.push({
        code: 'catalog-missing-session',
        severity: 'error',
        message: `Catalog ${pkg.catalog.id} missing sessionId.`,
      });
    }
    return issues;
  };

  const validateRecords = (
    pkg: RuntimeIntegrationPackage,
  ): RuntimeIntegrationValidationIssue[] => {
    const issues: RuntimeIntegrationValidationIssue[] = [];
    const seen = new Set<string>();
    for (const record of pkg.catalog.records) {
      if (!record.packageId.trim()) {
        issues.push({
          code: 'record-missing-package-id',
          severity: 'error',
          message: `Record ${record.id} missing packageId.`,
        });
      }
      if (!record.version.trim()) {
        issues.push({
          code: 'record-missing-version',
          severity: 'error',
          message: `Record ${record.id} missing version.`,
        });
      }
      if (!record.source.trim()) {
        issues.push({
          code: 'record-missing-source',
          severity: 'error',
          message: `Record ${record.id} missing source.`,
        });
      }
      const key = `${record.packageType}:${record.packageId}`;
      if (seen.has(key)) {
        issues.push({
          code: 'record-duplicate',
          severity: 'warning',
          message: `Duplicate registration for ${key}.`,
        });
      }
      seen.add(key);
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeIntegrationPackage,
  ): RuntimeIntegrationValidationIssue[] => {
    const issues: RuntimeIntegrationValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.catalog.metadata.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match catalog.sessionId.',
      });
    }
    if (pkg.catalog.records.length === 0) {
      issues.push({
        code: 'catalog-empty',
        severity: 'warning',
        message: 'Catalog has no registered packages.',
      });
    }
    return issues;
  };

  return {
    validateCatalog,
    validateRecords,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateCatalog(pkg),
        ...validateRecords(pkg),
        ...validateIntegrity(pkg),
      ];
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}

export function buildInitialCatalog(
  input: InitializeIntegrationInput,
  createId: (prefix: string) => string,
  now: () => Date,
): RuntimeIntegrationCatalog {
  return {
    id: createId('runtime-integration-catalog'),
    records: [],
    createdAt: now().toISOString(),
    metadata: {
      title: input.title?.trim() || `Runtime Integration ${input.sessionId}`,
      notes: 'Catalog of published Runtime packages — integration only.',
      sessionId: input.sessionId,
    },
  };
}
