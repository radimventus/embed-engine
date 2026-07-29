import type {
  EvaluateGovernanceInput,
  GovernanceEvaluation,
  GovernanceRule,
  RuntimeGovernancePackage,
  RuntimeGovernanceValidation,
  RuntimeGovernanceValidationIssue,
  GovernanceOverallStatus,
} from '../../model';

/**
 * GovernanceEvaluationStrategy (EPIC-BLD-39).
 * Deterministic rules only — no AI / RBAC / IAM.
 */
export type GovernanceEvaluationStrategy = {
  readonly id: string;
  supports(input: EvaluateGovernanceInput): boolean;
  evaluate(
    input: EvaluateGovernanceInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): {
    readonly overallStatus: GovernanceOverallStatus;
    readonly score: number;
    readonly passedRules: readonly GovernanceRule[];
    readonly failedRules: readonly GovernanceRule[];
    readonly rules: readonly GovernanceRule[];
  };
};

export const BASIC_GOVERNANCE_RULES: readonly GovernanceRule[] = [
  {
    id: 'gov-rule-observability-present',
    name: 'Observability Present',
    category: 'Observability',
    severity: 'error',
    description: 'Runtime Observability package must exist for the session.',
    metadata: {
      code: 'observability-present',
      notes: 'Requires Production Layer observability output.',
    },
  },
  {
    id: 'gov-rule-observability-healthy',
    name: 'Observability Healthy',
    category: 'Observability',
    severity: 'warning',
    description: 'Observability health signal must not be degraded.',
    metadata: {
      code: 'observability-healthy',
      notes: 'Warning when observability reports degraded signals.',
    },
  },
  {
    id: 'gov-rule-health-threshold',
    name: 'Health Score Threshold',
    category: 'Health',
    severity: 'error',
    description: 'Runtime Health score must be at least 0.7.',
    metadata: {
      code: 'health-score-threshold',
      notes: 'Deterministic health gate.',
    },
  },
  {
    id: 'gov-rule-health-not-critical',
    name: 'Health Not Critical',
    category: 'Health',
    severity: 'critical',
    description: 'Runtime Health overall status must not be Critical.',
    metadata: {
      code: 'health-not-critical',
      notes: 'Critical governance failure.',
    },
  },
  {
    id: 'gov-rule-audit-trail',
    name: 'Audit Trail Present',
    category: 'Audit',
    severity: 'error',
    description: 'Immutable audit trail must exist for the session.',
    metadata: {
      code: 'audit-trail-present',
      notes: 'Requires Runtime Audit output.',
    },
  },
  {
    id: 'gov-rule-audit-immutable',
    name: 'Audit Immutable',
    category: 'Audit',
    severity: 'warning',
    description: 'Audit package must be marked immutable.',
    metadata: {
      code: 'audit-immutable',
      notes: 'Integrity expectation for audit artifacts.',
    },
  },
  {
    id: 'gov-rule-session-bound',
    name: 'Session Bound',
    category: 'Session',
    severity: 'error',
    description: 'Governance evaluation must be bound to a session id.',
    metadata: {
      code: 'session-bound',
      notes: 'Platform constitution session binding.',
    },
  },
  {
    id: 'gov-rule-execution-bound',
    name: 'Execution Bound',
    category: 'Execution',
    severity: 'warning',
    description: 'Runtime execution id should be present when available.',
    metadata: {
      code: 'execution-bound',
      notes: 'Soft binding to runtime execution.',
    },
  },
  {
    id: 'gov-rule-validation-summary',
    name: 'Validation Summary',
    category: 'Validation',
    severity: 'error',
    description:
      'Upstream Observability / Health / Audit validations must pass.',
    metadata: {
      code: 'validation-summary',
      notes: 'Aggregated validation compliance.',
    },
  },
];

/**
 * BasicGovernanceEvaluationStrategy — deterministic platform rules.
 */
export function createBasicGovernanceEvaluationStrategy(
  rules: readonly GovernanceRule[] = BASIC_GOVERNANCE_RULES,
): GovernanceEvaluationStrategy {
  return {
    id: 'basic-governance-evaluation-strategy',

    supports(input) {
      return input.sessionId.trim().length > 0;
    },

    evaluate(input, _createId, _now) {
      const passed: GovernanceRule[] = [];
      const failed: GovernanceRule[] = [];

      const checks: Record<string, boolean> = {
        'observability-present': input.hasObservability === true,
        'observability-healthy': input.observabilityHealthy !== false,
        'health-score-threshold': (input.healthScore ?? 0) >= 0.7,
        'health-not-critical': input.healthOverall !== 'Critical',
        'audit-trail-present': input.hasAuditTrail === true,
        'audit-immutable': input.auditImmutable !== false,
        'session-bound': input.sessionId.trim().length > 0,
        'execution-bound':
          input.runtimeExecutionId !== null &&
          input.runtimeExecutionId !== undefined &&
          input.runtimeExecutionId.trim().length > 0,
        'validation-summary':
          input.observabilityValidated !== false &&
          input.healthValidated !== false &&
          input.auditValidated !== false,
      };

      for (const rule of rules) {
        const ok = checks[rule.metadata.code] === true;
        if (ok) {
          passed.push(rule);
        } else {
          failed.push(rule);
        }
      }

      const total = rules.length || 1;
      const score = Math.round((passed.length / total) * 1000) / 1000;

      const hasCritical = failed.some((item) => item.severity === 'critical');
      const hasError = failed.some(
        (item) => item.severity === 'error' || item.severity === 'critical',
      );
      const hasWarning = failed.some((item) => item.severity === 'warning');

      let overallStatus: GovernanceOverallStatus;
      if (passed.length === 0 && failed.length === 0) {
        overallStatus = 'Unknown';
      } else if (hasCritical || (hasError && score < 0.5)) {
        overallStatus = 'NonCompliant';
      } else if (hasError || hasWarning) {
        overallStatus = hasError && score < 0.7 ? 'NonCompliant' : 'Warning';
      } else {
        overallStatus = 'Compliant';
      }

      return {
        overallStatus,
        score,
        passedRules: passed,
        failedRules: failed,
        rules,
      };
    },
  };
}

export function buildGovernanceEvaluation(
  input: EvaluateGovernanceInput,
  result: {
    readonly overallStatus: GovernanceOverallStatus;
    readonly score: number;
    readonly passedRules: readonly GovernanceRule[];
    readonly failedRules: readonly GovernanceRule[];
    readonly rules: readonly GovernanceRule[];
  },
  createId: (prefix: string) => string,
  now: () => Date,
): GovernanceEvaluation {
  return {
    id: createId('governance-evaluation'),
    sessionId: input.sessionId,
    runtimeExecutionId: input.runtimeExecutionId ?? null,
    passedRules: result.passedRules,
    failedRules: result.failedRules,
    overallStatus: result.overallStatus,
    score: result.score,
    createdAt: now().toISOString(),
    metadata: {
      title: input.title?.trim() || `Governance ${input.sessionId}`,
      notes: 'Deterministic Runtime Governance evaluation.',
      evaluatedRuleCount: result.rules.length,
    },
  };
}

/**
 * RuntimeGovernanceValidator (EPIC-BLD-39).
 */
export type RuntimeGovernanceValidator = {
  validate(pkg: RuntimeGovernancePackage): RuntimeGovernanceValidation;
  validateRules(
    pkg: RuntimeGovernancePackage,
  ): readonly RuntimeGovernanceValidationIssue[];
  validateEvaluation(
    pkg: RuntimeGovernancePackage,
  ): readonly RuntimeGovernanceValidationIssue[];
  validateIntegrity(
    pkg: RuntimeGovernancePackage,
  ): readonly RuntimeGovernanceValidationIssue[];
};

export function createRuntimeGovernanceValidator(options?: {
  readonly now?: () => Date;
}): RuntimeGovernanceValidator {
  const now = options?.now ?? (() => new Date());

  const validateRules = (
    pkg: RuntimeGovernancePackage,
  ): RuntimeGovernanceValidationIssue[] => {
    const issues: RuntimeGovernanceValidationIssue[] = [];
    const all = [
      ...pkg.evaluation.passedRules,
      ...pkg.evaluation.failedRules,
    ];
    const ids = new Set<string>();
    for (const rule of all) {
      if (ids.has(rule.id)) {
        issues.push({
          code: 'duplicate-rule-id',
          severity: 'error',
          message: `Duplicate governance rule id ${rule.id}.`,
        });
      }
      ids.add(rule.id);
      if (!rule.name.trim() || !rule.metadata.code.trim()) {
        issues.push({
          code: 'rule-incomplete',
          severity: 'error',
          message: `Rule ${rule.id} missing name or code.`,
        });
      }
    }
    return issues;
  };

  const validateEvaluation = (
    pkg: RuntimeGovernancePackage,
  ): RuntimeGovernanceValidationIssue[] => {
    const issues: RuntimeGovernanceValidationIssue[] = [];
    if (!pkg.evaluation.sessionId.trim()) {
      issues.push({
        code: 'evaluation-missing-session',
        severity: 'error',
        message: `Evaluation ${pkg.evaluation.id} missing sessionId.`,
      });
    }
    const counted =
      pkg.evaluation.passedRules.length + pkg.evaluation.failedRules.length;
    if (counted !== pkg.evaluation.metadata.evaluatedRuleCount) {
      issues.push({
        code: 'rule-count-mismatch',
        severity: 'error',
        message: 'Evaluated rule count does not match passed+failed.',
      });
    }
    if (pkg.evaluation.score < 0 || pkg.evaluation.score > 1) {
      issues.push({
        code: 'invalid-score',
        severity: 'error',
        message: `Score out of range (${pkg.evaluation.score}).`,
      });
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeGovernancePackage,
  ): RuntimeGovernanceValidationIssue[] => {
    const issues: RuntimeGovernanceValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.evaluation.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match evaluation.sessionId.',
      });
    }
    if (
      pkg.evaluation.overallStatus === 'Compliant' &&
      pkg.evaluation.failedRules.length > 0
    ) {
      issues.push({
        code: 'compliant-with-failures',
        severity: 'warning',
        message: 'Overall status Compliant despite failed rules.',
      });
    }
    return issues;
  };

  return {
    validateRules,
    validateEvaluation,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateRules(pkg),
        ...validateEvaluation(pkg),
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
