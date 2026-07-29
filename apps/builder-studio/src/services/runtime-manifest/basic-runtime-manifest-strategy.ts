import type {
  CollectManifestInput,
  RuntimeCapabilityDescriptor,
  RuntimeManifest,
  RuntimeManifestPackage,
  RuntimeManifestValidation,
  RuntimeManifestValidationIssue,
} from '../../model';

/**
 * RuntimeManifestStrategy (EPIC-BLD-50).
 * Deterministic collect / generate only — declarative description.
 */
export type RuntimeManifestStrategy = {
  readonly id: string;
  supports(input: CollectManifestInput): boolean;
  collect(input: CollectManifestInput): CollectManifestInput;
  generate(
    input: CollectManifestInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): RuntimeManifest;
};

const DEFAULT_DEPENDENCIES: Record<string, readonly string[]> = {
  Policy: [],
  Governance: ['capability-policy'],
  Observability: [],
  Health: ['capability-observability'],
  Audit: ['capability-observability'],
  Enforcement: ['capability-policy', 'capability-governance'],
  Resilience: ['capability-health', 'capability-enforcement'],
  Recovery: ['capability-resilience'],
  Operations: [
    'capability-policy',
    'capability-governance',
    'capability-health',
    'capability-audit',
    'capability-enforcement',
    'capability-recovery',
  ],
  Other: [],
};

/**
 * BasicRuntimeManifestStrategy — maps registry/capability refs into manifest.
 */
export function createBasicRuntimeManifestStrategy(): RuntimeManifestStrategy {
  return {
    id: 'basic-runtime-manifest-strategy',

    supports(input) {
      return input.sessionId.trim().length > 0;
    },

    collect(input) {
      return {
        sessionId: input.sessionId,
        title: input.title,
        registryVersion: input.registryVersion ?? '1.0.0',
        manifestVersion: input.manifestVersion ?? '1.0.0',
        capabilities: (input.capabilities ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          version: item.version,
          packageId: item.packageId,
          dependencies: item.dependencies ?? [],
          source: item.source ?? 'Runtime Integration Registry',
          packageType: item.packageType ?? 'Other',
          title: item.title,
          notes: item.notes,
        })),
      };
    },

    generate(input, createId, now) {
      const collected = this.collect(input);
      const capabilities: RuntimeCapabilityDescriptor[] = (
        collected.capabilities ?? []
      ).map((item) => {
        const packageType = item.packageType ?? 'Other';
        const defaults = DEFAULT_DEPENDENCIES[packageType] ?? [];
        const deps =
          item.dependencies && item.dependencies.length > 0
            ? item.dependencies
            : defaults;
        return {
          id: item.id,
          name: item.name,
          version: item.version,
          package: item.packageId,
          dependencies: [...deps],
          metadata: {
            title: item.title?.trim() || item.name,
            notes:
              item.notes?.trim() ||
              'Declarative capability descriptor — manifest only.',
            source: item.source ?? 'Runtime Integration Registry',
            packageType,
          },
        };
      });
      return {
        id: createId('runtime-manifest'),
        version: collected.manifestVersion ?? '1.0.0',
        capabilities,
        packages: [...new Set(capabilities.map((item) => item.package))],
        registryVersion: collected.registryVersion ?? '1.0.0',
        generatedAt: now().toISOString(),
        metadata: {
          title:
            collected.title?.trim() ||
            `Runtime Manifest ${collected.sessionId}`,
          notes:
            'Declarative description of published Runtime capabilities.',
          sessionId: collected.sessionId,
        },
      };
    },
  };
}

/**
 * RuntimeManifestValidator (EPIC-BLD-50).
 */
export type RuntimeManifestValidator = {
  validate(pkg: RuntimeManifestPackage): RuntimeManifestValidation;
  validateManifest(
    pkg: RuntimeManifestPackage,
  ): readonly RuntimeManifestValidationIssue[];
  validateCapabilities(
    pkg: RuntimeManifestPackage,
  ): readonly RuntimeManifestValidationIssue[];
  validateIntegrity(
    pkg: RuntimeManifestPackage,
  ): readonly RuntimeManifestValidationIssue[];
};

export function createRuntimeManifestValidator(options?: {
  readonly now?: () => Date;
}): RuntimeManifestValidator {
  const now = options?.now ?? (() => new Date());

  const validateManifest = (
    pkg: RuntimeManifestPackage,
  ): RuntimeManifestValidationIssue[] => {
    const issues: RuntimeManifestValidationIssue[] = [];
    if (!pkg.manifest.id.trim()) {
      issues.push({
        code: 'manifest-missing-id',
        severity: 'error',
        message: 'Manifest missing id.',
      });
    }
    if (!pkg.manifest.version.trim()) {
      issues.push({
        code: 'manifest-missing-version',
        severity: 'error',
        message: 'Manifest missing version.',
      });
    }
    if (!pkg.manifest.metadata.sessionId.trim()) {
      issues.push({
        code: 'manifest-missing-session',
        severity: 'error',
        message: `Manifest ${pkg.manifest.id} missing sessionId.`,
      });
    }
    return issues;
  };

  const validateCapabilities = (
    pkg: RuntimeManifestPackage,
  ): RuntimeManifestValidationIssue[] => {
    const issues: RuntimeManifestValidationIssue[] = [];
    const ids = new Set(
      pkg.manifest.capabilities.map((capability) => capability.id),
    );
    const seen = new Set<string>();
    for (const capability of pkg.manifest.capabilities) {
      if (!capability.id.trim()) {
        issues.push({
          code: 'capability-missing-id',
          severity: 'error',
          message: 'Capability missing id.',
        });
      }
      if (!capability.package.trim()) {
        issues.push({
          code: 'capability-missing-package',
          severity: 'error',
          message: `Capability ${capability.id} missing package.`,
        });
      }
      if (!capability.version.trim()) {
        issues.push({
          code: 'capability-missing-version',
          severity: 'error',
          message: `Capability ${capability.id} missing version.`,
        });
      }
      if (seen.has(capability.id)) {
        issues.push({
          code: 'capability-duplicate',
          severity: 'warning',
          message: `Duplicate capability id ${capability.id}.`,
        });
      }
      seen.add(capability.id);
      for (const dep of capability.dependencies) {
        if (!ids.has(dep)) {
          issues.push({
            code: 'capability-missing-dependency',
            severity: 'warning',
            message: `Capability ${capability.id} depends on missing ${dep}.`,
          });
        }
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeManifestPackage,
  ): RuntimeManifestValidationIssue[] => {
    const issues: RuntimeManifestValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.manifest.metadata.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match manifest.sessionId.',
      });
    }
    const packageSet = new Set(pkg.manifest.packages);
    for (const capability of pkg.manifest.capabilities) {
      if (!packageSet.has(capability.package)) {
        issues.push({
          code: 'package-list-mismatch',
          severity: 'error',
          message: `Manifest packages missing ${capability.package}.`,
        });
      }
    }
    if (pkg.manifest.capabilities.length === 0) {
      issues.push({
        code: 'manifest-empty',
        severity: 'warning',
        message: 'Manifest has no capabilities.',
      });
    }
    return issues;
  };

  return {
    validateManifest,
    validateCapabilities,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateManifest(pkg),
        ...validateCapabilities(pkg),
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
