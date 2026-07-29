/**
 * Runtime Recovery Coordinator (EPIC-BLD-45).
 * Coordinates Recovery Session lifecycle — never creates Plan/Sequence/Execution.
 */

export type RecoverySessionStatus =
  | 'CREATED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type RecoverySessionExecutionRef = {
  readonly executionId: string;
  readonly status: string;
  readonly sequenceId: string | null;
};

export type RecoverySession = {
  readonly id: string;
  readonly runtimeExecutionId: string | null;
  readonly status: RecoverySessionStatus;
  readonly executions: readonly RecoverySessionExecutionRef[];
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sessionId: string;
    readonly progressPercent: number;
  };
};

export type RecoverySummary = {
  readonly id: string;
  readonly sessionId: string;
  readonly completedExecutions: number;
  readonly failedExecutions: number;
  readonly duration: number;
  readonly finalStatus: RecoverySessionStatus;
  readonly metadata: {
    readonly notes: string;
    readonly title: string;
    readonly executionIds: readonly string[];
  };
};

export type RuntimeRecoverySummaryPackage = {
  readonly id: string;
  readonly version: string;
  readonly session: RecoverySession;
  readonly summary: RecoverySummary | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeRecoveryCoordinatorValidation | null;
};

export type RuntimeRecoveryCoordinatorValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeRecoveryCoordinatorValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeRecoveryCoordinatorValidationIssue[];
  readonly validatedAt: string;
};

export type StartRecoverySessionInput = {
  readonly sessionId: string;
  readonly runtimeExecutionId?: string | null;
  readonly title?: string;
  readonly executions?: readonly RecoverySessionExecutionRef[];
};

export type TrackRecoveryProgressInput = {
  readonly packageId: string;
  readonly executions: readonly RecoverySessionExecutionRef[];
};

export type RuntimeRecoveryCoordinatorIndexEntry = {
  readonly packageId: string;
  readonly recoverySessionId: string;
  readonly sessionId: string;
  readonly status: RecoverySessionStatus;
};

export type RuntimeRecoveryCoordinatorEventType =
  | 'RecoverySessionStarted'
  | 'RecoveryProgressUpdated'
  | 'RecoveryCompleted'
  | 'RecoverySummaryPublished';

export type RuntimeRecoveryCoordinatorEvent = {
  readonly eventId: string;
  readonly type: RuntimeRecoveryCoordinatorEventType;
  readonly packageId: string;
  readonly recoverySessionId: string | null;
  readonly at: string;
  readonly message: string;
};
