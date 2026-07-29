/**
 * Publication Execution Coordinator (EPIC-BLD-64).
 * Deterministic step orchestration for publication plans.
 */

export type PublicationExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED';

export type PublicationExecutionSession = {
  readonly id: string;
  readonly planId: string;
  readonly status: PublicationExecutionStatus;
  readonly currentStep: number;
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly rootArtifactId: string;
    readonly totalSteps: number;
    readonly completedSteps: number;
  };
};

export type PublicationExecutionValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type PublicationExecutionValidation = {
  readonly valid: boolean;
  readonly issues: readonly PublicationExecutionValidationIssue[];
  readonly validatedAt: string;
};

export type PublicationExecutionPackage = {
  readonly id: string;
  readonly version: string;
  readonly session: PublicationExecutionSession;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Completed' | 'Disposed';
  };
  readonly validation: PublicationExecutionValidation | null;
};

export type StartPublicationExecutionInput = {
  readonly planId: string;
  readonly rootArtifactId: string;
  readonly totalSteps: number;
  readonly title?: string;
  readonly notes?: string;
};

export type InitializePublicationExecutionInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly execution?: StartPublicationExecutionInput;
};

export type PublicationExecutionIndexEntry = {
  readonly packageId: string;
  readonly executionSessionId: string;
  readonly planId: string;
  readonly status: PublicationExecutionStatus;
  readonly currentStep: number;
  readonly progress: string;
};

export type PublicationExecutionEventType =
  | 'PublicationExecutionStarted'
  | 'PublicationExecutionStepCompleted'
  | 'PublicationExecutionCompleted'
  | 'PublicationExecutionFailed';

export type PublicationExecutionEvent = {
  readonly eventId: string;
  readonly type: PublicationExecutionEventType;
  readonly packageId: string;
  readonly executionSessionId: string | null;
  readonly planId: string | null;
  readonly at: string;
  readonly message: string;
};
