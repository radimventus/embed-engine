import type {
  CompatibilityEvaluation,
  CompatibilityRule,
  CompatibilityStatus,
  EvaluateCompatibilityInput,
  InitializeCompatibilityInput,
  RegisterCompatibilityRuleInput,
  RuntimeCompatibilityMatrix,
  RuntimeCompatibilityPackage,
  RuntimeCompatibilityValidation,
  RuntimeCompatibilityValidationIssue,
} from '../../model';

/**
 * RuntimeCompatibilityStrategy (EPIC-BLD-52).
 * Deterministic evaluate / publish only — no migrations.
 */
export type RuntimeCompatibilityStrategy = {
  readonly id: string;
  supports(input: RegisterCompatibilityRuleInput): boolean;
  evaluate(
    matrix: RuntimeCompatibilityMatrix,
    input: EvaluateCompatibilityInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): CompatibilityEvaluation;
  publish(
    pkg: RuntimeCompatibilityPackage,
    now: () => Date,
  ): RuntimeCompatibilityPackage;
};

function majorOf(version: string): string {
  const [major] = version.trim().split('.');
  return major ?? version;
}

function deriveStatus(
  sourceVersion: string,
  targetVersion: string,
): CompatibilityStatus {
  if (sourceVersion === targetVersion) {
    return 'Compatible';
  }
  if (majorOf(sourceVersion) === majorOf(targetVersion)) {
    return 'Compatible';
  }
  return 'Incompatible';
}

/**
 * BasicRuntimeCompatibilityStrategy — rule match, else major-version heuristic.
 */
export function createBasicRuntimeCompatibilityStrategy(): RuntimeCompatibilityStrategy {
  return {
    id: 'basic-runtime-compatibility-strategy',

    supports(input) {
      return (
        input.sourceVersion.trim().length > 0 &&
        input.targetVersion.trim().length > 0 &&
        input.reason.trim().length > 0
      );
    },

    evaluate(matrix, input, createId, now) {
      const dimension = input.dimension ?? 'runtime';
      const matched =
        matrix.rules.find(
          (rule) =>
            rule.sourceVersion === input.sourceVersion &&
            rule.targetVersion === input.targetVersion &&
            rule.metadata.dimension === dimension,
        ) ??
        matrix.rules.find(
          (rule) =>
            rule.sourceVersion === input.sourceVersion &&
            rule.targetVersion === input.targetVersion,
        ) ??
        null;

      if (matched !== null) {
        return {
          id: createId('compatibility-evaluation'),
          sourceVersion: input.sourceVersion,
          targetVersion: input.targetVersion,
          status: matched.status,
          reason: matched.reason,
          matchedRuleId: matched.id,
          evaluatedAt: now().toISOString(),
        };
      }

      const status = deriveStatus(input.sourceVersion, input.targetVersion);
      return {
        id: createId('compatibility-evaluation'),
        sourceVersion: input.sourceVersion,
        targetVersion: input.targetVersion,
        status,
        reason:
          status === 'Compatible'
            ? `No explicit rule; major versions align (${majorOf(input.sourceVersion)}).`
            : `No explicit rule; major versions differ (${majorOf(input.sourceVersion)} vs ${majorOf(input.targetVersion)}).`,
        matchedRuleId: null,
        evaluatedAt: now().toISOString(),
      };
    },

    publish(pkg, now) {
      return {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Compatibility Matrix (evaluation only).',
        },
      };
    },
  };
}

export function createRuleFromInput(
  input: RegisterCompatibilityRuleInput,
  createId: (prefix: string) => string,
): CompatibilityRule {
  return {
    id: createId('compatibility-rule'),
    sourceVersion: input.sourceVersion,
    targetVersion: input.targetVersion,
    status: input.status,
    reason: input.reason,
    metadata: {
      title:
        input.title?.trim() ||
        `${input.sourceVersion} → ${input.targetVersion}`,
      notes:
        input.notes?.trim() ||
        'Compatibility rule — evaluation only, no migration.',
      dimension: input.dimension ?? 'runtime',
    },
  };
}

export function computeOverallStatus(
  rules: readonly CompatibilityRule[],
): CompatibilityStatus {
  if (rules.some((rule) => rule.status === 'Incompatible')) {
    return 'Incompatible';
  }
  if (rules.some((rule) => rule.status === 'Deprecated')) {
    return 'Deprecated';
  }
  return 'Compatible';
}

/**
 * RuntimeCompatibilityValidator (EPIC-BLD-52).
 */
export type RuntimeCompatibilityValidator = {
  validate(pkg: RuntimeCompatibilityPackage): RuntimeCompatibilityValidation;
  validateMatrix(
    pkg: RuntimeCompatibilityPackage,
  ): readonly RuntimeCompatibilityValidationIssue[];
  validateRules(
    pkg: RuntimeCompatibilityPackage,
  ): readonly RuntimeCompatibilityValidationIssue[];
  validateIntegrity(
    pkg: RuntimeCompatibilityPackage,
  ): readonly RuntimeCompatibilityValidationIssue[];
};

export function createRuntimeCompatibilityValidator(options?: {
  readonly now?: () => Date;
}): RuntimeCompatibilityValidator {
  const now = options?.now ?? (() => new Date());

  const validateMatrix = (
    pkg: RuntimeCompatibilityPackage,
  ): RuntimeCompatibilityValidationIssue[] => {
    const issues: RuntimeCompatibilityValidationIssue[] = [];
    if (!pkg.matrix.id.trim()) {
      issues.push({
        code: 'matrix-missing-id',
        severity: 'error',
        message: 'Compatibility matrix missing id.',
      });
    }
    if (!pkg.matrix.runtimeVersion.trim()) {
      issues.push({
        code: 'matrix-missing-runtime-version',
        severity: 'error',
        message: 'Matrix missing runtimeVersion.',
      });
    }
    if (!pkg.matrix.manifestVersion.trim()) {
      issues.push({
        code: 'matrix-missing-manifest-version',
        severity: 'error',
        message: 'Matrix missing manifestVersion.',
      });
    }
    if (!pkg.matrix.apiVersion.trim()) {
      issues.push({
        code: 'matrix-missing-api-version',
        severity: 'error',
        message: 'Matrix missing apiVersion.',
      });
    }
    return issues;
  };

  const validateRules = (
    pkg: RuntimeCompatibilityPackage,
  ): RuntimeCompatibilityValidationIssue[] => {
    const issues: RuntimeCompatibilityValidationIssue[] = [];
    const seen = new Set<string>();
    for (const rule of pkg.matrix.rules) {
      if (!rule.sourceVersion.trim() || !rule.targetVersion.trim()) {
        issues.push({
          code: 'rule-missing-version',
          severity: 'error',
          message: `Rule ${rule.id} missing source/target version.`,
        });
      }
      if (!rule.reason.trim()) {
        issues.push({
          code: 'rule-missing-reason',
          severity: 'error',
          message: `Rule ${rule.id} missing reason.`,
        });
      }
      const key = `${rule.metadata.dimension}:${rule.sourceVersion}:${rule.targetVersion}`;
      if (seen.has(key)) {
        issues.push({
          code: 'rule-duplicate',
          severity: 'warning',
          message: `Duplicate rule for ${key}.`,
        });
      }
      seen.add(key);
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeCompatibilityPackage,
  ): RuntimeCompatibilityValidationIssue[] => {
    const issues: RuntimeCompatibilityValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.matrix.metadata.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match matrix.sessionId.',
      });
    }
    const expected = computeOverallStatus(pkg.matrix.rules);
    if (
      pkg.matrix.rules.length > 0 &&
      pkg.matrix.metadata.overallStatus !== expected
    ) {
      issues.push({
        code: 'overall-status-mismatch',
        severity: 'warning',
        message: `overallStatus ${pkg.matrix.metadata.overallStatus} differs from derived ${expected}.`,
      });
    }
    return issues;
  };

  return {
    validateMatrix,
    validateRules,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateMatrix(pkg),
        ...validateRules(pkg),
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

export function buildInitialMatrix(
  input: InitializeCompatibilityInput,
  createId: (prefix: string) => string,
): RuntimeCompatibilityMatrix {
  return {
    id: createId('compatibility-matrix'),
    runtimeVersion: input.runtimeVersion?.trim() || '1.0.0',
    manifestVersion: input.manifestVersion?.trim() || '1.0.0',
    apiVersion: input.apiVersion?.trim() || '1.0.0',
    supportedConsumers: [
      ...(input.supportedConsumers ?? [
        'Manager Studio',
        'Sales Studio',
        'Client Studio',
        'API',
      ]),
    ],
    rules: [],
    metadata: {
      title:
        input.title?.trim() ||
        `Compatibility Matrix ${input.sessionId}`,
      notes: 'Compatibility matrix — evaluation only, no migration.',
      sessionId: input.sessionId,
      overallStatus: 'Compatible',
    },
  };
}
