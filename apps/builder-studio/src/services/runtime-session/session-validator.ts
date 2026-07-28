import type {
  CreateSessionInput,
  RuntimeSession,
  SessionValidation,
  SessionValidationIssue,
} from '../../model';

/**
 * SessionValidator (EPIC-BLD-19).
 * Structural validation only — no Story rewrite or rule evaluation.
 */
export type SessionValidator = {
  validate(session: RuntimeSession): SessionValidation;
  validateStory(input: CreateSessionInput): readonly SessionValidationIssue[];
  validateNavigation(
    session: RuntimeSession,
    targetMoveId: string | null,
  ): readonly SessionValidationIssue[];
};

export function createSessionValidator(options?: {
  readonly now?: () => Date;
}): SessionValidator {
  const now = options?.now ?? (() => new Date());

  const validateStory = (
    input: CreateSessionInput,
  ): SessionValidationIssue[] => {
    const issues: SessionValidationIssue[] = [];
    if (input.storyId.trim() === '') {
      issues.push({
        code: 'missing-story',
        severity: 'error',
        message: 'storyId is required.',
      });
    }
    if (input.runtimeId.trim() === '') {
      issues.push({
        code: 'missing-runtime',
        severity: 'error',
        message: 'runtimeId is required.',
      });
    }
    if (input.moveIds.length === 0) {
      issues.push({
        code: 'empty-moves',
        severity: 'error',
        message: 'Decision Story has no moves to navigate.',
      });
    }
    const unique = new Set(input.moveIds);
    if (unique.size !== input.moveIds.length) {
      issues.push({
        code: 'duplicate-moves',
        severity: 'error',
        message: 'moveIds must be unique.',
      });
    }
    return issues;
  };

  const validateNavigation = (
    session: RuntimeSession,
    targetMoveId: string | null,
  ): SessionValidationIssue[] => {
    const issues: SessionValidationIssue[] = [];
    if (session.status === 'Disposed' || session.status === 'Completed') {
      issues.push({
        code: 'session-closed',
        severity: 'error',
        message: `Cannot navigate session in status ${session.status}.`,
      });
    }
    if (targetMoveId === null) {
      issues.push({
        code: 'missing-target-move',
        severity: 'error',
        message: 'Target move is null.',
      });
      return issues;
    }
    if (!session.moveIds.includes(targetMoveId)) {
      issues.push({
        code: 'unknown-move',
        severity: 'error',
        message: `Move ${targetMoveId} is not part of the Decision Story.`,
      });
    }
    return issues;
  };

  return {
    validateStory,
    validateNavigation,
    validate(session) {
      const issues: SessionValidationIssue[] = [
        ...validateStory({
          runtimeId: session.runtimeId,
          storyId: session.storyId,
          moveIds: session.moveIds,
        }),
      ];
      if (
        session.currentMoveId !== null &&
        !session.moveIds.includes(session.currentMoveId)
      ) {
        issues.push({
          code: 'invalid-current-move',
          severity: 'error',
          message: 'currentMoveId is not in story move order.',
        });
      }
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
