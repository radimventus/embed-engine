/**
 * Runtime Session Engine (EPIC-BLD-19).
 * Executes Decision Story for one visitor session — no Story rewrite, rules, or AI.
 */

export type SessionTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SessionState =
  | 'Created'
  | 'Running'
  | 'Paused'
  | 'Completed'
  | 'Disposed';

export type SessionHistoryAction =
  | 'created'
  | 'started'
  | 'entered'
  | 'completed-move'
  | 'navigated-next'
  | 'navigated-previous'
  | 'jumped'
  | 'completed'
  | 'disposed';

export type SessionHistoryEntry = {
  readonly moveId: string | null;
  readonly timestamp: string;
  readonly action: SessionHistoryAction;
  readonly metadata: {
    readonly note: string;
  };
};

export type SessionMetadata = {
  readonly title: string;
  readonly description: string;
};

export type RuntimeSession = {
  readonly id: string;
  readonly runtimeId: string;
  readonly storyId: string;
  readonly status: SessionState;
  readonly currentMoveId: string | null;
  readonly moveIds: readonly string[];
  readonly history: readonly SessionHistoryEntry[];
  readonly metadata: SessionMetadata;
  readonly timestamps: SessionTimestamps;
  readonly validation: SessionValidation | null;
};

export type SessionValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type SessionValidation = {
  readonly valid: boolean;
  readonly issues: readonly SessionValidationIssue[];
  readonly validatedAt: string;
};

export type CreateSessionInput = {
  readonly runtimeId: string;
  readonly storyId: string;
  readonly title?: string;
  readonly moveIds: readonly string[];
};

export type SessionEventType =
  | 'SessionCreated'
  | 'SessionStarted'
  | 'MoveEntered'
  | 'MoveCompleted'
  | 'SessionCompleted'
  | 'SessionDisposed';

export type SessionEvent = {
  readonly eventId: string;
  readonly type: SessionEventType;
  readonly sessionId: string;
  readonly storyId: string;
  readonly moveId: string | null;
  readonly at: string;
  readonly message: string;
};
