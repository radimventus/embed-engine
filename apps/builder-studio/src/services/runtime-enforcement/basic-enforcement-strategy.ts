import type {
  EnforcementDecision,
  EnforcementRecommendedAction,
  EnforcementRule,
  EnforcementStatus,
  EvaluateEnforcementInput,
  RuntimeEnforcementPackage,
  RuntimeEnforcementValidation,
  RuntimeEnforcementValidationIssue,
} from '../../model';

/**
 * EnforcementStrategy (EPIC-BLD-41).
 * Deterministic decisioning only — never executes Runtime actions.
 */
export type EnforcementStrategy = {
  readonly id: string;
  supports(input: EvaluateEnforcementInput): boolean;
  evaluate(
    input: EvaluateEnforcementInput,
    rules: readonly EnforcementRule[],
  ): readonly EnforcementRule[];
  decide(
    input: EvaluateEnforcementInput,
    triggered: readonly EnforcementRule[],
    createId: (prefix: string) => string,
    now: () => Date,
  ): EnforcementDecision;
};

export const BASIC_ENFORCEMENT_RULES: readonly EnforcementRule[] = [
  {
    id: 'enf-rule-critical-health',
    policyId: 'health-not-critical',
    condition: 'failedSeverity:critical',
    action: 'BLOCK',
    priority: 100,
    metadata: {
      notes: 'Critical governance failure recommends halt (decision only).',
      recommendedAction: 'RecommendHalt',
    },
  },
  {
    id: 'enf-rule-audit-missing',
    policyId: 'audit-trail-present',
    condition: 'failedPolicy:audit-trail-present',
    action: 'RESTRICT',
    priority: 80,
    metadata: {
      notes: 'Missing audit trail recommends module restriction.',
      recommendedAction: 'RestrictModules',
    },
  },
  {
    id: 'enf-rule-observability-missing',
    policyId: 'observability-present',
    condition: 'failedPolicy:observability-present',
    action: 'RESTRICT',
    priority: 70,
    metadata: {
      notes: 'Missing observability recommends restriction.',
      recommendedAction: 'RestrictModules',
    },
  },
  {
    id: 'enf-rule-health-threshold',
    policyId: 'health-score-threshold',
    condition: 'failedPolicy:health-score-threshold',
    action: 'WARN',
    priority: 50,
    metadata: {
      notes: 'Health threshold miss recommends warning.',
      recommendedAction: 'ContinueWithWarning',
    },
  },
  {
    id: 'enf-rule-governance-warning',
    policyId: 'governance-warning',
    condition: 'governanceStatus:Warning',
    action: 'WARN',
    priority: 40,
    metadata: {
      notes: 'Governance warning recommends continue with warning.',
      recommendedAction: 'ContinueWithWarning',
    },
  },
  {
    id: 'enf-rule-default-allow',
    policyId: 'governance-compliant',
    condition: 'governanceStatus:Compliant',
    action: 'ALLOW',
    priority: 10,
    metadata: {
      notes: 'Compliant governance allows continuation.',
      recommendedAction: 'Continue',
    },
  },
];

/**
 * BasicEnforcementStrategy — deterministic mapping of governance → decision.
 */
export function createBasicEnforcementStrategy(): EnforcementStrategy {
  return {
    id: 'basic-enforcement-strategy',

    supports(input) {
      return input.sessionId.trim().length > 0;
    },

    evaluate(input, rules) {
      const failedCodes = new Set(input.failedPolicyCodes ?? []);
      const failedSeverities = new Set(input.failedSeverities ?? []);
      const status = input.governanceStatus ?? 'Unknown';

      return [...rules]
        .filter((rule) => {
          if (rule.condition.startsWith('failedSeverity:')) {
            const severity = rule.condition.slice('failedSeverity:'.length);
            return failedSeverities.has(
              severity as 'info' | 'warning' | 'error' | 'critical',
            );
          }
          if (rule.condition.startsWith('failedPolicy:')) {
            const code = rule.condition.slice('failedPolicy:'.length);
            return failedCodes.has(code);
          }
          if (rule.condition.startsWith('governanceStatus:')) {
            const expected = rule.condition.slice('governanceStatus:'.length);
            return status === expected;
          }
          return false;
        })
        .sort((a, b) => b.priority - a.priority);
    },

    decide(input, triggered, createId, now) {
      const ranked = [...triggered].sort((a, b) => b.priority - a.priority);
      const top = ranked[0] ?? null;
      const status = resolveStatus(input, top);
      const recommendedAction = resolveAction(status, top);
      const reason = buildReason(input, status, ranked);

      return {
        id: createId('enforcement-decision'),
        sessionId: input.sessionId,
        runtimeExecutionId: input.runtimeExecutionId ?? null,
        status,
        reason,
        recommendedAction,
        createdAt: now().toISOString(),
        metadata: {
          title: input.title?.trim() || `Enforcement ${input.sessionId}`,
          notes:
            'Decision artifact only — Runtime is not stopped or modified.',
          governanceStatus: input.governanceStatus ?? null,
          triggeredRuleIds: ranked.map((item) => item.id),
        },
      };
    },
  };
}

function resolveStatus(
  input: EvaluateEnforcementInput,
  top: EnforcementRule | null,
): EnforcementStatus {
  if (top !== null) {
    return top.action;
  }
  switch (input.governanceStatus) {
    case 'Compliant':
      return 'ALLOW';
    case 'Warning':
      return 'WARN';
    case 'NonCompliant':
      return 'RESTRICT';
    default:
      return 'WARN';
  }
}

function resolveAction(
  status: EnforcementStatus,
  top: EnforcementRule | null,
): EnforcementRecommendedAction {
  if (top !== null) {
    return top.metadata.recommendedAction;
  }
  switch (status) {
    case 'ALLOW':
      return 'Continue';
    case 'WARN':
      return 'ContinueWithWarning';
    case 'RESTRICT':
      return 'RestrictModules';
    case 'BLOCK':
      return 'RecommendHalt';
  }
}

function buildReason(
  input: EvaluateEnforcementInput,
  status: EnforcementStatus,
  triggered: readonly EnforcementRule[],
): string {
  if (triggered.length > 0) {
    const top = triggered[0]!;
    return `Enforcement ${status} via rule ${top.id} (${top.condition}).`;
  }
  return `Enforcement ${status} from governance status ${input.governanceStatus ?? 'Unknown'}.`;
}

/**
 * RuntimeEnforcementValidator (EPIC-BLD-41).
 */
export type RuntimeEnforcementValidator = {
  validate(pkg: RuntimeEnforcementPackage): RuntimeEnforcementValidation;
  validateDecision(
    pkg: RuntimeEnforcementPackage,
  ): readonly RuntimeEnforcementValidationIssue[];
  validateRules(
    pkg: RuntimeEnforcementPackage,
  ): readonly RuntimeEnforcementValidationIssue[];
  validateIntegrity(
    pkg: RuntimeEnforcementPackage,
  ): readonly RuntimeEnforcementValidationIssue[];
};

export function createRuntimeEnforcementValidator(options?: {
  readonly now?: () => Date;
}): RuntimeEnforcementValidator {
  const now = options?.now ?? (() => new Date());

  const validateDecision = (
    pkg: RuntimeEnforcementPackage,
  ): RuntimeEnforcementValidationIssue[] => {
    const issues: RuntimeEnforcementValidationIssue[] = [];
    if (!pkg.decision.sessionId.trim()) {
      issues.push({
        code: 'decision-missing-session',
        severity: 'error',
        message: `Decision ${pkg.decision.id} missing sessionId.`,
      });
    }
    if (!pkg.decision.reason.trim()) {
      issues.push({
        code: 'decision-missing-reason',
        severity: 'error',
        message: `Decision ${pkg.decision.id} missing reason.`,
      });
    }
    const allowed: EnforcementStatus[] = ['ALLOW', 'WARN', 'RESTRICT', 'BLOCK'];
    if (!allowed.includes(pkg.decision.status)) {
      issues.push({
        code: 'invalid-decision-status',
        severity: 'error',
        message: `Invalid decision status ${pkg.decision.status}.`,
      });
    }
    return issues;
  };

  const validateRules = (
    pkg: RuntimeEnforcementPackage,
  ): RuntimeEnforcementValidationIssue[] => {
    const issues: RuntimeEnforcementValidationIssue[] = [];
    const ids = new Set<string>();
    for (const rule of pkg.triggeredRules) {
      if (ids.has(rule.id)) {
        issues.push({
          code: 'duplicate-rule-id',
          severity: 'error',
          message: `Duplicate enforcement rule id ${rule.id}.`,
        });
      }
      ids.add(rule.id);
      if (!rule.condition.trim() || !rule.policyId.trim()) {
        issues.push({
          code: 'rule-incomplete',
          severity: 'error',
          message: `Rule ${rule.id} missing condition or policyId.`,
        });
      }
    }
    for (const ruleId of pkg.decision.metadata.triggeredRuleIds) {
      if (!pkg.triggeredRules.some((item) => item.id === ruleId)) {
        issues.push({
          code: 'triggered-rule-missing',
          severity: 'error',
          message: `Decision references missing rule ${ruleId}.`,
        });
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeEnforcementPackage,
  ): RuntimeEnforcementValidationIssue[] => {
    const issues: RuntimeEnforcementValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.decision.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match decision.sessionId.',
      });
    }
    if (
      pkg.decision.status === 'ALLOW' &&
      pkg.triggeredRules.some((item) => item.action === 'BLOCK')
    ) {
      issues.push({
        code: 'allow-with-block-rule',
        severity: 'warning',
        message: 'ALLOW decision despite triggered BLOCK rule.',
      });
    }
    return issues;
  };

  return {
    validateDecision,
    validateRules,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateDecision(pkg),
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
