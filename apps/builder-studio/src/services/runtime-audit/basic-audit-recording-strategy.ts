import type {
  AppendAuditInput,
  AuditEventSource,
  RecordAuditInput,
  RuntimeAuditPackage,
  RuntimeAuditRecord,
  RuntimeAuditTrail,
  RuntimeAuditValidation,
  RuntimeAuditValidationIssue,
} from '../../model';

/**
 * AuditRecordingStrategy (EPIC-BLD-38).
 * Deterministic recording only — no AI.
 */
export type AuditRecordingStrategy = {
  readonly id: string;
  supports(input: RecordAuditInput | { readonly sources: readonly AuditEventSource[] }): boolean;
  record(
    sources: readonly AuditEventSource[],
    sessionId: string,
    createId: (prefix: string) => string,
  ): readonly RuntimeAuditRecord[];
};

/**
 * BasicAuditRecordingStrategy — maps sources to immutable audit records.
 */
export function createBasicAuditRecordingStrategy(): AuditRecordingStrategy {
  return {
    id: 'basic-audit-recording-strategy',

    supports(input) {
      if ('sessionId' in input) {
        return (
          input.sessionId.trim().length > 0 && input.sources.length > 0
        );
      }
      return input.sources.length > 0;
    },

    record(sources, sessionId, createId) {
      return sources
        .filter((source) => source.sessionId === sessionId)
        .map((source) => ({
          id: createId('runtime-audit-record'),
          sessionId: source.sessionId,
          runtimeExecutionId: source.runtimeExecutionId ?? null,
          moduleExecutionId: source.moduleExecutionId ?? null,
          entity: source.entity,
          action: source.action,
          timestamp: source.timestamp,
          metadata: {
            source: source.source,
            notes: `Audit ${source.action} (${source.entity}).`,
            packageId: source.packageId ?? null,
          },
        }))
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    },
  };
}

export function buildTrail(
  sessionId: string,
  records: readonly RuntimeAuditRecord[],
  createId: (prefix: string) => string,
  now: () => Date,
  title?: string,
  status: RuntimeAuditTrail['metadata']['status'] = 'Open',
  completedAt: string | null = null,
): RuntimeAuditTrail {
  const stamp = now().toISOString();
  return {
    id: createId('runtime-audit-trail'),
    sessionId,
    records,
    startedAt: records[0]?.timestamp ?? stamp,
    completedAt,
    metadata: {
      title: title?.trim() || `Audit Trail ${sessionId}`,
      notes: 'Immutable audit trail for Runtime Session.',
      status,
    },
  };
}

/**
 * RuntimeAuditValidator (EPIC-BLD-38).
 */
export type RuntimeAuditValidator = {
  validate(pkg: RuntimeAuditPackage): RuntimeAuditValidation;
  validateTrail(
    pkg: RuntimeAuditPackage,
  ): readonly RuntimeAuditValidationIssue[];
  validateRecords(
    pkg: RuntimeAuditPackage,
  ): readonly RuntimeAuditValidationIssue[];
  validateIntegrity(
    pkg: RuntimeAuditPackage,
  ): readonly RuntimeAuditValidationIssue[];
};

export function createRuntimeAuditValidator(options?: {
  readonly now?: () => Date;
}): RuntimeAuditValidator {
  const now = options?.now ?? (() => new Date());

  const validateTrail = (
    pkg: RuntimeAuditPackage,
  ): RuntimeAuditValidationIssue[] => {
    const issues: RuntimeAuditValidationIssue[] = [];
    if (pkg.trail.records.length === 0) {
      issues.push({
        code: 'empty-trail',
        severity: 'error',
        message: `Trail ${pkg.trail.id} has no records.`,
      });
    }
    if (!pkg.trail.sessionId.trim()) {
      issues.push({
        code: 'trail-missing-session',
        severity: 'error',
        message: `Trail ${pkg.trail.id} missing sessionId.`,
      });
    }
    if (
      pkg.trail.metadata.status === 'Finalized' &&
      pkg.trail.completedAt === null
    ) {
      issues.push({
        code: 'finalized-without-completed-at',
        severity: 'error',
        message: `Finalized trail ${pkg.trail.id} missing completedAt.`,
      });
    }
    return issues;
  };

  const validateRecords = (
    pkg: RuntimeAuditPackage,
  ): RuntimeAuditValidationIssue[] => {
    const issues: RuntimeAuditValidationIssue[] = [];
    const ids = new Set<string>();
    for (const record of pkg.trail.records) {
      if (ids.has(record.id)) {
        issues.push({
          code: 'duplicate-record-id',
          severity: 'error',
          message: `Duplicate audit record id ${record.id}.`,
        });
      }
      ids.add(record.id);
      if (!record.action.trim()) {
        issues.push({
          code: 'record-missing-action',
          severity: 'error',
          message: `Record ${record.id} missing action.`,
        });
      }
      if (!record.timestamp.trim()) {
        issues.push({
          code: 'record-missing-timestamp',
          severity: 'error',
          message: `Record ${record.id} missing timestamp.`,
        });
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeAuditPackage,
  ): RuntimeAuditValidationIssue[] => {
    const issues: RuntimeAuditValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.trail.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match trail.sessionId.',
      });
    }
    if (pkg.metadata.immutable !== true) {
      issues.push({
        code: 'not-immutable',
        severity: 'error',
        message: 'Audit package must be marked immutable.',
      });
    }
    for (const record of pkg.trail.records) {
      if (record.sessionId !== pkg.trail.sessionId) {
        issues.push({
          code: 'record-session-mismatch',
          severity: 'error',
          message: `Record ${record.id} session mismatch.`,
        });
      }
    }
    // Chronological integrity
    for (let i = 1; i < pkg.trail.records.length; i += 1) {
      const prev = pkg.trail.records[i - 1];
      const curr = pkg.trail.records[i];
      if (
        prev !== undefined &&
        curr !== undefined &&
        curr.timestamp.localeCompare(prev.timestamp) < 0
      ) {
        issues.push({
          code: 'out-of-order-records',
          severity: 'warning',
          message: `Record ${curr.id} is out of chronological order.`,
        });
      }
    }
    return issues;
  };

  return {
    validateTrail,
    validateRecords,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateTrail(pkg),
        ...validateRecords(pkg),
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

export type { AppendAuditInput, RecordAuditInput };
