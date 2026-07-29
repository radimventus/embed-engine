import type {
  InitializeRegistryInput,
  RegisterRegistryPackageInput,
  RuntimeRegistryCatalog,
  RuntimeRegistryEntry,
  RuntimeRegistryPackage,
  RuntimeRegistryValidation,
  RuntimeRegistryValidationIssue,
} from '../../model';

/**
 * RuntimeRegistryStrategy (EPIC-BLD-49).
 * Deterministic registration / lookup only — no aggregation or publish.
 */
export type RuntimeRegistryStrategy = {
  readonly id: string;
  supports(input: RegisterRegistryPackageInput): boolean;
  register(
    input: RegisterRegistryPackageInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): RuntimeRegistryEntry;
  lookup(
    catalog: RuntimeRegistryCatalog,
    packageId: string,
  ): RuntimeRegistryEntry | null;
};

/**
 * BasicRuntimeRegistryStrategy — maps published refs into registry entries.
 */
export function createBasicRuntimeRegistryStrategy(): RuntimeRegistryStrategy {
  return {
    id: 'basic-runtime-registry-strategy',

    supports(input) {
      return (
        input.packageId.trim().length > 0 &&
        input.version.trim().length > 0 &&
        input.source.trim().length > 0
      );
    },

    register(input, createId, now) {
      const stamp = input.registeredAt?.trim() || now().toISOString();
      return {
        id: createId('runtime-registry-entry'),
        packageId: input.packageId,
        packageType: input.packageType,
        version: input.version,
        source: input.source,
        registeredAt: stamp,
        metadata: {
          title:
            input.title?.trim() ||
            `${input.packageType} ${input.packageId}`,
          notes:
            input.notes?.trim() ||
            'Registered published Runtime package — registry only.',
          status: input.status?.trim() || 'Published',
          publishedAt: input.publishedAt ?? null,
        },
      };
    },

    lookup(catalog, packageId) {
      return (
        catalog.entries.find((entry) => entry.packageId === packageId) ?? null
      );
    },
  };
}

/**
 * RuntimeRegistryValidator (EPIC-BLD-49).
 */
export type RuntimeRegistryValidator = {
  validate(pkg: RuntimeRegistryPackage): RuntimeRegistryValidation;
  validateEntries(
    pkg: RuntimeRegistryPackage,
  ): readonly RuntimeRegistryValidationIssue[];
  validateCatalog(
    pkg: RuntimeRegistryPackage,
  ): readonly RuntimeRegistryValidationIssue[];
  validateIntegrity(
    pkg: RuntimeRegistryPackage,
  ): readonly RuntimeRegistryValidationIssue[];
};

export function createRuntimeRegistryValidator(options?: {
  readonly now?: () => Date;
}): RuntimeRegistryValidator {
  const now = options?.now ?? (() => new Date());

  const validateCatalog = (
    pkg: RuntimeRegistryPackage,
  ): RuntimeRegistryValidationIssue[] => {
    const issues: RuntimeRegistryValidationIssue[] = [];
    if (!pkg.catalog.id.trim()) {
      issues.push({
        code: 'catalog-missing-id',
        severity: 'error',
        message: 'Registry catalog missing id.',
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

  const validateEntries = (
    pkg: RuntimeRegistryPackage,
  ): RuntimeRegistryValidationIssue[] => {
    const issues: RuntimeRegistryValidationIssue[] = [];
    const seen = new Set<string>();
    for (const entry of pkg.catalog.entries) {
      if (!entry.packageId.trim()) {
        issues.push({
          code: 'entry-missing-package-id',
          severity: 'error',
          message: `Entry ${entry.id} missing packageId.`,
        });
      }
      if (!entry.version.trim()) {
        issues.push({
          code: 'entry-missing-version',
          severity: 'error',
          message: `Entry ${entry.id} missing version.`,
        });
      }
      if (!entry.source.trim()) {
        issues.push({
          code: 'entry-missing-source',
          severity: 'error',
          message: `Entry ${entry.id} missing source.`,
        });
      }
      if (!entry.registeredAt.trim()) {
        issues.push({
          code: 'entry-missing-registered-at',
          severity: 'error',
          message: `Entry ${entry.id} missing registeredAt.`,
        });
      }
      const key = `${entry.packageType}:${entry.packageId}:${entry.version}`;
      if (seen.has(key)) {
        issues.push({
          code: 'entry-duplicate',
          severity: 'warning',
          message: `Duplicate registry entry for ${key}.`,
        });
      }
      seen.add(key);
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeRegistryPackage,
  ): RuntimeRegistryValidationIssue[] => {
    const issues: RuntimeRegistryValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.catalog.metadata.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match catalog.sessionId.',
      });
    }
    if (pkg.catalog.entries.length === 0) {
      issues.push({
        code: 'catalog-empty',
        severity: 'warning',
        message: 'Registry catalog has no entries.',
      });
    }
    return issues;
  };

  return {
    validateCatalog,
    validateEntries,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateCatalog(pkg),
        ...validateEntries(pkg),
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

export function buildInitialRegistryCatalog(
  input: InitializeRegistryInput,
  createId: (prefix: string) => string,
  now: () => Date,
): RuntimeRegistryCatalog {
  return {
    id: createId('runtime-registry-catalog'),
    entries: [],
    createdAt: now().toISOString(),
    metadata: {
      title: input.title?.trim() || `Runtime Registry ${input.sessionId}`,
      notes: 'Catalog of registered published Runtime packages.',
      sessionId: input.sessionId,
    },
  };
}
