import type {
  InitializeContractInput,
  RegisterRuntimeContractInput,
  RuntimeContract,
  RuntimeContractPackage,
  RuntimeContractValidation,
  RuntimeContractValidationIssue,
  RuntimeOperationContract,
} from '../../model';

/**
 * RuntimeContractStrategy (EPIC-BLD-53).
 * Deterministic register / publish only — no routing or business logic.
 */
export type RuntimeContractStrategy = {
  readonly id: string;
  supports(input: RegisterRuntimeContractInput): boolean;
  register(
    input: RegisterRuntimeContractInput,
    createId: (prefix: string) => string,
  ): RuntimeContract;
  publish(
    pkg: RuntimeContractPackage,
    now: () => Date,
  ): RuntimeContractPackage;
};

/**
 * BasicRuntimeContractStrategy — maps inputs into contract descriptors.
 */
export function createBasicRuntimeContractStrategy(): RuntimeContractStrategy {
  return {
    id: 'basic-runtime-contract-strategy',

    supports(input) {
      return (
        input.name.trim().length > 0 &&
        input.version.trim().length > 0 &&
        input.capability.trim().length > 0
      );
    },

    register(input, createId) {
      const operations: RuntimeOperationContract[] = (
        input.operations ?? [
          {
            operation: 'preview',
            request: 'PreviewRequest',
            response: 'PreviewResponse',
            errors: ['NotFound', 'Unavailable'],
          },
        ]
      ).map((item) => ({
        id: createId('runtime-operation-contract'),
        operation: item.operation,
        request: item.request?.trim() || `${item.operation}Request`,
        response: item.response?.trim() || `${item.operation}Response`,
        errors: [...(item.errors ?? ['Unavailable'])],
        metadata: {
          title: item.title?.trim() || item.operation,
          notes:
            item.notes?.trim() ||
            'Operation contract — descriptive only.',
        },
      }));

      return {
        id: createId('runtime-contract'),
        name: input.name,
        version: input.version,
        capability: input.capability,
        operations,
        dependencies: [...(input.dependencies ?? [])],
        metadata: {
          title: input.title?.trim() || input.name,
          notes:
            input.notes?.trim() ||
            'Public Runtime contract — management only.',
          status: input.status ?? 'Draft',
          compatibility: input.compatibility?.trim() || 'Compatible',
        },
      };
    },

    publish(pkg, now) {
      const contracts = pkg.contracts.map((contract) =>
        contract.metadata.status === 'Deprecated'
          ? contract
          : {
              ...contract,
              metadata: {
                ...contract.metadata,
                status: 'Published' as const,
              },
            },
      );
      return {
        ...pkg,
        contracts,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Runtime Contract package.',
        },
      };
    },
  };
}

/**
 * RuntimeContractValidator (EPIC-BLD-53).
 */
export type RuntimeContractValidator = {
  validate(pkg: RuntimeContractPackage): RuntimeContractValidation;
  validateContract(
    pkg: RuntimeContractPackage,
  ): readonly RuntimeContractValidationIssue[];
  validateOperations(
    pkg: RuntimeContractPackage,
  ): readonly RuntimeContractValidationIssue[];
  validateIntegrity(
    pkg: RuntimeContractPackage,
  ): readonly RuntimeContractValidationIssue[];
};

export function createRuntimeContractValidator(options?: {
  readonly now?: () => Date;
}): RuntimeContractValidator {
  const now = options?.now ?? (() => new Date());

  const validateContract = (
    pkg: RuntimeContractPackage,
  ): RuntimeContractValidationIssue[] => {
    const issues: RuntimeContractValidationIssue[] = [];
    const seen = new Set<string>();
    for (const contract of pkg.contracts) {
      if (!contract.name.trim()) {
        issues.push({
          code: 'contract-missing-name',
          severity: 'error',
          message: `Contract ${contract.id} missing name.`,
        });
      }
      if (!contract.capability.trim()) {
        issues.push({
          code: 'contract-missing-capability',
          severity: 'error',
          message: `Contract ${contract.id} missing capability.`,
        });
      }
      if (!contract.version.trim()) {
        issues.push({
          code: 'contract-missing-version',
          severity: 'error',
          message: `Contract ${contract.id} missing version.`,
        });
      }
      const key = `${contract.capability}:${contract.version}`;
      if (seen.has(key)) {
        issues.push({
          code: 'contract-duplicate',
          severity: 'warning',
          message: `Duplicate contract for ${key}.`,
        });
      }
      seen.add(key);
    }
    return issues;
  };

  const validateOperations = (
    pkg: RuntimeContractPackage,
  ): RuntimeContractValidationIssue[] => {
    const issues: RuntimeContractValidationIssue[] = [];
    for (const contract of pkg.contracts) {
      if (contract.operations.length === 0) {
        issues.push({
          code: 'contract-empty-operations',
          severity: 'error',
          message: `Contract ${contract.id} has no operations.`,
        });
      }
      for (const operation of contract.operations) {
        if (!operation.operation.trim()) {
          issues.push({
            code: 'operation-missing-name',
            severity: 'error',
            message: `Operation ${operation.id} missing name.`,
          });
        }
        if (!operation.request.trim() || !operation.response.trim()) {
          issues.push({
            code: 'operation-missing-shapes',
            severity: 'error',
            message: `Operation ${operation.id} missing request/response.`,
          });
        }
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeContractPackage,
  ): RuntimeContractValidationIssue[] => {
    const issues: RuntimeContractValidationIssue[] = [];
    if (pkg.contracts.length === 0) {
      issues.push({
        code: 'package-empty',
        severity: 'warning',
        message: 'Contract package has no contracts.',
      });
    }
    const ids = new Set(pkg.contracts.map((item) => item.id));
    for (const contract of pkg.contracts) {
      for (const dep of contract.dependencies) {
        if (!ids.has(dep) && !pkg.contracts.some((c) => c.capability === dep || c.name === dep)) {
          issues.push({
            code: 'dependency-unresolved',
            severity: 'warning',
            message: `Contract ${contract.id} depends on unresolved ${dep}.`,
          });
        }
      }
    }
    return issues;
  };

  return {
    validateContract,
    validateOperations,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateContract(pkg),
        ...validateOperations(pkg),
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

export function buildEmptyContractPackage(
  input: InitializeContractInput,
  createId: (prefix: string) => string,
  now: () => Date,
): RuntimeContractPackage {
  const stamp = now().toISOString();
  return {
    id: createId('runtime-contract-package'),
    version: '1.0.0',
    contracts: [],
    createdAt: stamp,
    updatedAt: stamp,
    metadata: {
      title:
        input.title?.trim() || `Runtime Contracts ${input.sessionId}`,
      sessionId: input.sessionId,
      notes: 'Runtime Contract package — public contract management only.',
      status: 'Draft',
    },
    validation: null,
  };
}
