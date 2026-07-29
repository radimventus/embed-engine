import type {
  CollectOperationsInput,
  OperationsSnapshot,
  RuntimeOperationsPackage,
  RuntimeOperationsValidation,
  RuntimeOperationsValidationIssue,
} from '../../model';

/**
 * DashboardAggregationStrategy (EPIC-BLD-47).
 * Deterministic aggregation only — no new evaluations.
 */
export type DashboardAggregationStrategy = {
  readonly id: string;
  supports(input: CollectOperationsInput): boolean;
  collect(input: CollectOperationsInput): CollectOperationsInput;
  aggregate(
    input: CollectOperationsInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): OperationsSnapshot;
};

/**
 * BasicDashboardAggregationStrategy — maps published statuses into snapshot.
 */
export function createBasicDashboardAggregationStrategy(): DashboardAggregationStrategy {
  return {
    id: 'basic-dashboard-aggregation-strategy',

    supports(input) {
      return input.sessionId.trim().length > 0;
    },

    collect(input) {
      return {
        sessionId: input.sessionId,
        runtimeExecutionId: input.runtimeExecutionId ?? null,
        title: input.title,
        policyStatus: input.policyStatus ?? null,
        governanceStatus: input.governanceStatus ?? null,
        healthStatus: input.healthStatus ?? null,
        auditStatus: input.auditStatus ?? null,
        enforcementStatus: input.enforcementStatus ?? null,
        recoveryStatus: input.recoveryStatus ?? null,
        observabilityStatus: input.observabilityStatus ?? null,
        lastReportId: input.lastReportId ?? null,
        lastReportStatus: input.lastReportStatus ?? null,
      };
    },

    aggregate(input, createId, now) {
      const collected = this.collect(input);
      return {
        id: createId('operations-snapshot'),
        runtimeExecutionId: collected.runtimeExecutionId ?? null,
        policyStatus: collected.policyStatus ?? 'Unknown',
        governanceStatus: collected.governanceStatus ?? 'Unknown',
        healthStatus: collected.healthStatus ?? 'Unknown',
        auditStatus: collected.auditStatus ?? 'Unknown',
        enforcementStatus: collected.enforcementStatus ?? 'Unknown',
        recoveryStatus: collected.recoveryStatus ?? 'Unknown',
        createdAt: now().toISOString(),
        metadata: {
          title:
            collected.title?.trim() ||
            `Operations Snapshot ${collected.sessionId}`,
          notes:
            'Projection of published Production Layer artifacts — no new evaluation.',
          sessionId: collected.sessionId,
          observabilityStatus: collected.observabilityStatus ?? 'Unknown',
          lastReportId: collected.lastReportId ?? null,
          lastReportStatus: collected.lastReportStatus ?? null,
        },
      };
    },
  };
}

/**
 * RuntimeOperationsValidator (EPIC-BLD-47).
 */
export type RuntimeOperationsValidator = {
  validate(pkg: RuntimeOperationsPackage): RuntimeOperationsValidation;
  validateSnapshot(
    pkg: RuntimeOperationsPackage,
  ): readonly RuntimeOperationsValidationIssue[];
  validateAggregation(
    pkg: RuntimeOperationsPackage,
  ): readonly RuntimeOperationsValidationIssue[];
  validateIntegrity(
    pkg: RuntimeOperationsPackage,
  ): readonly RuntimeOperationsValidationIssue[];
};

export function createRuntimeOperationsValidator(options?: {
  readonly now?: () => Date;
}): RuntimeOperationsValidator {
  const now = options?.now ?? (() => new Date());

  const validateSnapshot = (
    pkg: RuntimeOperationsPackage,
  ): RuntimeOperationsValidationIssue[] => {
    const issues: RuntimeOperationsValidationIssue[] = [];
    if (!pkg.snapshot.metadata.sessionId.trim()) {
      issues.push({
        code: 'snapshot-missing-session',
        severity: 'error',
        message: `Snapshot ${pkg.snapshot.id} missing sessionId.`,
      });
    }
    if (!pkg.snapshot.id.trim()) {
      issues.push({
        code: 'snapshot-missing-id',
        severity: 'error',
        message: 'Snapshot missing id.',
      });
    }
    return issues;
  };

  const validateAggregation = (
    pkg: RuntimeOperationsPackage,
  ): RuntimeOperationsValidationIssue[] => {
    const issues: RuntimeOperationsValidationIssue[] = [];
    const fields: Array<keyof OperationsSnapshot> = [
      'policyStatus',
      'governanceStatus',
      'healthStatus',
      'auditStatus',
      'enforcementStatus',
      'recoveryStatus',
    ];
    for (const field of fields) {
      const value = pkg.snapshot[field];
      if (typeof value !== 'string' || value.trim().length === 0) {
        issues.push({
          code: 'aggregation-empty-status',
          severity: 'error',
          message: `Snapshot ${field} is empty.`,
        });
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeOperationsPackage,
  ): RuntimeOperationsValidationIssue[] => {
    const issues: RuntimeOperationsValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.snapshot.metadata.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match snapshot.sessionId.',
      });
    }
    if (
      pkg.snapshot.metadata.lastReportId !== null &&
      (pkg.snapshot.metadata.lastReportStatus === null ||
        pkg.snapshot.metadata.lastReportStatus.trim().length === 0)
    ) {
      issues.push({
        code: 'report-status-missing',
        severity: 'warning',
        message: 'lastReportId present without lastReportStatus.',
      });
    }
    return issues;
  };

  return {
    validateSnapshot,
    validateAggregation,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateSnapshot(pkg),
        ...validateAggregation(pkg),
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
