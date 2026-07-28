/**
 * Experience Runtime Orchestrator (EPIC-BLD-32).
 * Coordinates Session, Personalized Context, Story, Moves, Behavior and Modules —
 * does not create Knowledge, AI Context, Personalization or Story.
 */

export type RuntimeExecutionStatus =
  | 'Initialized'
  | 'Running'
  | 'Completed'
  | 'Disposed';

export type RuntimeStageKind =
  | 'Boot'
  | 'Move'
  | 'Jump'
  | 'Complete';

export type RuntimeTransition = {
  readonly from: string | null;
  readonly to: string | null;
  readonly reason: string;
  readonly timestamp: string;
  readonly metadata: {
    readonly notes: string;
    readonly stage: RuntimeStageKind;
  };
};

export type RuntimeExecution = {
  readonly id: string;
  readonly sessionId: string;
  readonly storyId: string;
  readonly currentStage: RuntimeStageKind;
  readonly currentMove: string | null;
  readonly status: RuntimeExecutionStatus;
  readonly transitions: readonly RuntimeTransition[];
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly metadata: {
    readonly title: string;
    readonly personalizedContextPackageId: string | null;
    readonly behaviorEvaluationId: string | null;
    readonly moduleIds: readonly string[];
    readonly strategyId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Validated' | 'Published' | 'Disposed';
  };
};

export type RuntimeExecutionPackage = {
  readonly id: string;
  readonly version: string;
  readonly execution: RuntimeExecution;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly storyId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: ExperienceRuntimeValidation | null;
};

export type ExperienceRuntimeValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type ExperienceRuntimeValidation = {
  readonly valid: boolean;
  readonly issues: readonly ExperienceRuntimeValidationIssue[];
  readonly validatedAt: string;
};

export type StartRuntimeInput = {
  readonly sessionId: string;
  readonly storyId: string;
  readonly moveIds: readonly string[];
  readonly title?: string;
  readonly personalizedContextPackageId?: string | null;
  readonly behaviorEvaluationId?: string | null;
  readonly moduleIds?: readonly string[];
};

export type ExperienceRuntimeIndexEntry = {
  readonly packageId: string;
  readonly executionId: string;
  readonly sessionId: string;
  readonly storyId: string;
  readonly status: RuntimeExecutionStatus;
  readonly currentMove: string | null;
};

export type ExperienceRuntimeEventType =
  | 'RuntimeStarted'
  | 'RuntimeTransitioned'
  | 'RuntimeCompleted'
  | 'RuntimeValidated';

export type ExperienceRuntimeEvent = {
  readonly eventId: string;
  readonly type: ExperienceRuntimeEventType;
  readonly packageId: string;
  readonly executionId: string | null;
  readonly at: string;
  readonly message: string;
};
