import type {
  EstimatedRecoveryLevel,
  EvaluateResilienceInput,
  RecoveryAction,
  RecoveryPlan,
  RecoverySeverity,
  RecoveryStrategyKind,
  RuntimeResiliencePackage,
  RuntimeResilienceValidation,
  RuntimeResilienceValidationIssue,
} from '../../model';

/**
 * RecoveryStrategy (EPIC-BLD-42).
 * Deterministic plan creation only — never executes recovery.
 */
export type RecoveryStrategy = {
  readonly id: string;
  supports(input: EvaluateResilienceInput): boolean;
  evaluate(input: EvaluateResilienceInput): RecoveryStrategyKind;
  createPlan(
    input: EvaluateResilienceInput,
    strategy: RecoveryStrategyKind,
    createId: (prefix: string) => string,
    now: () => Date,
  ): RecoveryPlan;
};

/**
 * BasicRecoveryStrategy — deterministic mapping of disruption signals → plan.
 */
export function createBasicRecoveryStrategy(): RecoveryStrategy {
  return {
    id: 'basic-recovery-strategy',

    supports(input) {
      return input.sessionId.trim().length > 0;
    },

    evaluate(input) {
      const health = input.healthStatus ?? 'Unknown';
      const enforcement = input.enforcementStatus ?? null;
      const disruptions = new Set(input.disruptionCodes ?? []);
      const moduleFailures = input.moduleFailures ?? [];

      if (
        health === 'Critical' ||
        enforcement === 'BLOCK' ||
        disruptions.has('runtime-halted')
      ) {
        return 'RESTART_RUNTIME';
      }
      if (
        moduleFailures.length > 0 ||
        disruptions.has('module-failure') ||
        enforcement === 'RESTRICT'
      ) {
        return 'RESTART_MODULE';
      }
      if (
        health === 'Degraded' ||
        enforcement === 'WARN' ||
        disruptions.has('checkpoint-available')
      ) {
        if (input.hasCheckpoint !== false) {
          return 'RESTORE_CHECKPOINT';
        }
        return 'MANUAL_INTERVENTION';
      }
      if (health === 'Unknown' || disruptions.has('manual-required')) {
        return 'MANUAL_INTERVENTION';
      }
      return 'CONTINUE';
    },

    createPlan(input, strategy, createId, now) {
      const severity = resolveSeverity(input, strategy);
      const estimatedRecoveryLevel = resolveRecoveryLevel(strategy);
      const recommendedSteps = buildSteps(strategy, createId);
      const stamp = now().toISOString();

      return {
        id: createId('recovery-plan'),
        sessionId: input.sessionId,
        runtimeExecutionId: input.runtimeExecutionId ?? null,
        severity,
        recoveryStrategy: strategy,
        recommendedSteps,
        estimatedRecoveryLevel,
        createdAt: stamp,
        metadata: {
          title: input.title?.trim() || `Recovery ${input.sessionId}`,
          notes:
            'Recovery Plan artifact only — Runtime is not restarted or restored.',
          healthStatus: input.healthStatus ?? null,
          enforcementStatus: input.enforcementStatus ?? null,
          disruptionCodes: [...(input.disruptionCodes ?? [])],
        },
      };
    },
  };
}

function resolveSeverity(
  input: EvaluateResilienceInput,
  strategy: RecoveryStrategyKind,
): RecoverySeverity {
  if (strategy === 'RESTART_RUNTIME' || input.healthStatus === 'Critical') {
    return 'critical';
  }
  if (strategy === 'RESTART_MODULE' || strategy === 'MANUAL_INTERVENTION') {
    return 'error';
  }
  if (strategy === 'RESTORE_CHECKPOINT') {
    return 'warning';
  }
  return 'info';
}

function resolveRecoveryLevel(
  strategy: RecoveryStrategyKind,
): EstimatedRecoveryLevel {
  switch (strategy) {
    case 'CONTINUE':
      return 'Full';
    case 'RESTORE_CHECKPOINT':
      return 'Partial';
    case 'RESTART_MODULE':
      return 'Partial';
    case 'RESTART_RUNTIME':
      return 'Minimal';
    case 'MANUAL_INTERVENTION':
      return 'None';
  }
}

function buildSteps(
  strategy: RecoveryStrategyKind,
  createId: (prefix: string) => string,
): readonly RecoveryAction[] {
  const stepsFor = (
    descriptions: readonly string[],
  ): readonly RecoveryAction[] =>
    descriptions.map((description, index) => ({
      id: createId('recovery-action'),
      step: index + 1,
      description,
      priority: (descriptions.length - index) * 10,
      metadata: {
        notes: 'Advisory step — not executed by Resilience Engine.',
        strategy,
      },
    }));

  switch (strategy) {
    case 'CONTINUE':
      return stepsFor([
        'Confirm Runtime remains healthy.',
        'Continue current Decision Session without interruption.',
      ]);
    case 'RESTORE_CHECKPOINT':
      return stepsFor([
        'Locate last valid Runtime checkpoint.',
        'Recommend restore of session state from checkpoint.',
        'Re-validate Experience State consistency after restore.',
      ]);
    case 'RESTART_MODULE':
      return stepsFor([
        'Identify failing Experience Module(s).',
        'Recommend isolated module restart.',
        'Re-attach module to active Runtime session.',
      ]);
    case 'RESTART_RUNTIME':
      return stepsFor([
        'Preserve audit trail before any restart.',
        'Recommend full Runtime restart (Execution Layer decision).',
        'Re-initialize session and re-apply Governance checks.',
      ]);
    case 'MANUAL_INTERVENTION':
      return stepsFor([
        'Escalate disruption to operator.',
        'Review Health, Observability and Enforcement signals.',
        'Await manual Recovery decision outside automated path.',
      ]);
  }
}

/**
 * RuntimeResilienceValidator (EPIC-BLD-42).
 */
export type RuntimeResilienceValidator = {
  validate(pkg: RuntimeResiliencePackage): RuntimeResilienceValidation;
  validatePlan(
    pkg: RuntimeResiliencePackage,
  ): readonly RuntimeResilienceValidationIssue[];
  validateRecoveryActions(
    pkg: RuntimeResiliencePackage,
  ): readonly RuntimeResilienceValidationIssue[];
  validateIntegrity(
    pkg: RuntimeResiliencePackage,
  ): readonly RuntimeResilienceValidationIssue[];
};

export function createRuntimeResilienceValidator(options?: {
  readonly now?: () => Date;
}): RuntimeResilienceValidator {
  const now = options?.now ?? (() => new Date());

  const validatePlan = (
    pkg: RuntimeResiliencePackage,
  ): RuntimeResilienceValidationIssue[] => {
    const issues: RuntimeResilienceValidationIssue[] = [];
    const plan = pkg.recoveryPlan;
    if (!plan.sessionId.trim()) {
      issues.push({
        code: 'plan-missing-session',
        severity: 'error',
        message: `Plan ${plan.id} missing sessionId.`,
      });
    }
    const allowed: RecoveryStrategyKind[] = [
      'CONTINUE',
      'RESTORE_CHECKPOINT',
      'RESTART_MODULE',
      'RESTART_RUNTIME',
      'MANUAL_INTERVENTION',
    ];
    if (!allowed.includes(plan.recoveryStrategy)) {
      issues.push({
        code: 'invalid-recovery-strategy',
        severity: 'error',
        message: `Invalid recovery strategy ${plan.recoveryStrategy}.`,
      });
    }
    if (plan.recommendedSteps.length === 0) {
      issues.push({
        code: 'plan-missing-steps',
        severity: 'error',
        message: `Plan ${plan.id} has no recommended steps.`,
      });
    }
    return issues;
  };

  const validateRecoveryActions = (
    pkg: RuntimeResiliencePackage,
  ): RuntimeResilienceValidationIssue[] => {
    const issues: RuntimeResilienceValidationIssue[] = [];
    const ids = new Set<string>();
    for (const action of pkg.recoveryPlan.recommendedSteps) {
      if (ids.has(action.id)) {
        issues.push({
          code: 'duplicate-action-id',
          severity: 'error',
          message: `Duplicate recovery action id ${action.id}.`,
        });
      }
      ids.add(action.id);
      if (!action.description.trim()) {
        issues.push({
          code: 'action-incomplete',
          severity: 'error',
          message: `Action ${action.id} missing description.`,
        });
      }
      if (action.step < 1) {
        issues.push({
          code: 'action-invalid-step',
          severity: 'error',
          message: `Action ${action.id} has invalid step ${action.step}.`,
        });
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeResiliencePackage,
  ): RuntimeResilienceValidationIssue[] => {
    const issues: RuntimeResilienceValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.recoveryPlan.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match recoveryPlan.sessionId.',
      });
    }
    if (
      pkg.recoveryPlan.recoveryStrategy === 'CONTINUE' &&
      pkg.recoveryPlan.severity === 'critical'
    ) {
      issues.push({
        code: 'continue-with-critical',
        severity: 'warning',
        message: 'CONTINUE strategy with critical severity.',
      });
    }
    return issues;
  };

  return {
    validatePlan,
    validateRecoveryActions,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validatePlan(pkg),
        ...validateRecoveryActions(pkg),
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
