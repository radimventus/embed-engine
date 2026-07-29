/**
 * Experience State Manager (EPIC-BLD-34).
 * SSOT for Experience runtime state — no Knowledge / Story / AI / module logic.
 */

export type ExperienceStateStatus =
  | 'Initialized'
  | 'Active'
  | 'Restored'
  | 'Completed'
  | 'Disposed';

export type ExperienceStateSnapshot = {
  readonly sessionId: string;
  readonly executionId: string | null;
  readonly activeModule: string | null;
  readonly activeMove: string | null;
  readonly status: ExperienceStateStatus;
  readonly notes: string;
};

export type ExperienceState = {
  readonly id: string;
  readonly sessionId: string;
  readonly executionId: string | null;
  readonly activeModule: string | null;
  readonly activeMove: string | null;
  readonly status: ExperienceStateStatus;
  readonly checkpointId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly restoreStatus: 'None' | 'Restored' | 'Failed';
    readonly lastCheckpointReason: string | null;
  };
};

export type ExperienceCheckpoint = {
  readonly id: string;
  readonly stateId: string;
  readonly timestamp: string;
  readonly snapshot: ExperienceStateSnapshot;
  readonly reason: string;
  readonly metadata: {
    readonly notes: string;
    readonly sequence: number;
  };
};

export type ExperienceStatePackage = {
  readonly id: string;
  readonly version: string;
  readonly state: ExperienceState;
  readonly checkpoints: readonly ExperienceCheckpoint[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: ExperienceStateValidation | null;
};

export type ExperienceStateValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type ExperienceStateValidation = {
  readonly valid: boolean;
  readonly issues: readonly ExperienceStateValidationIssue[];
  readonly validatedAt: string;
};

export type CreateExperienceStateInput = {
  readonly sessionId: string;
  readonly executionId?: string | null;
  readonly activeModule?: string | null;
  readonly activeMove?: string | null;
  readonly title?: string;
};

export type UpdateExperienceStateInput = {
  readonly executionId?: string | null;
  readonly activeModule?: string | null;
  readonly activeMove?: string | null;
  readonly notes?: string;
};

export type ExperienceStateIndexEntry = {
  readonly packageId: string;
  readonly stateId: string;
  readonly sessionId: string;
  readonly status: ExperienceStateStatus;
  readonly checkpointId: string | null;
};

export type ExperienceStateEventType =
  | 'ExperienceStateCreated'
  | 'ExperienceStateUpdated'
  | 'CheckpointCreated'
  | 'ExperienceStateRestored'
  | 'ExperienceStateValidated';

export type ExperienceStateEvent = {
  readonly eventId: string;
  readonly type: ExperienceStateEventType;
  readonly packageId: string;
  readonly stateId: string | null;
  readonly checkpointId: string | null;
  readonly at: string;
  readonly message: string;
};
