import type {
  DecisionExecution,
  DecisionExecutionValidation,
  DecisionExecutionValidationIssue,
  DecisionStage,
  StartExecutionInput,
} from '../../model';

/**
 * DecisionFlowStrategy (EPIC-BLD-31).
 * Deterministic flow only — no AI / Knowledge creation.
 */
export type DecisionFlowStrategy = {
  readonly id: string;
  supports(input: StartExecutionInput): boolean;
  next(
    execution: DecisionExecution,
    moveIds: readonly string[],
  ): {
    readonly currentMove: string | null;
    readonly completed: boolean;
  };
  transition(
    execution: DecisionExecution,
    moveIds: readonly string[],
    createId: (prefix: string) => string,
    now: () => Date,
  ): {
    readonly stages: readonly DecisionStage[];
    readonly currentMove: string | null;
    readonly completed: boolean;
  };
};

/**
 * BasicDecisionFlowStrategy — sequential story moves.
 */
export function createBasicDecisionFlowStrategy(): DecisionFlowStrategy {
  return {
    id: 'basic-decision-flow-strategy',

    supports(input) {
      return (
        input.sessionId.trim().length > 0 &&
        input.storyId.trim().length > 0 &&
        input.moveIds.length > 0
      );
    },

    next(execution, moveIds) {
      if (moveIds.length === 0) {
        return { currentMove: null, completed: true };
      }
      if (execution.currentMove === null) {
        return { currentMove: moveIds[0] ?? null, completed: false };
      }
      const index = moveIds.indexOf(execution.currentMove);
      if (index < 0) {
        return { currentMove: moveIds[0] ?? null, completed: false };
      }
      if (index >= moveIds.length - 1) {
        return { currentMove: execution.currentMove, completed: true };
      }
      return {
        currentMove: moveIds[index + 1] ?? null,
        completed: false,
      };
    },

    transition(execution, moveIds, createId, now) {
      const stamp = now().toISOString();
      const step = this.next(execution, moveIds);
      const previousStages = execution.stages.map((stage) =>
        stage.status === 'Active'
          ? {
              ...stage,
              status: 'Done' as const,
              completedAt: stamp,
            }
          : stage,
      );

      if (step.completed) {
        const completeStage: DecisionStage = {
          id: createId('decision-stage'),
          type: 'Complete',
          status: 'Active',
          startedAt: stamp,
          completedAt: null,
          metadata: {
            notes: 'Execution reached final story move.',
            moveId: step.currentMove,
          },
        };
        return {
          stages: [...previousStages, completeStage],
          currentMove: step.currentMove,
          completed: true,
        };
      }

      const nextStage: DecisionStage = {
        id: createId('decision-stage'),
        type: execution.currentMove === null ? 'Boot' : 'Active',
        status: 'Active',
        startedAt: stamp,
        completedAt: null,
        metadata: {
          notes:
            execution.currentMove === null
              ? 'Boot stage — first move.'
              : `Advanced to move ${step.currentMove}.`,
          moveId: step.currentMove,
        },
      };

      return {
        stages: [...previousStages, nextStage],
        currentMove: step.currentMove,
        completed: false,
      };
    },
  };
}

/**
 * DecisionExecutionValidator (EPIC-BLD-31).
 */
export type DecisionExecutionValidator = {
  validate(execution: DecisionExecution): DecisionExecutionValidation;
  validateState(
    execution: DecisionExecution,
  ): readonly DecisionExecutionValidationIssue[];
  validateTransitions(
    execution: DecisionExecution,
  ): readonly DecisionExecutionValidationIssue[];
  validateConsistency(
    execution: DecisionExecution,
  ): readonly DecisionExecutionValidationIssue[];
};

export function createDecisionExecutionValidator(options?: {
  readonly now?: () => Date;
}): DecisionExecutionValidator {
  const now = options?.now ?? (() => new Date());

  const validateState = (
    execution: DecisionExecution,
  ): DecisionExecutionValidationIssue[] => {
    const issues: DecisionExecutionValidationIssue[] = [];
    if (execution.state === 'Running' && execution.currentMove === null) {
      issues.push({
        code: 'running-without-move',
        severity: 'error',
        message: `Execution ${execution.id} is Running without currentMove.`,
      });
    }
    if (execution.state === 'Completed' && execution.completedAt === null) {
      issues.push({
        code: 'completed-without-timestamp',
        severity: 'error',
        message: `Execution ${execution.id} Completed without completedAt.`,
      });
    }
    if (execution.state === 'Initialized' && execution.stages.length > 1) {
      issues.push({
        code: 'initialized-with-progress',
        severity: 'warning',
        message: `Execution ${execution.id} Initialized but has multiple stages.`,
      });
    }
    return issues;
  };

  const validateTransitions = (
    execution: DecisionExecution,
  ): DecisionExecutionValidationIssue[] => {
    const issues: DecisionExecutionValidationIssue[] = [];
    let activeCount = 0;
    for (const stage of execution.stages) {
      if (stage.status === 'Active') {
        activeCount += 1;
      }
      if (stage.status === 'Done' && stage.completedAt === null) {
        issues.push({
          code: 'done-without-completedAt',
          severity: 'error',
          message: `Stage ${stage.id} is Done without completedAt.`,
        });
      }
      if (stage.status === 'Active' && stage.startedAt === null) {
        issues.push({
          code: 'active-without-startedAt',
          severity: 'error',
          message: `Stage ${stage.id} is Active without startedAt.`,
        });
      }
    }
    if (execution.state === 'Running' && activeCount !== 1) {
      issues.push({
        code: 'invalid-active-stage-count',
        severity: 'error',
        message: `Running execution must have exactly one Active stage (found ${activeCount}).`,
      });
    }
    return issues;
  };

  const validateConsistency = (
    execution: DecisionExecution,
  ): DecisionExecutionValidationIssue[] => {
    const issues: DecisionExecutionValidationIssue[] = [];
    if (!execution.sessionId.trim()) {
      issues.push({
        code: 'missing-session',
        severity: 'error',
        message: `Execution ${execution.id} missing sessionId.`,
      });
    }
    if (!execution.storyId.trim()) {
      issues.push({
        code: 'missing-story',
        severity: 'error',
        message: `Execution ${execution.id} missing storyId.`,
      });
    }
    if (execution.stages.length === 0) {
      issues.push({
        code: 'empty-stages',
        severity: 'error',
        message: `Execution ${execution.id} has no stages.`,
      });
    }
    const active = execution.stages.find((stage) => stage.status === 'Active');
    if (
      active !== undefined &&
      execution.currentMove !== null &&
      active.metadata.moveId !== null &&
      active.metadata.moveId !== execution.currentMove
    ) {
      issues.push({
        code: 'move-stage-mismatch',
        severity: 'error',
        message: `Active stage move ${active.metadata.moveId} ≠ currentMove ${execution.currentMove}.`,
      });
    }
    return issues;
  };

  return {
    validateState,
    validateTransitions,
    validateConsistency,
    validate(execution) {
      const issues = [
        ...validateState(execution),
        ...validateTransitions(execution),
        ...validateConsistency(execution),
      ];
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
