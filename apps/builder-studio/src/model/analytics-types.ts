/**
 * Decision Analytics Engine (EPIC-BLD-21).
 * Records structured analytics only — no optimization, Learning, or AI.
 */

export type AnalyticsTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AnalyticsSession = {
  readonly id: string;
  readonly runtimeSessionId: string;
  readonly storyId: string;
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly runtimeId: string;
    readonly behaviorId: string | null;
  };
};

export type AnalyticsEventType =
  | 'SessionStarted'
  | 'SessionCompleted'
  | 'MoveEntered'
  | 'MoveExited'
  | 'BehaviorEvaluated'
  | 'BehaviorActionProposed'
  | 'ValidationFailed'
  | 'Timeout';

export type AnalyticsEvent = {
  readonly id: string;
  readonly type: AnalyticsEventType;
  readonly timestamp: string;
  readonly source: string;
  readonly payload: {
    readonly moveId: string | null;
    readonly note: string;
    readonly durationMs: number | null;
  };
  readonly metadata: {
    readonly analyticsSessionId: string;
  };
};

export type AnalyticsMetricName =
  | 'completionRate'
  | 'moveCount'
  | 'averageMoveDuration'
  | 'pauseCount'
  | 'skippedMoves';

export type AnalyticsMetric = {
  readonly id: string;
  readonly name: AnalyticsMetricName;
  readonly value: number;
  readonly unit: string;
  readonly metadata: {
    readonly derivedFrom: string;
  };
};

export type AnalyticsSummary = {
  readonly eventCount: number;
  readonly metricCount: number;
  readonly completed: boolean;
  readonly moveCount: number;
};

export type AnalyticsSnapshot = {
  readonly id: string;
  readonly session: AnalyticsSession;
  readonly events: readonly AnalyticsEvent[];
  readonly metrics: readonly AnalyticsMetric[];
  readonly summary: AnalyticsSummary;
  readonly metadata: {
    readonly title: string;
    readonly description: string;
  };
  readonly timestamps: AnalyticsTimestamps;
  readonly exportPayload: string | null;
};

export type InitializeAnalyticsInput = {
  readonly runtimeSessionId: string;
  readonly storyId: string;
  readonly runtimeId: string;
  readonly behaviorId?: string | null;
  readonly title?: string;
};

export type RecordAnalyticsEventInput = {
  readonly analyticsSessionId: string;
  readonly type: AnalyticsEventType;
  readonly source: string;
  readonly moveId?: string | null;
  readonly note?: string;
  readonly durationMs?: number | null;
  readonly timestamp?: string;
};

export type AnalyticsEngineEventType =
  | 'AnalyticsCollected'
  | 'MetricCalculated'
  | 'SnapshotCreated'
  | 'AnalyticsExported';

export type AnalyticsEngineEvent = {
  readonly eventId: string;
  readonly type: AnalyticsEngineEventType;
  readonly sessionId: string;
  readonly snapshotId: string | null;
  readonly at: string;
  readonly message: string;
};
