/**
 * Runtime Recovery Reporting Engine (EPIC-BLD-46).
 * Creates final Recovery Reports only — never executes / coordinates recovery.
 */

export type RecoveryReportFinalStatus =
  | 'COMPLETED'
  | 'FAILED'
  | 'PARTIAL'
  | 'UNKNOWN';

export type RecoveryReportItem = {
  readonly id: string;
  readonly executionId: string;
  readonly status: string;
  readonly duration: number;
  readonly description: string;
  readonly metadata: {
    readonly notes: string;
    readonly sequenceId: string | null;
  };
};

export type RecoveryReport = {
  readonly id: string;
  readonly runtimeExecutionId: string | null;
  readonly sessionId: string;
  readonly summary: string;
  readonly executions: readonly RecoveryReportItem[];
  readonly duration: number;
  readonly finalStatus: RecoveryReportFinalStatus;
  readonly createdAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly recoverySessionId: string | null;
    readonly recoverySummaryId: string | null;
  };
};

export type RuntimeRecoveryReportPackage = {
  readonly id: string;
  readonly version: string;
  readonly report: RecoveryReport;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeRecoveryReportingValidation | null;
};

export type RuntimeRecoveryReportingValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeRecoveryReportingValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeRecoveryReportingValidationIssue[];
  readonly validatedAt: string;
};

export type CollectRecoveryReportInput = {
  readonly sessionId: string;
  readonly runtimeExecutionId?: string | null;
  readonly title?: string;
  readonly recoverySessionId?: string | null;
  readonly recoverySummaryId?: string | null;
  readonly finalStatus?: string | null;
  readonly duration?: number | null;
  readonly summaryText?: string | null;
  readonly executions?: readonly {
    readonly executionId: string;
    readonly status: string;
    readonly duration?: number;
    readonly description?: string;
    readonly sequenceId?: string | null;
  }[];
};

export type RuntimeRecoveryReportingIndexEntry = {
  readonly packageId: string;
  readonly reportId: string;
  readonly sessionId: string;
  readonly finalStatus: RecoveryReportFinalStatus;
};

export type RuntimeRecoveryReportingEventType =
  | 'RecoveryReportGenerated'
  | 'RecoveryReportPublished'
  | 'RecoveryReportValidated'
  | 'RecoveryReportIndexed';

export type RuntimeRecoveryReportingEvent = {
  readonly eventId: string;
  readonly type: RuntimeRecoveryReportingEventType;
  readonly packageId: string;
  readonly reportId: string | null;
  readonly at: string;
  readonly message: string;
};
