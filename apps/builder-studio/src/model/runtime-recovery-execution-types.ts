/**
 * Runtime Recovery Executor (EPIC-BLD-44).
 * Executes prepared Recovery Sequences deterministically —
 * coordinates step execution requests; does not own or control Runtime.
 */

import type { RecoverySequence } from './runtime-recovery-types';

export type RecoveryExecutionStatus =
  | 'READY'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED';

export type RecoveryExecution = {
  readonly id: string;
  readonly runtimeExecutionId: string | null;
  readonly sequenceId: string;
  readonly status: RecoveryExecutionStatus;
  readonly currentStep: string | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sessionId: string;
    readonly totalSteps: number;
    readonly completedStepIds: readonly string[];
    readonly failedStepIds: readonly string[];
  };
};

export type RecoveryResult = {
  readonly id: string;
  readonly executionId: string;
  readonly status: 'Succeeded' | 'Failed' | 'Partial';
  readonly completedSteps: readonly string[];
  readonly failedSteps: readonly string[];
  readonly duration: number;
  readonly metadata: {
    readonly notes: string;
    readonly sequenceId: string;
    readonly lastStepId: string | null;
  };
};

export type RuntimeRecoveryExecutionPackage = {
  readonly id: string;
  readonly version: string;
  readonly execution: RecoveryExecution;
  readonly result: RecoveryResult | null;
  readonly sequenceSnapshot: RecoverySequence;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeRecoveryExecutionValidation | null;
};

export type RuntimeRecoveryExecutionValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeRecoveryExecutionValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeRecoveryExecutionValidationIssue[];
  readonly validatedAt: string;
};

export type ExecuteRecoveryInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly sequence: RecoverySequence;
  readonly failOnStepId?: string | null;
};

export type RuntimeRecoveryExecutionIndexEntry = {
  readonly packageId: string;
  readonly executionId: string;
  readonly sequenceId: string;
  readonly status: RecoveryExecutionStatus;
};

export type RuntimeRecoveryExecutionEventType =
  | 'RecoveryExecutionStarted'
  | 'RecoveryExecutionPaused'
  | 'RecoveryExecutionCompleted'
  | 'RecoveryExecutionFailed'
  | 'RecoveryExecutionPublished';

export type RuntimeRecoveryExecutionEvent = {
  readonly eventId: string;
  readonly type: RuntimeRecoveryExecutionEventType;
  readonly packageId: string;
  readonly executionId: string | null;
  readonly at: string;
  readonly message: string;
};
