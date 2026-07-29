import type {
  RecoverySession,
  RecoverySessionExecutionRef,
  RecoverySessionStatus,
  RecoverySummary,
  RuntimeRecoveryCoordinatorValidation,
  RuntimeRecoveryCoordinatorValidationIssue,
  RuntimeRecoverySummaryPackage,
  StartRecoverySessionInput,
} from '../../model';

/**
 * RecoveryCoordinationStrategy (EPIC-BLD-45).
 * Deterministic session coordination only — never executes recovery steps.
 */
export type RecoveryCoordinationStrategy = {
  readonly id: string;
  supports(input: StartRecoverySessionInput): boolean;
  coordinate(
    session: RecoverySession,
    executions: readonly RecoverySessionExecutionRef[],
    now: () => Date,
  ): RecoverySession;
  finalize(
    session: RecoverySession,
    createId: (prefix: string) => string,
    now: () => Date,
  ): {
    readonly session: RecoverySession;
    readonly summary: RecoverySummary;
  };
};

/**
 * BasicRecoveryCoordinationStrategy — aggregates execution refs into session state.
 */
export function createBasicRecoveryCoordinationStrategy(): RecoveryCoordinationStrategy {
  return {
    id: 'basic-recovery-coordination-strategy',

    supports(input) {
      return input.sessionId.trim().length > 0;
    },

    coordinate(session, executions, now) {
      const refs = [...executions];
      const completed = refs.filter((item) =>
        isCompletedStatus(item.status),
      ).length;
      const failed = refs.filter((item) => isFailedStatus(item.status)).length;
      const running = refs.filter((item) =>
        isRunningStatus(item.status),
      ).length;
      const total = refs.length;
      const progressPercent =
        total === 0 ? 0 : Math.round(((completed + failed) / total) * 100);

      let status: RecoverySessionStatus = session.status;
      if (total === 0) {
        status = session.status === 'CREATED' ? 'CREATED' : 'RUNNING';
      } else if (failed > 0 && completed + failed === total) {
        status = 'FAILED';
      } else if (completed === total) {
        status = 'COMPLETED';
      } else if (running > 0 || completed > 0 || failed > 0) {
        status = 'RUNNING';
      }

      return {
        ...session,
        status,
        executions: refs,
        startedAt:
          session.startedAt ??
          (status === 'RUNNING' || status === 'COMPLETED' || status === 'FAILED'
            ? now().toISOString()
            : null),
        completedAt:
          status === 'COMPLETED' || status === 'FAILED'
            ? now().toISOString()
            : null,
        metadata: {
          ...session.metadata,
          progressPercent,
          notes:
            'Recovery Session coordination only — executions are external refs.',
        },
      };
    },

    finalize(session, createId, now) {
      const completedExecutions = session.executions.filter((item) =>
        isCompletedStatus(item.status),
      ).length;
      const failedExecutions = session.executions.filter((item) =>
        isFailedStatus(item.status),
      ).length;
      const finalStatus: RecoverySessionStatus =
        failedExecutions > 0
          ? 'FAILED'
          : completedExecutions === session.executions.length &&
              session.executions.length > 0
            ? 'COMPLETED'
            : session.status === 'CANCELLED'
              ? 'CANCELLED'
              : session.executions.length === 0
                ? 'COMPLETED'
                : 'FAILED';

      const started = session.startedAt
        ? Date.parse(session.startedAt)
        : Date.parse(now().toISOString());
      const ended = session.completedAt
        ? Date.parse(session.completedAt)
        : Date.parse(now().toISOString());
      const durationMs = Math.max(0, ended - started);
      const duration = Math.round(durationMs / 1000);

      const nextSession: RecoverySession = {
        ...session,
        status: finalStatus,
        completedAt: session.completedAt ?? now().toISOString(),
        startedAt: session.startedAt ?? now().toISOString(),
        metadata: {
          ...session.metadata,
          progressPercent: 100,
          notes: 'Recovery Session finalized by Coordinator.',
        },
      };

      const summary: RecoverySummary = {
        id: createId('recovery-summary'),
        sessionId: session.id,
        completedExecutions,
        failedExecutions,
        duration,
        finalStatus,
        metadata: {
          notes: 'Recovery Summary artifact — coordination result only.',
          title: session.metadata.title,
          executionIds: session.executions.map((item) => item.executionId),
        },
      };

      return { session: nextSession, summary };
    },
  };
}

function isCompletedStatus(status: string): boolean {
  const normalized = status.toUpperCase();
  return normalized === 'COMPLETED' || status === 'Succeeded';
}

function isFailedStatus(status: string): boolean {
  const normalized = status.toUpperCase();
  return (
    normalized === 'FAILED' || status === 'Failed' || status === 'Partial'
  );
}

function isRunningStatus(status: string): boolean {
  const normalized = status.toUpperCase();
  return (
    normalized === 'RUNNING' ||
    normalized === 'READY' ||
    normalized === 'PAUSED'
  );
}

/**
 * RuntimeRecoveryCoordinatorValidator (EPIC-BLD-45).
 */
export type RuntimeRecoveryCoordinatorValidator = {
  validate(
    pkg: RuntimeRecoverySummaryPackage,
  ): RuntimeRecoveryCoordinatorValidation;
  validateSession(
    pkg: RuntimeRecoverySummaryPackage,
  ): readonly RuntimeRecoveryCoordinatorValidationIssue[];
  validateSummary(
    pkg: RuntimeRecoverySummaryPackage,
  ): readonly RuntimeRecoveryCoordinatorValidationIssue[];
  validateIntegrity(
    pkg: RuntimeRecoverySummaryPackage,
  ): readonly RuntimeRecoveryCoordinatorValidationIssue[];
};

export function createRuntimeRecoveryCoordinatorValidator(options?: {
  readonly now?: () => Date;
}): RuntimeRecoveryCoordinatorValidator {
  const now = options?.now ?? (() => new Date());

  const validateSession = (
    pkg: RuntimeRecoverySummaryPackage,
  ): RuntimeRecoveryCoordinatorValidationIssue[] => {
    const issues: RuntimeRecoveryCoordinatorValidationIssue[] = [];
    const session = pkg.session;
    if (!session.metadata.sessionId.trim()) {
      issues.push({
        code: 'session-missing-session-id',
        severity: 'error',
        message: `Recovery session ${session.id} missing sessionId.`,
      });
    }
    const allowed: RecoverySessionStatus[] = [
      'CREATED',
      'RUNNING',
      'COMPLETED',
      'FAILED',
      'CANCELLED',
    ];
    if (!allowed.includes(session.status)) {
      issues.push({
        code: 'invalid-session-status',
        severity: 'error',
        message: `Invalid recovery session status ${session.status}.`,
      });
    }
    const ids = new Set<string>();
    for (const ref of session.executions) {
      if (ids.has(ref.executionId)) {
        issues.push({
          code: 'duplicate-execution-ref',
          severity: 'error',
          message: `Duplicate execution ref ${ref.executionId}.`,
        });
      }
      ids.add(ref.executionId);
    }
    return issues;
  };

  const validateSummary = (
    pkg: RuntimeRecoverySummaryPackage,
  ): RuntimeRecoveryCoordinatorValidationIssue[] => {
    const issues: RuntimeRecoveryCoordinatorValidationIssue[] = [];
    if (
      (pkg.session.status === 'COMPLETED' ||
        pkg.session.status === 'FAILED') &&
      pkg.summary === null
    ) {
      issues.push({
        code: 'missing-summary',
        severity: 'warning',
        message: `Terminal session ${pkg.session.id} has no summary yet.`,
      });
    }
    if (pkg.summary !== null) {
      if (pkg.summary.sessionId !== pkg.session.id) {
        issues.push({
          code: 'summary-session-mismatch',
          severity: 'error',
          message: 'Summary.sessionId does not match session.id.',
        });
      }
      if (pkg.summary.duration < 0) {
        issues.push({
          code: 'invalid-summary-duration',
          severity: 'error',
          message: `Summary ${pkg.summary.id} has invalid duration.`,
        });
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeRecoverySummaryPackage,
  ): RuntimeRecoveryCoordinatorValidationIssue[] => {
    const issues: RuntimeRecoveryCoordinatorValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.session.metadata.sessionId) {
      issues.push({
        code: 'package-session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match session.metadata.sessionId.',
      });
    }
    if (
      pkg.summary !== null &&
      pkg.summary.completedExecutions + pkg.summary.failedExecutions >
        pkg.session.executions.length
    ) {
      issues.push({
        code: 'summary-count-overflow',
        severity: 'error',
        message: 'Summary execution counts exceed session.executions length.',
      });
    }
    return issues;
  };

  return {
    validateSession,
    validateSummary,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateSession(pkg),
        ...validateSummary(pkg),
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
