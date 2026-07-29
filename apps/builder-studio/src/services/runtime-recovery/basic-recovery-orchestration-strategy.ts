import type {
  BuildRecoverySequenceInput,
  RecoveryRiskLevel,
  RecoverySequence,
  RecoveryStep,
  RecoveryStepAction,
  RuntimeRecoveryPackage,
  RuntimeRecoveryValidation,
  RuntimeRecoveryValidationIssue,
} from '../../model';

/**
 * RecoveryOrchestrationStrategy (EPIC-BLD-43).
 * Deterministic sequence building only — never executes recovery.
 */
export type RecoveryOrchestrationStrategy = {
  readonly id: string;
  supports(input: BuildRecoverySequenceInput): boolean;
  buildSequence(
    input: BuildRecoverySequenceInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): RecoverySequence;
  validateSequence(
    sequence: RecoverySequence,
  ): readonly RuntimeRecoveryValidationIssue[];
};

/**
 * BasicRecoveryOrchestrationStrategy — maps Recovery Plan → ordered sequence.
 */
export function createBasicRecoveryOrchestrationStrategy(): RecoveryOrchestrationStrategy {
  return {
    id: 'basic-recovery-orchestration-strategy',

    supports(input) {
      return input.sessionId.trim().length > 0;
    },

    buildSequence(input, createId, now) {
      const strategy = input.recoveryStrategy ?? 'CONTINUE';
      const steps = buildOrderedSteps(input, strategy, createId);
      const estimatedDuration = steps.reduce(
        (sum, step) => sum + step.metadata.estimatedSeconds,
        0,
      );
      const riskLevel = resolveRisk(input, strategy);

      return {
        id: createId('recovery-sequence'),
        runtimeExecutionId: input.runtimeExecutionId ?? null,
        steps,
        estimatedDuration,
        riskLevel,
        createdAt: now().toISOString(),
        metadata: {
          title: input.title?.trim() || `Recovery Sequence ${input.sessionId}`,
          notes:
            'Recovery Sequence artifact only — not executed against Runtime.',
          sessionId: input.sessionId,
          planId: input.planId ?? null,
          recoveryStrategy: strategy,
        },
      };
    },

    validateSequence(sequence) {
      const issues: RuntimeRecoveryValidationIssue[] = [];
      if (sequence.steps.length === 0) {
        issues.push({
          code: 'sequence-empty',
          severity: 'error',
          message: `Sequence ${sequence.id} has no steps.`,
        });
      }
      const orders = sequence.steps.map((step) => step.order);
      const sorted = [...orders].sort((a, b) => a - b);
      if (orders.join(',') !== sorted.join(',')) {
        issues.push({
          code: 'sequence-order-unsorted',
          severity: 'error',
          message: `Sequence ${sequence.id} steps are not ordered.`,
        });
      }
      const ids = new Set(sequence.steps.map((step) => step.id));
      for (const step of sequence.steps) {
        for (const dep of step.dependsOn) {
          if (!ids.has(dep)) {
            issues.push({
              code: 'missing-dependency',
              severity: 'error',
              message: `Step ${step.id} depends on missing ${dep}.`,
            });
          }
        }
      }
      return issues;
    },
  };
}

function resolveRisk(
  input: BuildRecoverySequenceInput,
  strategy: NonNullable<BuildRecoverySequenceInput['recoveryStrategy']>,
): RecoveryRiskLevel {
  if (strategy === 'RESTART_RUNTIME' || input.severity === 'critical') {
    return 'critical';
  }
  if (strategy === 'RESTART_MODULE' || strategy === 'MANUAL_INTERVENTION') {
    return 'high';
  }
  if (strategy === 'RESTORE_CHECKPOINT' || input.severity === 'warning') {
    return 'medium';
  }
  return 'low';
}

function buildOrderedSteps(
  input: BuildRecoverySequenceInput,
  strategy: NonNullable<BuildRecoverySequenceInput['recoveryStrategy']>,
  createId: (prefix: string) => string,
): readonly RecoveryStep[] {
  const templates = templatesFor(strategy);
  const fromPlan = [...(input.recommendedSteps ?? [])].sort(
    (a, b) => a.step - b.step,
  );

  const steps: RecoveryStep[] = [];
  let previousId: string | null = null;

  templates.forEach((template, index) => {
    const source = fromPlan[index] ?? null;
    const id = createId('recovery-step');
    steps.push({
      id,
      order: index + 1,
      action: template.action,
      description: source?.description ?? template.description,
      dependsOn: previousId === null ? [] : [previousId],
      metadata: {
        notes: 'Advisory step — not executed by Recovery Orchestrator.',
        sourceActionId: source?.id ?? null,
        estimatedSeconds: template.estimatedSeconds,
      },
    });
    previousId = id;
  });

  return steps;
}

function templatesFor(
  strategy: NonNullable<BuildRecoverySequenceInput['recoveryStrategy']>,
): readonly {
  readonly action: RecoveryStepAction;
  readonly description: string;
  readonly estimatedSeconds: number;
}[] {
  switch (strategy) {
    case 'CONTINUE':
      return [
        {
          action: 'ConfirmHealth',
          description: 'Confirm Runtime remains healthy.',
          estimatedSeconds: 30,
        },
        {
          action: 'ContinueSession',
          description: 'Continue current Decision Session without interruption.',
          estimatedSeconds: 15,
        },
      ];
    case 'RESTORE_CHECKPOINT':
      return [
        {
          action: 'PreserveAudit',
          description: 'Preserve audit trail before restore.',
          estimatedSeconds: 45,
        },
        {
          action: 'RestoreCheckpoint',
          description: 'Recommend restore from last valid checkpoint.',
          estimatedSeconds: 120,
        },
        {
          action: 'RevalidateState',
          description: 'Re-validate Experience State consistency.',
          estimatedSeconds: 60,
        },
      ];
    case 'RESTART_MODULE':
      return [
        {
          action: 'PreserveAudit',
          description: 'Preserve audit trail before module restart.',
          estimatedSeconds: 45,
        },
        {
          action: 'RestartModule',
          description: 'Recommend isolated module restart.',
          estimatedSeconds: 90,
        },
        {
          action: 'RevalidateState',
          description: 'Re-attach module and validate session.',
          estimatedSeconds: 60,
        },
      ];
    case 'RESTART_RUNTIME':
      return [
        {
          action: 'PreserveAudit',
          description: 'Preserve audit trail before Runtime restart.',
          estimatedSeconds: 60,
        },
        {
          action: 'RestartRuntime',
          description: 'Recommend full Runtime restart (Execution Layer).',
          estimatedSeconds: 180,
        },
        {
          action: 'RevalidateState',
          description: 'Re-initialize session and re-apply Governance.',
          estimatedSeconds: 90,
        },
      ];
    case 'MANUAL_INTERVENTION':
      return [
        {
          action: 'EscalateOperator',
          description: 'Escalate disruption to operator.',
          estimatedSeconds: 30,
        },
        {
          action: 'ConfirmHealth',
          description: 'Review Health, Observability and Enforcement signals.',
          estimatedSeconds: 120,
        },
        {
          action: 'ContinueSession',
          description: 'Await manual Recovery decision outside automated path.',
          estimatedSeconds: 300,
        },
      ];
  }
}

/**
 * RuntimeRecoveryValidator (EPIC-BLD-43).
 */
export type RuntimeRecoveryValidator = {
  validate(pkg: RuntimeRecoveryPackage): RuntimeRecoveryValidation;
  validateSequence(
    pkg: RuntimeRecoveryPackage,
  ): readonly RuntimeRecoveryValidationIssue[];
  validateSteps(
    pkg: RuntimeRecoveryPackage,
  ): readonly RuntimeRecoveryValidationIssue[];
  validateIntegrity(
    pkg: RuntimeRecoveryPackage,
  ): readonly RuntimeRecoveryValidationIssue[];
};

export function createRuntimeRecoveryValidator(options?: {
  readonly now?: () => Date;
  readonly strategy?: RecoveryOrchestrationStrategy;
}): RuntimeRecoveryValidator {
  const now = options?.now ?? (() => new Date());
  const strategy =
    options?.strategy ?? createBasicRecoveryOrchestrationStrategy();

  const validateSequence = (
    pkg: RuntimeRecoveryPackage,
  ): RuntimeRecoveryValidationIssue[] => {
    const issues: RuntimeRecoveryValidationIssue[] = [
      ...strategy.validateSequence(pkg.sequence),
    ];
    if (!pkg.sequence.metadata.sessionId.trim()) {
      issues.push({
        code: 'sequence-missing-session',
        severity: 'error',
        message: `Sequence ${pkg.sequence.id} missing sessionId.`,
      });
    }
    if (pkg.sequence.estimatedDuration < 0) {
      issues.push({
        code: 'invalid-duration',
        severity: 'error',
        message: `Sequence ${pkg.sequence.id} has invalid duration.`,
      });
    }
    return issues;
  };

  const validateSteps = (
    pkg: RuntimeRecoveryPackage,
  ): RuntimeRecoveryValidationIssue[] => {
    const issues: RuntimeRecoveryValidationIssue[] = [];
    const ids = new Set<string>();
    for (const step of pkg.sequence.steps) {
      if (ids.has(step.id)) {
        issues.push({
          code: 'duplicate-step-id',
          severity: 'error',
          message: `Duplicate recovery step id ${step.id}.`,
        });
      }
      ids.add(step.id);
      if (!step.description.trim()) {
        issues.push({
          code: 'step-incomplete',
          severity: 'error',
          message: `Step ${step.id} missing description.`,
        });
      }
      if (step.order < 1) {
        issues.push({
          code: 'step-invalid-order',
          severity: 'error',
          message: `Step ${step.id} has invalid order ${step.order}.`,
        });
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeRecoveryPackage,
  ): RuntimeRecoveryValidationIssue[] => {
    const issues: RuntimeRecoveryValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.sequence.metadata.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match sequence.metadata.sessionId.',
      });
    }
    if (
      pkg.metadata.planId !== null &&
      pkg.sequence.metadata.planId !== null &&
      pkg.metadata.planId !== pkg.sequence.metadata.planId
    ) {
      issues.push({
        code: 'plan-mismatch',
        severity: 'warning',
        message: 'Package planId does not match sequence planId.',
      });
    }
    return issues;
  };

  return {
    validateSequence,
    validateSteps,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateSequence(pkg),
        ...validateSteps(pkg),
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
