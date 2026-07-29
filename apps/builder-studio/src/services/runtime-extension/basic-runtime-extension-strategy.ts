import type {
  InitializeExtensionInput,
  RegisterRuntimeExtensionInput,
  RuntimeExtension,
  RuntimeExtensionPackage,
  RuntimeExtensionRegistry,
  RuntimeExtensionValidation,
  RuntimeExtensionValidationIssue,
} from '../../model';

/**
 * RuntimeExtensionStrategy (EPIC-BLD-54).
 * Deterministic register / enable / disable — no dynamic loading.
 */
export type RuntimeExtensionStrategy = {
  readonly id: string;
  supports(input: RegisterRuntimeExtensionInput): boolean;
  register(
    input: RegisterRuntimeExtensionInput,
    createId: (prefix: string) => string,
  ): RuntimeExtension;
  enable(extension: RuntimeExtension): RuntimeExtension;
  disable(extension: RuntimeExtension): RuntimeExtension;
};

/**
 * BasicRuntimeExtensionStrategy — maps inputs into extension descriptors.
 */
export function createBasicRuntimeExtensionStrategy(): RuntimeExtensionStrategy {
  return {
    id: 'basic-runtime-extension-strategy',

    supports(input) {
      return (
        input.name.trim().length > 0 &&
        input.version.trim().length > 0 &&
        input.capability.trim().length > 0
      );
    },

    register(input, createId) {
      return {
        id: createId('runtime-extension'),
        name: input.name,
        version: input.version,
        capability: input.capability,
        dependencies: [...(input.dependencies ?? [])],
        status: input.status ?? 'Registered',
        metadata: {
          title: input.title?.trim() || input.name,
          notes:
            input.notes?.trim() ||
            'Runtime extension — registry only, no dynamic loading.',
          contractId: input.contractId ?? null,
          source: input.source?.trim() || 'Runtime Contract Manager',
        },
      };
    },

    enable(extension) {
      if (extension.status === 'Disabled' || extension.status === 'Registered') {
        return {
          ...extension,
          status: 'Enabled',
        };
      }
      return extension;
    },

    disable(extension) {
      if (extension.status === 'Enabled' || extension.status === 'Published') {
        return {
          ...extension,
          status: 'Disabled',
        };
      }
      if (extension.status === 'Registered') {
        return {
          ...extension,
          status: 'Disabled',
        };
      }
      return extension;
    },
  };
}

/**
 * RuntimeExtensionValidator (EPIC-BLD-54).
 */
export type RuntimeExtensionValidator = {
  validate(pkg: RuntimeExtensionPackage): RuntimeExtensionValidation;
  validateExtension(
    pkg: RuntimeExtensionPackage,
  ): readonly RuntimeExtensionValidationIssue[];
  validateDependencies(
    pkg: RuntimeExtensionPackage,
  ): readonly RuntimeExtensionValidationIssue[];
  validateIntegrity(
    pkg: RuntimeExtensionPackage,
  ): readonly RuntimeExtensionValidationIssue[];
};

export function createRuntimeExtensionValidator(options?: {
  readonly now?: () => Date;
}): RuntimeExtensionValidator {
  const now = options?.now ?? (() => new Date());

  const validateExtension = (
    pkg: RuntimeExtensionPackage,
  ): RuntimeExtensionValidationIssue[] => {
    const issues: RuntimeExtensionValidationIssue[] = [];
    const seen = new Set<string>();
    for (const extension of pkg.registry.extensions) {
      if (!extension.name.trim()) {
        issues.push({
          code: 'extension-missing-name',
          severity: 'error',
          message: `Extension ${extension.id} missing name.`,
        });
      }
      if (!extension.capability.trim()) {
        issues.push({
          code: 'extension-missing-capability',
          severity: 'error',
          message: `Extension ${extension.id} missing capability.`,
        });
      }
      if (!extension.version.trim()) {
        issues.push({
          code: 'extension-missing-version',
          severity: 'error',
          message: `Extension ${extension.id} missing version.`,
        });
      }
      const key = `${extension.capability}:${extension.version}:${extension.name}`;
      if (seen.has(key)) {
        issues.push({
          code: 'extension-duplicate',
          severity: 'warning',
          message: `Duplicate extension for ${key}.`,
        });
      }
      seen.add(key);
    }
    return issues;
  };

  const validateDependencies = (
    pkg: RuntimeExtensionPackage,
  ): RuntimeExtensionValidationIssue[] => {
    const issues: RuntimeExtensionValidationIssue[] = [];
    const names = new Set(
      pkg.registry.extensions.map((item) => item.name),
    );
    const capabilities = new Set(
      pkg.registry.extensions.map((item) => item.capability),
    );
    for (const extension of pkg.registry.extensions) {
      for (const dep of extension.dependencies) {
        if (!names.has(dep) && !capabilities.has(dep)) {
          issues.push({
            code: 'dependency-unresolved',
            severity: 'warning',
            message: `Extension ${extension.id} depends on unresolved ${dep}.`,
          });
        }
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeExtensionPackage,
  ): RuntimeExtensionValidationIssue[] => {
    const issues: RuntimeExtensionValidationIssue[] = [];
    if (!pkg.registry.id.trim()) {
      issues.push({
        code: 'registry-missing-id',
        severity: 'error',
        message: 'Extension registry missing id.',
      });
    }
    if (pkg.metadata.sessionId !== pkg.registry.metadata.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match registry.sessionId.',
      });
    }
    if (pkg.registry.extensions.length === 0) {
      issues.push({
        code: 'registry-empty',
        severity: 'warning',
        message: 'Extension registry has no extensions.',
      });
    }
    for (const extension of pkg.registry.extensions) {
      if (
        extension.status === 'Enabled' &&
        extension.metadata.contractId === null
      ) {
        issues.push({
          code: 'enabled-without-contract',
          severity: 'warning',
          message: `Enabled extension ${extension.id} has no contractId.`,
        });
      }
    }
    return issues;
  };

  return {
    validateExtension,
    validateDependencies,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateExtension(pkg),
        ...validateDependencies(pkg),
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

export function buildInitialExtensionRegistry(
  input: InitializeExtensionInput,
  createId: (prefix: string) => string,
  now: () => Date,
): RuntimeExtensionRegistry {
  return {
    id: createId('runtime-extension-registry'),
    extensions: [],
    generatedAt: now().toISOString(),
    metadata: {
      title:
        input.title?.trim() || `Runtime Extensions ${input.sessionId}`,
      notes: 'Extension registry — management only, no dynamic loading.',
      sessionId: input.sessionId,
    },
  };
}
