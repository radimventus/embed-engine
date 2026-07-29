import type {
  RegisterPolicyInput,
  RuntimePolicy,
  RuntimePolicyPackage,
  RuntimePolicyRegistry,
  RuntimePolicyValidation,
  RuntimePolicyValidationIssue,
  UpdatePolicyInput,
} from '../../model';

/**
 * PolicyRegistryStrategy (EPIC-BLD-40).
 * Deterministic registry management — no enforcement / AI.
 */
export type PolicyRegistryStrategy = {
  readonly id: string;
  supports(input: RegisterPolicyInput): boolean;
  register(
    input: RegisterPolicyInput,
    createId: (prefix: string) => string,
  ): RuntimePolicy;
  publish(
    registry: RuntimePolicyRegistry,
    createId: (prefix: string) => string,
    now: () => Date,
  ): RuntimePolicyRegistry;
};

/**
 * BasicPolicyRegistryStrategy — in-memory deterministic policy registration.
 */
export function createBasicPolicyRegistryStrategy(): PolicyRegistryStrategy {
  return {
    id: 'basic-policy-registry-strategy',

    supports(input) {
      return (
        input.name.trim().length > 0 &&
        input.description.trim().length > 0 &&
        input.category.trim().length > 0
      );
    },

    register(input, createId) {
      const code =
        input.code?.trim() ||
        input.name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      return {
        id: createId('runtime-policy'),
        name: input.name.trim(),
        category: input.category,
        version: input.version?.trim() || '1.0.0',
        description: input.description.trim(),
        status: 'Draft',
        metadata: {
          code,
          notes: input.notes?.trim() || 'Registered platform policy.',
          severity: input.severity ?? 'error',
        },
      };
    },

    publish(registry, _createId, now) {
      const stamp = now().toISOString();
      const nextVersion = bumpPatch(registry.version);
      return {
        ...registry,
        version: nextVersion,
        updatedAt: stamp,
        policies: registry.policies.map((policy) =>
          policy.status === 'Draft'
            ? { ...policy, status: 'Active' as const }
            : policy,
        ),
        metadata: {
          ...registry.metadata,
          status: 'Published',
          notes: 'Policy registry published for Governance consumption.',
        },
      };
    },
  };
}

function bumpPatch(version: string): string {
  const parts = version.split('.').map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return '1.0.1';
  }
  return `${parts[0]}.${parts[1]}.${(parts[2] ?? 0) + 1}`;
}

export function applyPolicyUpdate(
  policy: RuntimePolicy,
  patch: UpdatePolicyInput,
): RuntimePolicy {
  return {
    ...policy,
    name: patch.name?.trim() || policy.name,
    category: patch.category ?? policy.category,
    description: patch.description?.trim() || policy.description,
    status: patch.status ?? policy.status,
    version: patch.version?.trim() || policy.version,
    metadata: {
      ...policy.metadata,
      notes: patch.notes?.trim() || policy.metadata.notes,
      severity: patch.severity ?? policy.metadata.severity,
    },
  };
}

export const SEED_POLICIES: readonly Omit<
  RuntimePolicy,
  'id'
>[] = [
  {
    name: 'Observability Required',
    category: 'Observability',
    version: '1.0.0',
    description: 'Runtime sessions must publish Observability packages.',
    status: 'Active',
    metadata: {
      code: 'observability-present',
      notes: 'Seed policy for Governance.',
      severity: 'error',
    },
  },
  {
    name: 'Health Score Gate',
    category: 'Health',
    version: '1.0.0',
    description: 'Runtime Health score must meet platform threshold.',
    status: 'Active',
    metadata: {
      code: 'health-score-threshold',
      notes: 'Seed policy for Governance.',
      severity: 'error',
    },
  },
  {
    name: 'Audit Trail Required',
    category: 'Audit',
    version: '1.0.0',
    description: 'Immutable audit trail must exist for each session.',
    status: 'Active',
    metadata: {
      code: 'audit-trail-present',
      notes: 'Seed policy for Governance.',
      severity: 'error',
    },
  },
  {
    name: 'Session Binding',
    category: 'Session',
    version: '1.0.0',
    description: 'Policies and evaluations must be bound to a session id.',
    status: 'Active',
    metadata: {
      code: 'session-bound',
      notes: 'Seed policy for Governance.',
      severity: 'error',
    },
  },
];

/**
 * RuntimePolicyValidator (EPIC-BLD-40).
 */
export type RuntimePolicyValidator = {
  validate(pkg: RuntimePolicyPackage): RuntimePolicyValidation;
  validatePolicies(
    pkg: RuntimePolicyPackage,
  ): readonly RuntimePolicyValidationIssue[];
  validateRegistry(
    pkg: RuntimePolicyPackage,
  ): readonly RuntimePolicyValidationIssue[];
  validateIntegrity(
    pkg: RuntimePolicyPackage,
  ): readonly RuntimePolicyValidationIssue[];
};

export function createRuntimePolicyValidator(options?: {
  readonly now?: () => Date;
}): RuntimePolicyValidator {
  const now = options?.now ?? (() => new Date());

  const validatePolicies = (
    pkg: RuntimePolicyPackage,
  ): RuntimePolicyValidationIssue[] => {
    const issues: RuntimePolicyValidationIssue[] = [];
    const codes = new Set<string>();
    const ids = new Set<string>();
    for (const policy of pkg.registry.policies) {
      if (ids.has(policy.id)) {
        issues.push({
          code: 'duplicate-policy-id',
          severity: 'error',
          message: `Duplicate policy id ${policy.id}.`,
        });
      }
      ids.add(policy.id);
      if (codes.has(policy.metadata.code)) {
        issues.push({
          code: 'duplicate-policy-code',
          severity: 'error',
          message: `Duplicate policy code ${policy.metadata.code}.`,
        });
      }
      codes.add(policy.metadata.code);
      if (!policy.name.trim() || !policy.description.trim()) {
        issues.push({
          code: 'policy-incomplete',
          severity: 'error',
          message: `Policy ${policy.id} missing name or description.`,
        });
      }
    }
    return issues;
  };

  const validateRegistry = (
    pkg: RuntimePolicyPackage,
  ): RuntimePolicyValidationIssue[] => {
    const issues: RuntimePolicyValidationIssue[] = [];
    if (!pkg.registry.id.trim()) {
      issues.push({
        code: 'registry-missing-id',
        severity: 'error',
        message: 'Registry missing id.',
      });
    }
    if (pkg.registry.policies.length === 0) {
      issues.push({
        code: 'empty-registry',
        severity: 'error',
        message: `Registry ${pkg.registry.id} has no policies.`,
      });
    }
    if (
      pkg.registry.metadata.status === 'Published' &&
      !pkg.registry.policies.some((item) => item.status === 'Active')
    ) {
      issues.push({
        code: 'published-without-active',
        severity: 'warning',
        message: 'Published registry has no Active policies.',
      });
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimePolicyPackage,
  ): RuntimePolicyValidationIssue[] => {
    const issues: RuntimePolicyValidationIssue[] = [];
    if (pkg.version.trim().length === 0) {
      issues.push({
        code: 'package-missing-version',
        severity: 'error',
        message: `Package ${pkg.id} missing version.`,
      });
    }
    if (
      pkg.metadata.status === 'Published' &&
      pkg.registry.metadata.status !== 'Published'
    ) {
      issues.push({
        code: 'package-registry-status-mismatch',
        severity: 'error',
        message: 'Published package requires published registry.',
      });
    }
    return issues;
  };

  return {
    validatePolicies,
    validateRegistry,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validatePolicies(pkg),
        ...validateRegistry(pkg),
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
