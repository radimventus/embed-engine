/**
 * Runtime Observability Engine (EPIC-BLD-36).
 * Read-only diagnostics of Experience Runtime — never mutates Runtime / State / Knowledge.
 */

export type RuntimeHealthStatus = 'Healthy' | 'Degraded' | 'Unknown';

export type RuntimeObservation = {
  readonly id: string;
  readonly sessionId: string;
  readonly executionId: string | null;
  readonly moduleId: string | null;
  readonly event: string;
  readonly timestamp: string;
  readonly metadata: {
    readonly source: string;
    readonly notes: string;
  };
};

export type RuntimeTimeline = {
  readonly id: string;
  readonly sessionId: string;
  readonly events: readonly RuntimeObservation[];
  readonly startedAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
  };
};

export type RuntimeMetrics = {
  readonly observationCount: number;
  readonly sessionCount: number;
  readonly executionCount: number;
  readonly moduleEventCount: number;
  readonly stateEventCount: number;
  readonly health: RuntimeHealthStatus;
  readonly healthScore: number;
};

export type RuntimeObservabilityPackage = {
  readonly id: string;
  readonly version: string;
  readonly timeline: RuntimeTimeline;
  readonly metrics: RuntimeMetrics;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeObservabilityValidation | null;
};

export type RuntimeObservabilityValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeObservabilityValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeObservabilityValidationIssue[];
  readonly validatedAt: string;
};

export type RuntimeEventSource = {
  readonly sessionId: string;
  readonly executionId?: string | null;
  readonly moduleId?: string | null;
  readonly event: string;
  readonly timestamp: string;
  readonly source: string;
};

export type CollectRuntimeInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly sources: readonly RuntimeEventSource[];
};

export type RuntimeObservabilityIndexEntry = {
  readonly packageId: string;
  readonly timelineId: string;
  readonly sessionId: string;
  readonly observationCount: number;
  readonly health: RuntimeHealthStatus;
};

export type RuntimeObservabilityEventType =
  | 'RuntimeObserved'
  | 'TimelineUpdated'
  | 'MetricsCalculated'
  | 'ObservabilityPublished'
  | 'ObservabilityValidated';

export type RuntimeObservabilityEvent = {
  readonly eventId: string;
  readonly type: RuntimeObservabilityEventType;
  readonly packageId: string;
  readonly timelineId: string | null;
  readonly at: string;
  readonly message: string;
};
