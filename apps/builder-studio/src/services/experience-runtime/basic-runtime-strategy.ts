import type {
  ExperienceRuntimeValidation,
  ExperienceRuntimeValidationIssue,
  RuntimeExecution,
  RuntimeTransition,
  StartRuntimeInput,
} from '../../model';

/**
 * RuntimeStrategy (EPIC-BLD-32).
 * Deterministic navigation only — no AI / interpretation.
 */
export type RuntimeStrategy = {
  readonly id: string;
  supports(input: StartRuntimeInput): boolean;
  resolveNext(
    execution: RuntimeExecution,
    moveIds: readonly string[],
    direction: 'next' | 'previous' | 'jump',
    targetMoveId?: string | null,
  ): {
    readonly currentMove: string | null;
    readonly completed: boolean;
    readonly reason: string;
  };
  transition(
    execution: RuntimeExecution,
    moveIds: readonly string[],
    direction: 'next' | 'previous' | 'jump',
    now: () => Date,
    targetMoveId?: string | null,
  ): {
    readonly currentMove: string | null;
    readonly currentStage: RuntimeExecution['currentStage'];
    readonly transition: RuntimeTransition;
    readonly completed: boolean;
  };
};

/**
 * BasicRuntimeStrategy — sequential story moves with jump support.
 */
export function createBasicRuntimeStrategy(): RuntimeStrategy {
  return {
    id: 'basic-runtime-strategy',

    supports(input) {
      return (
        input.sessionId.trim().length > 0 &&
        input.storyId.trim().length > 0 &&
        input.moveIds.length > 0
      );
    },

    resolveNext(execution, moveIds, direction, targetMoveId) {
      if (moveIds.length === 0) {
        return {
          currentMove: null,
          completed: true,
          reason: 'empty-story',
        };
      }

      if (direction === 'jump') {
        const target = targetMoveId ?? null;
        if (target === null || !moveIds.includes(target)) {
          return {
            currentMove: execution.currentMove,
            completed: false,
            reason: 'invalid-jump-target',
          };
        }
        return {
          currentMove: target,
          completed: false,
          reason: `jump-to:${target}`,
        };
      }

      if (direction === 'previous') {
        if (execution.currentMove === null) {
          return {
            currentMove: moveIds[0] ?? null,
            completed: false,
            reason: 'previous-from-null',
          };
        }
        const index = moveIds.indexOf(execution.currentMove);
        if (index <= 0) {
          return {
            currentMove: moveIds[0] ?? null,
            completed: false,
            reason: 'already-at-first',
          };
        }
        return {
          currentMove: moveIds[index - 1] ?? null,
          completed: false,
          reason: 'previous-move',
        };
      }

      // next
      if (execution.currentMove === null) {
        return {
          currentMove: moveIds[0] ?? null,
          completed: false,
          reason: 'first-move',
        };
      }
      const index = moveIds.indexOf(execution.currentMove);
      if (index < 0) {
        return {
          currentMove: moveIds[0] ?? null,
          completed: false,
          reason: 'recover-to-first',
        };
      }
      if (index >= moveIds.length - 1) {
        return {
          currentMove: execution.currentMove,
          completed: true,
          reason: 'end-of-story',
        };
      }
      return {
        currentMove: moveIds[index + 1] ?? null,
        completed: false,
        reason: 'next-move',
      };
    },

    transition(execution, moveIds, direction, now, targetMoveId) {
      const resolved = this.resolveNext(
        execution,
        moveIds,
        direction,
        targetMoveId,
      );
      const stamp = now().toISOString();
      const stage =
        direction === 'jump'
          ? ('Jump' as const)
          : resolved.completed
            ? ('Complete' as const)
            : ('Move' as const);

      return {
        currentMove: resolved.currentMove,
        currentStage: stage,
        completed: resolved.completed,
        transition: {
          from: execution.currentMove,
          to: resolved.completed ? resolved.currentMove : resolved.currentMove,
          reason: resolved.reason,
          timestamp: stamp,
          metadata: {
            notes: `Strategy ${this.id}: ${direction}`,
            stage,
          },
        },
      };
    },
  };
}

/**
 * RuntimeValidator (EPIC-BLD-32).
 * Named ExperienceRuntimeValidator in exports to avoid conceptual clash
 * with Decision Runtime validation helpers — type alias RuntimeValidator kept.
 */
export type RuntimeValidator = {
  validate(execution: RuntimeExecution): ExperienceRuntimeValidation;
  validateTransitions(
    execution: RuntimeExecution,
  ): readonly ExperienceRuntimeValidationIssue[];
  validateStory(
    execution: RuntimeExecution,
  ): readonly ExperienceRuntimeValidationIssue[];
  validateState(
    execution: RuntimeExecution,
  ): readonly ExperienceRuntimeValidationIssue[];
};

export function createRuntimeValidator(options?: {
  readonly now?: () => Date;
}): RuntimeValidator {
  const now = options?.now ?? (() => new Date());

  const validateTransitions = (
    execution: RuntimeExecution,
  ): ExperienceRuntimeValidationIssue[] => {
    const issues: ExperienceRuntimeValidationIssue[] = [];
    if (execution.transitions.length === 0) {
      issues.push({
        code: 'empty-transitions',
        severity: 'error',
        message: `Execution ${execution.id} has no transitions.`,
      });
    }
    for (const item of execution.transitions) {
      if (!item.reason.trim()) {
        issues.push({
          code: 'missing-transition-reason',
          severity: 'error',
          message: 'Transition missing audit reason.',
        });
      }
      if (!item.timestamp.trim()) {
        issues.push({
          code: 'missing-transition-timestamp',
          severity: 'error',
          message: 'Transition missing timestamp.',
        });
      }
    }
    return issues;
  };

  const validateStory = (
    execution: RuntimeExecution,
  ): ExperienceRuntimeValidationIssue[] => {
    const issues: ExperienceRuntimeValidationIssue[] = [];
    if (!execution.storyId.trim()) {
      issues.push({
        code: 'missing-story',
        severity: 'error',
        message: `Execution ${execution.id} missing storyId.`,
      });
    }
    if (!execution.sessionId.trim()) {
      issues.push({
        code: 'missing-session',
        severity: 'error',
        message: `Execution ${execution.id} missing sessionId.`,
      });
    }
    return issues;
  };

  const validateState = (
    execution: RuntimeExecution,
  ): ExperienceRuntimeValidationIssue[] => {
    const issues: ExperienceRuntimeValidationIssue[] = [];
    if (execution.status === 'Running' && execution.currentMove === null) {
      issues.push({
        code: 'running-without-move',
        severity: 'error',
        message: `Execution ${execution.id} is Running without currentMove.`,
      });
    }
    if (execution.status === 'Completed' && execution.completedAt === null) {
      issues.push({
        code: 'completed-without-timestamp',
        severity: 'error',
        message: `Execution ${execution.id} Completed without completedAt.`,
      });
    }
    if (
      execution.status === 'Running' &&
      execution.currentStage === 'Complete'
    ) {
      issues.push({
        code: 'running-complete-stage',
        severity: 'warning',
        message: 'Running execution has Complete stage.',
      });
    }
    return issues;
  };

  return {
    validateTransitions,
    validateStory,
    validateState,
    validate(execution) {
      const issues = [
        ...validateTransitions(execution),
        ...validateStory(execution),
        ...validateState(execution),
      ];
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
