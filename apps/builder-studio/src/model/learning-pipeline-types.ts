/**
 * Learning Pipeline Foundation (EPIC-BLD-22).
 * Transforms Analytics Snapshot into LearningRecord — no AI, heuristics, or Runtime mutation.
 */

export type LearningPipelineTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type LearningRecordEvent = {
  readonly type: string;
  readonly timestamp: string;
  readonly source: string;
  readonly note: string;
  readonly moveRef: string | null;
  readonly durationMs: number | null;
};

export type LearningRecordMetric = {
  readonly name: string;
  readonly value: number;
  readonly unit: string;
};

export type LearningRecord = {
  readonly id: string;
  readonly sourceSnapshotId: string;
  readonly sessionId: string;
  readonly timestamp: string;
  readonly events: readonly LearningRecordEvent[];
  readonly metrics: readonly LearningRecordMetric[];
  readonly metadata: {
    readonly title: string;
    readonly anonymized: boolean;
    readonly storyRef: string | null;
  };
};

export type LearningValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type LearningValidationResult = {
  readonly valid: boolean;
  readonly errors: readonly LearningValidationIssue[];
  readonly warnings: readonly LearningValidationIssue[];
  readonly metadata: {
    readonly validatedAt: string;
    readonly sourceSnapshotId: string;
  };
};

export type LearningImportReport = {
  readonly processed: number;
  readonly accepted: number;
  readonly rejected: number;
  readonly warnings: number;
  readonly metadata: {
    readonly title: string;
    readonly pipelineId: string;
    readonly notes: string;
  };
};

export type LearningPipelineEventType =
  | 'LearningImported'
  | 'LearningValidated'
  | 'LearningAnonymized'
  | 'LearningRecordCreated';

export type LearningPipelineEvent = {
  readonly eventId: string;
  readonly type: LearningPipelineEventType;
  readonly pipelineId: string;
  readonly recordId: string | null;
  readonly snapshotId: string | null;
  readonly at: string;
  readonly message: string;
};

export type IngestAnalyticsInput = {
  readonly snapshotId: string;
  readonly sessionId: string;
  readonly storyId: string;
  readonly title?: string;
  readonly events: readonly {
    readonly type: string;
    readonly timestamp: string;
    readonly source: string;
    readonly note: string;
    readonly moveId: string | null;
    readonly durationMs: number | null;
    readonly analyticsSessionId: string;
  }[];
  readonly metrics: readonly {
    readonly name: string;
    readonly value: number;
    readonly unit: string;
  }[];
  readonly completed: boolean;
};
