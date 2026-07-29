import type {
  ExecuteRecoveryInput,
  RecoveryExecution,
  RecoveryResult,
  RecoverySequence,
  RuntimeRecoveryExecutionPackage,
  RuntimeRecoveryExecutionValidation,
  RuntimeRecoveryExecutionValidationIssue,
} from '../../model';

/**
 * RecoveryExecutionStrategy (EPIC-BLD-44).
 * Deterministic step coordination only — does not own Runtime.
 */
export type RecoveryExecutionStrategy = {
  readonly id: string;
  supports(input: ExecuteRecoveryInput): boolean;
  execute(
    input: ExecuteRecoveryInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): {
    readonly execution: RecoveryExecution;
    readonly result: RecoveryResult | null;
  };
  finalize(
    execution: RecoveryExecution,
    sequence: RecoverySequence,
    createId: (prefix: string) => string,
    now: () => Date,
  ): {
    readonly execution: RecoveryExecution;
    readonly result: RecoveryResult;
  };
};

/**
 * BasicRecoveryExecutionStrategy — processes sequence steps in order.
 */
export function createBasicRecoveryExecutionStrategy(): RecoveryExecutionStrategy {
  return {
    id: 'basic-recovery-execution-strategy',

    supports(input) {
      return (
        input.sessionId.trim().length > 0 &&
        input.sequence.steps.length > 0
      );
    },

    execute(input, createId, now) {
      const stamp = now().toISOString();
      const steps = [...input.sequence.steps].sort(
        (a, b) => a.order - b.order,
      );
      const completed: string[] = [];
      const failed: string[] = [];
      let currentStep: string | null = null;
      let status: RecoveryExecution['status'] = 'RUNNING';

      for (const step of steps) {
        currentStep = step.id;
        if (input.failOnStepId !== undefined && input.failOnStepId === step.id) {
          failed.push(step.id);
          status = 'FAILED';
          break;
        }
        completed.push(step.id);
      }

      if (status !== 'FAILED') {
        status = 'COMPLETED';
        currentStep = completed[completed.length - 1] ?? null;
      }

      const execution: RecoveryExecution = {
        id: createId('recovery-execution'),
        runtimeExecutionId: input.sequence.runtimeExecutionId,
        sequenceId: input.sequence.id,
        status,
        currentStep,
        startedAt: stamp,
        completedAt: now().toISOString(),
        metadata: {
          title: input.title?.trim() || `Recovery Execution ${input.sessionId}`,
          notes:
            'Coordinates Execution Layer recovery requests — does not own Runtime.',
          sessionId: input.sessionId,
          totalSteps: steps.length,
          completedStepIds: completed,
          failedStepIds: failed,
        },
      };

      const result =
        status === 'COMPLETED' || status === 'FAILED'
          ? buildResult(execution, input.sequence, createId, now)
          : null;

      return { execution, result };
    },

    finalize(execution, sequence, createId, now) {
      const completed = [...execution.metadata.completedStepIds];
      const remaining = sequence.steps
        .filter((step) => !completed.includes(step.id))
        .filter((step) => !execution.metadata.failedStepIds.includes(step.id))
        .sort((a, b) => a.order - b.order);

      for (const step of remaining) {
        completed.push(step.id);
      }

      const next: RecoveryExecution = {
        ...execution,
        status: 'COMPLETED',
        currentStep: completed[completed.length - 1] ?? execution.currentStep,
        completedAt: now().toISOString(),
        metadata: {
          ...execution.metadata,
          completedStepIds: completed,
          notes: 'Recovery execution completed (coordinated requests only).',
        },
      };

      return {
        execution: next,
        result: buildResult(next, sequence, createId, now),
      };
    },
  };
}

function buildResult(
  execution: RecoveryExecution,
  sequence: RecoverySequence,
  createId: (prefix: string) => string,
  now: () => Date,
): RecoveryResult {
  const started = execution.startedAt
    ? Date.parse(execution.startedAt)
    : Date.parse(now().toISOString());
  const ended = execution.completedAt
    ? Date.parse(execution.completedAt)
    : Date.parse(now().toISOString());
  const durationMs = Math.max(0, ended - started);
  const duration =
    durationMs > 0
      ? Math.round(durationMs / 1000)
      : sequence.steps
          .filter((step) =>
            execution.metadata.completedStepIds.includes(step.id),
          )
          .reduce((sum, step) => sum + step.metadata.estimatedSeconds, 0);

  let status: RecoveryResult['status'] = 'Succeeded';
  if (execution.metadata.failedStepIds.length > 0) {
    status =
      execution.metadata.completedStepIds.length > 0 ? 'Partial' : 'Failed';
  }

  return {
    id: createId('recovery-result'),
    executionId: execution.id,
    status,
    completedSteps: [...execution.metadata.completedStepIds],
    failedSteps: [...execution.metadata.failedStepIds],
    duration,
    metadata: {
      notes: 'Recovery Result artifact from coordinated sequence execution.',
      sequenceId: sequence.id,
      lastStepId: execution.currentStep,
    },
  };
}

/**
 * RuntimeRecoveryExecutionValidator (EPIC-BLD-44).
 */
export type RuntimeRecoveryExecutionValidator = {
  validate(
    pkg: RuntimeRecoveryExecutionPackage,
  ): RuntimeRecoveryExecutionValidation;
  validateExecution(
    pkg: RuntimeRecoveryExecutionPackage,
  ): readonly RuntimeRecoveryExecutionValidationIssue[];
  validateResult(
    pkg: RuntimeRecoveryExecutionPackage,
  ): readonly RuntimeRecoveryExecutionValidationIssue[];
  validateIntegrity(
    pkg: RuntimeRecoveryExecutionPackage,
  ): readonly RuntimeRecoveryExecutionValidationIssue[];
};

export function createRuntimeRecoveryExecutionValidator(options?: {
  readonly now?: () => Date;
}): RuntimeRecoveryExecutionValidator {
  const now = options?.now ?? (() => new Date());

  const validateExecution = (
    pkg: RuntimeRecoveryExecutionPackage,
  ): RuntimeRecoveryExecutionValidationIssue[] => {
    const issues: RuntimeRecoveryExecutionValidationIssue[] = [];
    const exe = pkg.execution;
    if (!exe.sequenceId.trim()) {
      issues.push({
        code: 'execution-missing-sequence',
        severity: 'error',
        message: `Execution ${exe.id} missing sequenceId.`,
      });
    }
    if (!exe.metadata.sessionId.trim()) {
      issues.push({
        code: 'execution-missing-session',
        severity: 'error',
        message: `Execution ${exe.id} missing sessionId.`,
      });
    }
    const allowed: RecoveryExecution['status'][] = [
      'READY',
      'RUNNING',
      'PAUSED',
      'COMPLETED',
      'FAILED',
    ];
    if (!allowed.includes(exe.status)) {
      issues.push({
        code: 'invalid-execution-status',
        severity: 'error',
        message: `Invalid execution status ${exe.status}.`,
      });
    }
    return issues;
  };

  const validateResult = (
    pkg: RuntimeRecoveryExecutionPackage,
  ): RuntimeRecoveryExecutionValidationIssue[] => {
    const issues: RuntimeRecoveryExecutionValidationIssue[] = [];
    if (pkg.execution.status === 'COMPLETED' && pkg.result === null) {
      issues.push({
        code: 'missing-result',
        severity: 'error',
        message: `Completed execution ${pkg.execution.id} missing result.`,
      });
    }
    if (pkg.result !== null) {
      if (pkg.result.executionId !== pkg.execution.id) {
        issues.push({
          code: 'result-execution-mismatch',
          severity: 'error',
          message: 'Result.executionId does not match execution.id.',
        });
      }
      if (pkg.result.duration < 0) {
        issues.push({
          code: 'invalid-result-duration',
          severity: 'error',
          message: `Result ${pkg.result.id} has invalid duration.`,
        });
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeRecoveryExecutionPackage,
  ): RuntimeRecoveryExecutionValidationIssue[] => {
    const issues: RuntimeRecoveryExecutionValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.execution.metadata.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match execution.sessionId.',
      });
    }
    if (pkg.execution.sequenceId !== pkg.sequenceSnapshot.id) {
      issues.push({
        code: 'sequence-mismatch',
        severity: 'error',
        message: 'Execution.sequenceId does not match sequenceSnapshot.id.',
      });
    }
    const stepIds = new Set(pkg.sequenceSnapshot.steps.map((step) => step.id));
    for (const stepId of pkg.execution.metadata.completedStepIds) {
      if (!stepIds.has(stepId)) {
        issues.push({
          code: 'unknown-completed-step',
          severity: 'error',
          message: `Completed step ${stepId} not in sequence.`,
        });
      }
    }
    return issues;
  };

  return {
    validateExecution,
    validateResult,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateExecution(pkg),
        ...validateResult(pkg),
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
