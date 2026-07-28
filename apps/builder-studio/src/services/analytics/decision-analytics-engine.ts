import type {
  AnalyticsEngineEvent,
  AnalyticsEvent,
  AnalyticsMetric,
  AnalyticsSession,
  AnalyticsSnapshot,
  InitializeAnalyticsInput,
  RecordAnalyticsEventInput,
} from '../../model';
import {
  createJsonAnalyticsExporter,
  type AnalyticsExporter,
} from './json-analytics-exporter';

const MAX_HISTORY = 80;

export type DecisionAnalyticsEngine = {
  initialize(input: InitializeAnalyticsInput): AnalyticsSession;
  record(input: RecordAnalyticsEventInput): AnalyticsEvent;
  aggregate(analyticsSessionId: string): readonly AnalyticsMetric[];
  createSnapshot(analyticsSessionId: string): AnalyticsSnapshot;
  exportSnapshot(analyticsSessionId: string): AnalyticsSnapshot;
  dispose(analyticsSessionId: string): void;
  load(analyticsSessionId: string): AnalyticsSnapshot | null;
  preview(analyticsSessionId: string): AnalyticsSnapshot | null;
  listEvents(analyticsSessionId?: string): readonly AnalyticsEvent[];
  listMetrics(analyticsSessionId?: string): readonly AnalyticsMetric[];
  getEvents(analyticsSessionId?: string): readonly AnalyticsEngineEvent[];
  getHistory(analyticsSessionId?: string): readonly AnalyticsEngineEvent[];
  list(): readonly AnalyticsSnapshot[];
};

type SessionStore = {
  session: AnalyticsSession;
  events: AnalyticsEvent[];
  metrics: AnalyticsMetric[];
  snapshot: AnalyticsSnapshot | null;
};

function buildMetrics(
  events: readonly AnalyticsEvent[],
  createId: (prefix: string) => string,
): AnalyticsMetric[] {
  const moveEntered = events.filter((item) => item.type === 'MoveEntered');
  const moveExited = events.filter((item) => item.type === 'MoveExited');
  const completed = events.some((item) => item.type === 'SessionCompleted');
  const pauseCount = events.filter((item) => item.type === 'Timeout').length;
  const durations = events
    .map((item) => item.payload.durationMs)
    .filter((value): value is number => value !== null && value >= 0);
  const averageMoveDuration =
    durations.length === 0
      ? 0
      : Math.round(
          (durations.reduce((sum, value) => sum + value, 0) / durations.length) *
            100,
        ) / 100;
  const skippedMoves = Math.max(0, moveEntered.length - moveExited.length);
  const completionRate = completed ? 1 : moveEntered.length > 0 ? 0.5 : 0;

  return [
    {
      id: createId('metric'),
      name: 'completionRate',
      value: completionRate,
      unit: 'ratio',
      metadata: { derivedFrom: 'SessionCompleted / MoveEntered' },
    },
    {
      id: createId('metric'),
      name: 'moveCount',
      value: moveEntered.length,
      unit: 'count',
      metadata: { derivedFrom: 'MoveEntered events' },
    },
    {
      id: createId('metric'),
      name: 'averageMoveDuration',
      value: averageMoveDuration,
      unit: 'ms',
      metadata: { derivedFrom: 'event.payload.durationMs' },
    },
    {
      id: createId('metric'),
      name: 'pauseCount',
      value: pauseCount,
      unit: 'count',
      metadata: { derivedFrom: 'Timeout events' },
    },
    {
      id: createId('metric'),
      name: 'skippedMoves',
      value: skippedMoves,
      unit: 'count',
      metadata: { derivedFrom: 'MoveEntered - MoveExited' },
    },
  ];
}

/**
 * DecisionAnalyticsEngine (EPIC-BLD-21).
 * Records facts only — never mutates Story, Runtime Session, Behavior, or Learning.
 */
export function createDecisionAnalyticsEngine(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly exporter?: AnalyticsExporter;
}): DecisionAnalyticsEngine {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const exporter = options?.exporter ?? createJsonAnalyticsExporter();
  const stores = new Map<string, SessionStore>();
  const engineEvents: AnalyticsEngineEvent[] = [];

  const pushEvent = (
    type: AnalyticsEngineEvent['type'],
    sessionId: string,
    snapshotId: string | null,
    message: string,
  ): void => {
    engineEvents.unshift({
      eventId: createId('analytics-engine-event'),
      type,
      sessionId,
      snapshotId,
      at: now().toISOString(),
      message,
    });
    if (engineEvents.length > MAX_HISTORY) {
      engineEvents.length = MAX_HISTORY;
    }
  };

  const requireStore = (analyticsSessionId: string): SessionStore => {
    const store = stores.get(analyticsSessionId);
    if (store === undefined) {
      throw new Error(`AnalyticsSession not found: ${analyticsSessionId}`);
    }
    return store;
  };

  return {
    initialize(input) {
      const stamp = now().toISOString();
      const id = `analytics-session-${input.runtimeSessionId}`;
      const existing = stores.get(id);
      if (existing !== undefined) {
        return existing.session;
      }

      const session: AnalyticsSession = {
        id,
        runtimeSessionId: input.runtimeSessionId,
        storyId: input.storyId,
        startedAt: stamp,
        completedAt: null,
        metadata: {
          title: input.title?.trim() || 'Analytics Session',
          notes:
            'Structured recording only — no optimization, Learning, or AI.',
          runtimeId: input.runtimeId,
          behaviorId: input.behaviorId ?? null,
        },
      };
      stores.set(id, {
        session,
        events: [],
        metrics: [],
        snapshot: null,
      });
      return session;
    },

    record(input) {
      const store = requireStore(input.analyticsSessionId);
      const stamp = input.timestamp ?? now().toISOString();
      const event: AnalyticsEvent = {
        id: createId('a-event'),
        type: input.type,
        timestamp: stamp,
        source: input.source,
        payload: {
          moveId: input.moveId ?? null,
          note: input.note ?? input.type,
          durationMs: input.durationMs ?? null,
        },
        metadata: { analyticsSessionId: input.analyticsSessionId },
      };
      store.events.push(event);

      if (input.type === 'SessionCompleted') {
        store.session = {
          ...store.session,
          completedAt: stamp,
        };
      }

      pushEvent(
        'AnalyticsCollected',
        input.analyticsSessionId,
        store.snapshot?.id ?? null,
        `Recorded ${event.type}`,
      );
      return event;
    },

    aggregate(analyticsSessionId) {
      const store = requireStore(analyticsSessionId);
      const metrics = buildMetrics(store.events, createId);
      store.metrics = [...metrics];
      for (const metric of metrics) {
        pushEvent(
          'MetricCalculated',
          analyticsSessionId,
          store.snapshot?.id ?? null,
          `Metric ${metric.name}=${metric.value}`,
        );
      }
      return metrics;
    },

    createSnapshot(analyticsSessionId) {
      const store = requireStore(analyticsSessionId);
      const metrics =
        store.metrics.length > 0
          ? store.metrics
          : buildMetrics(store.events, createId);
      store.metrics = [...metrics];
      const stamp = now().toISOString();
      const snapshot: AnalyticsSnapshot = {
        id: `analytics-snapshot-${analyticsSessionId}`,
        session: store.session,
        events: [...store.events],
        metrics,
        summary: {
          eventCount: store.events.length,
          metricCount: metrics.length,
          completed: store.session.completedAt !== null,
          moveCount: store.events.filter((item) => item.type === 'MoveEntered')
            .length,
        },
        metadata: {
          title: store.session.metadata.title,
          description:
            'Complete Runtime Session analytics pass — records only.',
        },
        timestamps: { createdAt: stamp, updatedAt: stamp },
        exportPayload: null,
      };
      store.snapshot = snapshot;
      pushEvent(
        'SnapshotCreated',
        analyticsSessionId,
        snapshot.id,
        `Snapshot ${snapshot.id} created`,
      );
      return snapshot;
    },

    exportSnapshot(analyticsSessionId) {
      const store = requireStore(analyticsSessionId);
      const current = store.snapshot ?? this.createSnapshot(analyticsSessionId);
      const payload = exporter.export(current);
      const stamp = now().toISOString();
      const next: AnalyticsSnapshot = {
        ...current,
        exportPayload: payload,
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt: stamp,
        },
      };
      store.snapshot = next;
      pushEvent(
        'AnalyticsExported',
        analyticsSessionId,
        next.id,
        `Exported via ${exporter.id}`,
      );
      return next;
    },

    dispose(analyticsSessionId) {
      stores.delete(analyticsSessionId);
    },

    load(analyticsSessionId) {
      return stores.get(analyticsSessionId)?.snapshot ?? null;
    },

    preview(analyticsSessionId) {
      return stores.get(analyticsSessionId)?.snapshot ?? null;
    },

    listEvents(analyticsSessionId) {
      if (analyticsSessionId === undefined) {
        return Array.from(stores.values()).flatMap((store) => store.events);
      }
      return stores.get(analyticsSessionId)?.events ?? [];
    },

    listMetrics(analyticsSessionId) {
      if (analyticsSessionId === undefined) {
        return Array.from(stores.values()).flatMap((store) => store.metrics);
      }
      return stores.get(analyticsSessionId)?.metrics ?? [];
    },

    getEvents(analyticsSessionId) {
      if (analyticsSessionId === undefined) {
        return [...engineEvents];
      }
      return engineEvents.filter((item) => item.sessionId === analyticsSessionId);
    },

    getHistory(analyticsSessionId) {
      return this.getEvents(analyticsSessionId);
    },

    list() {
      return Array.from(stores.values())
        .map((store) => store.snapshot)
        .filter((item): item is AnalyticsSnapshot => item !== null);
    },
  };
}
