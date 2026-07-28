/**
 * Decision Orchestrator (EPIC-BLD-31).
 * Coordinates Runtime Session, Personalization, Behavior, Story and Experience —
 * does not create Knowledge, AI Context or Personalization.
 */

export type DecisionExecutionState =
  | 'Initialized'
  | 'Running'
  | 'Completed'
  | 'Disposed';

export type DecisionStageType =
  | 'Boot'
  | 'Active'
  | 'Transition'
  | 'Complete';

export type DecisionStageStatus = 'Pending' | 'Active' | 'Done';

export type DecisionStage = {
  readonly id: string;
  readonly type: DecisionStageType;
  readonly status: DecisionStageStatus;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly metadata: {
    readonly notes: string;
    readonly moveId: string | null;
  };
};

export type DecisionExecution = {
  readonly id: string;
  readonly sessionId: string;
  readonly storyId: string;
  readonly currentMove: string | null;
  readonly state: DecisionExecutionState;
  readonly stages: readonly DecisionStage[];
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly metadata: {
    readonly title: string;
    readonly personalizationPackageId: string | null;
    readonly behaviorEvaluationId: string | null;
    readonly experienceId: string | null;
    readonly strategyId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Validated' | 'Published' | 'Disposed';
  };
};

export type DecisionExecutionPackage = {
  readonly id: string;
  readonly version: string;
  readonly execution: DecisionExecution;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly storyId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: DecisionExecutionValidation | null;
};

export type DecisionExecutionValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type DecisionExecutionValidation = {
  readonly valid: boolean;
  readonly issues: readonly DecisionExecutionValidationIssue[];
  readonly validatedAt: string;
};

export type StartExecutionInput = {
  readonly sessionId: string;
  readonly storyId: string;
  readonly moveIds: readonly string[];
  readonly title?: string;
  readonly personalizationPackageId?: string | null;
  readonly behaviorEvaluationId?: string | null;
  readonly experienceId?: string | null;
};

export type DecisionExecutionIndexEntry = {
  readonly packageId: string;
  readonly executionId: string;
  readonly sessionId: string;
  readonly storyId: string;
  readonly state: DecisionExecutionState;
  readonly currentMove: string | null;
};

export type DecisionOrchestratorEventType =
  | 'DecisionExecutionStarted'
  | 'DecisionStageChanged'
  | 'DecisionExecutionCompleted'
  | 'DecisionExecutionValidated';

export type DecisionOrchestratorEvent = {
  readonly eventId: string;
  readonly type: DecisionOrchestratorEventType;
  readonly packageId: string;
  readonly executionId: string | null;
  readonly stageId: string | null;
  readonly at: string;
  readonly message: string;
};
