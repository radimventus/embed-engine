import type {
  CollectRecoveryReportInput,
  RecoveryReport,
  RecoveryReportFinalStatus,
  RecoveryReportItem,
  RuntimeRecoveryReportPackage,
  RuntimeRecoveryReportingValidation,
  RuntimeRecoveryReportingValidationIssue,
} from '../../model';

/**
 * RecoveryReportingStrategy (EPIC-BLD-46).
 * Deterministic report generation only — never executes recovery.
 */
export type RecoveryReportingStrategy = {
  readonly id: string;
  supports(input: CollectRecoveryReportInput): boolean;
  collect(input: CollectRecoveryReportInput): CollectRecoveryReportInput;
  generate(
    input: CollectRecoveryReportInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): RecoveryReport;
};

/**
 * BasicRecoveryReportingStrategy — aggregates session/execution refs into report.
 */
export function createBasicRecoveryReportingStrategy(): RecoveryReportingStrategy {
  return {
    id: 'basic-recovery-reporting-strategy',

    supports(input) {
      return input.sessionId.trim().length > 0;
    },

    collect(input) {
      return {
        sessionId: input.sessionId,
        runtimeExecutionId: input.runtimeExecutionId ?? null,
        title: input.title,
        recoverySessionId: input.recoverySessionId ?? null,
        recoverySummaryId: input.recoverySummaryId ?? null,
        finalStatus: input.finalStatus ?? null,
        duration: input.duration ?? null,
        summaryText: input.summaryText ?? null,
        executions: [...(input.executions ?? [])],
      };
    },

    generate(input, createId, now) {
      const collected = this.collect(input);
      const items: RecoveryReportItem[] = (collected.executions ?? []).map(
        (item, index) => ({
          id: createId('recovery-report-item'),
          executionId: item.executionId,
          status: item.status,
          duration: item.duration ?? 0,
          description:
            item.description?.trim() ||
            `Recovery execution ${item.executionId}`,
          metadata: {
            notes: `Report item #${index + 1} — read-only aggregation.`,
            sequenceId: item.sequenceId ?? null,
          },
        }),
      );

      const duration =
        collected.duration ??
        items.reduce((sum, item) => sum + item.duration, 0);
      const finalStatus = resolveFinalStatus(collected.finalStatus, items);
      const summary =
        collected.summaryText?.trim() ||
        buildSummaryText(finalStatus, items, duration);

      return {
        id: createId('recovery-report'),
        runtimeExecutionId: collected.runtimeExecutionId ?? null,
        sessionId: collected.sessionId,
        summary,
        executions: items,
        duration,
        finalStatus,
        createdAt: now().toISOString(),
        metadata: {
          title:
            collected.title?.trim() ||
            `Recovery Report ${collected.sessionId}`,
          notes:
            'Recovery Report artifact only — no recovery actions performed.',
          recoverySessionId: collected.recoverySessionId ?? null,
          recoverySummaryId: collected.recoverySummaryId ?? null,
        },
      };
    },
  };
}

function resolveFinalStatus(
  raw: string | null | undefined,
  items: readonly RecoveryReportItem[],
): RecoveryReportFinalStatus {
  if (raw !== null && raw !== undefined) {
    const normalized = raw.toUpperCase();
    if (normalized === 'COMPLETED') return 'COMPLETED';
    if (normalized === 'FAILED') return 'FAILED';
    if (normalized === 'PARTIAL' || normalized === 'CANCELLED') return 'PARTIAL';
  }
  if (items.length === 0) return 'UNKNOWN';
  const failed = items.filter((item) => {
    const status = item.status.toUpperCase();
    return status === 'FAILED' || item.status === 'Failed' || item.status === 'Partial';
  }).length;
  const completed = items.filter((item) => {
    const status = item.status.toUpperCase();
    return status === 'COMPLETED' || item.status === 'Succeeded';
  }).length;
  if (failed > 0 && completed > 0) return 'PARTIAL';
  if (failed > 0) return 'FAILED';
  if (completed === items.length) return 'COMPLETED';
  return 'UNKNOWN';
}

function buildSummaryText(
  finalStatus: RecoveryReportFinalStatus,
  items: readonly RecoveryReportItem[],
  duration: number,
): string {
  return `Recovery ${finalStatus} · ${items.length} execution(s) · ${duration}s.`;
}

/**
 * RuntimeRecoveryReportingValidator (EPIC-BLD-46).
 */
export type RuntimeRecoveryReportingValidator = {
  validate(
    pkg: RuntimeRecoveryReportPackage,
  ): RuntimeRecoveryReportingValidation;
  validateReport(
    pkg: RuntimeRecoveryReportPackage,
  ): readonly RuntimeRecoveryReportingValidationIssue[];
  validateItems(
    pkg: RuntimeRecoveryReportPackage,
  ): readonly RuntimeRecoveryReportingValidationIssue[];
  validateIntegrity(
    pkg: RuntimeRecoveryReportPackage,
  ): readonly RuntimeRecoveryReportingValidationIssue[];
};

export function createRuntimeRecoveryReportingValidator(options?: {
  readonly now?: () => Date;
}): RuntimeRecoveryReportingValidator {
  const now = options?.now ?? (() => new Date());

  const validateReport = (
    pkg: RuntimeRecoveryReportPackage,
  ): RuntimeRecoveryReportingValidationIssue[] => {
    const issues: RuntimeRecoveryReportingValidationIssue[] = [];
    if (!pkg.report.sessionId.trim()) {
      issues.push({
        code: 'report-missing-session',
        severity: 'error',
        message: `Report ${pkg.report.id} missing sessionId.`,
      });
    }
    if (!pkg.report.summary.trim()) {
      issues.push({
        code: 'report-missing-summary',
        severity: 'error',
        message: `Report ${pkg.report.id} missing summary.`,
      });
    }
    if (pkg.report.duration < 0) {
      issues.push({
        code: 'invalid-report-duration',
        severity: 'error',
        message: `Report ${pkg.report.id} has invalid duration.`,
      });
    }
    return issues;
  };

  const validateItems = (
    pkg: RuntimeRecoveryReportPackage,
  ): RuntimeRecoveryReportingValidationIssue[] => {
    const issues: RuntimeRecoveryReportingValidationIssue[] = [];
    const ids = new Set<string>();
    for (const item of pkg.report.executions) {
      if (ids.has(item.id)) {
        issues.push({
          code: 'duplicate-report-item',
          severity: 'error',
          message: `Duplicate report item id ${item.id}.`,
        });
      }
      ids.add(item.id);
      if (!item.executionId.trim()) {
        issues.push({
          code: 'item-missing-execution',
          severity: 'error',
          message: `Report item ${item.id} missing executionId.`,
        });
      }
      if (item.duration < 0) {
        issues.push({
          code: 'item-invalid-duration',
          severity: 'error',
          message: `Report item ${item.id} has invalid duration.`,
        });
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeRecoveryReportPackage,
  ): RuntimeRecoveryReportingValidationIssue[] => {
    const issues: RuntimeRecoveryReportingValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.report.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match report.sessionId.',
      });
    }
    if (
      pkg.report.finalStatus === 'COMPLETED' &&
      pkg.report.executions.some((item) => item.status.toUpperCase() === 'FAILED')
    ) {
      issues.push({
        code: 'completed-with-failed-item',
        severity: 'warning',
        message: 'COMPLETED report contains FAILED execution item.',
      });
    }
    return issues;
  };

  return {
    validateReport,
    validateItems,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateReport(pkg),
        ...validateItems(pkg),
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
