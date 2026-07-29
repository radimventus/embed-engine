/**
 * Runtime Operations Dashboard (EPIC-BLD-47).
 * Pure projection layer — aggregates published capability artifacts only.
 */

export type OperationsSnapshot = {
  readonly id: string;
  readonly runtimeExecutionId: string | null;
  readonly policyStatus: string;
  readonly governanceStatus: string;
  readonly healthStatus: string;
  readonly auditStatus: string;
  readonly enforcementStatus: string;
  readonly recoveryStatus: string;
  readonly createdAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sessionId: string;
    readonly observabilityStatus: string;
    readonly lastReportId: string | null;
    readonly lastReportStatus: string | null;
  };
};

export type RuntimeOperationsPackage = {
  readonly id: string;
  readonly version: string;
  readonly snapshot: OperationsSnapshot;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeOperationsValidation | null;
};

export type RuntimeOperationsValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeOperationsValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeOperationsValidationIssue[];
  readonly validatedAt: string;
};

export type CollectOperationsInput = {
  readonly sessionId: string;
  readonly runtimeExecutionId?: string | null;
  readonly title?: string;
  readonly policyStatus?: string | null;
  readonly governanceStatus?: string | null;
  readonly healthStatus?: string | null;
  readonly auditStatus?: string | null;
  readonly enforcementStatus?: string | null;
  readonly recoveryStatus?: string | null;
  readonly observabilityStatus?: string | null;
  readonly lastReportId?: string | null;
  readonly lastReportStatus?: string | null;
};

export type RuntimeOperationsIndexEntry = {
  readonly packageId: string;
  readonly snapshotId: string;
  readonly sessionId: string;
  readonly recoveryStatus: string;
};

export type RuntimeOperationsEventType =
  | 'OperationsCollected'
  | 'OperationsAggregated'
  | 'OperationsPublished'
  | 'OperationsValidated';

export type RuntimeOperationsEvent = {
  readonly eventId: string;
  readonly type: RuntimeOperationsEventType;
  readonly packageId: string;
  readonly snapshotId: string | null;
  readonly at: string;
  readonly message: string;
};
