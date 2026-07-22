import type { AnalyticsEvent, SessionMetricsSnapshot } from './types';

/**
 * Export boundary for Decision Analytics (CSCB-08).
 * Transport only — GA4 / PostHog / Mixpanel / internal API plug in here.
 */
export type AnalyticsExportAdapter = {
  readonly name: string;
  /** Receive a single observational event. Must not call Runtime. */
  readonly exportEvent: (event: AnalyticsEvent) => void;
  /** Optional batch flush for warehouses / buffers. */
  readonly flush?: () => void;
};

/** In-memory sink — primary for tests and local inspection. */
export function createMemoryExportAdapter(): AnalyticsExportAdapter & {
  readonly events: readonly AnalyticsEvent[];
  clear(): void;
} {
  const buffer: AnalyticsEvent[] = [];
  return {
    name: 'memory',
    events: buffer,
    exportEvent(event) {
      buffer.push(event);
    },
    clear() {
      buffer.length = 0;
    },
    flush() {
      // no-op
    },
  };
}

/** Dev console sink — never throws into the experience. */
export function createConsoleExportAdapter(
  label = '[decision-analytics]',
): AnalyticsExportAdapter {
  return {
    name: 'console',
    exportEvent(event) {
      try {
        // eslint-disable-next-line no-console
        console.info(label, event.type, event);
      } catch {
        // ignore
      }
    },
  };
}

/** Fan-out to multiple destinations without coupling them. */
export function createCompositeExportAdapter(
  adapters: readonly AnalyticsExportAdapter[],
): AnalyticsExportAdapter {
  return {
    name: 'composite',
    exportEvent(event) {
      for (const adapter of adapters) {
        try {
          adapter.exportEvent(event);
        } catch {
          // Observational — never break the journey
        }
      }
    },
    flush() {
      for (const adapter of adapters) {
        try {
          adapter.flush?.();
        } catch {
          // ignore
        }
      }
    },
  };
}

export function deriveSessionMetrics(
  sessionId: string,
  events: readonly AnalyticsEvent[],
): SessionMetricsSnapshot {
  let startedAt: number | null = null;
  let endedAt: number | null = null;
  let decisionSessionId = '';
  const surfaceEnterCounts: Record<string, number> = {};
  const surfaceDwellMs: Record<string, number> = {};
  const runtimeSignalCounts: Record<string, number> = {};
  let terminalViewCount = 0;
  let storyViewCount = 0;
  let aiSessionOpenCount = 0;
  let aiInteractionCount = 0;
  let conversionStartedCount = 0;
  let conversionCompletedCount = 0;
  let journeyCompleted = false;
  let journeyAbandoned = false;

  for (const event of events) {
    if (event.sessionId !== sessionId) {
      continue;
    }
    decisionSessionId = event.decisionSessionId;
    endedAt = event.at;
    switch (event.type) {
      case 'journey.started':
        startedAt = event.at;
        break;
      case 'journey.completed':
        journeyCompleted = true;
        break;
      case 'journey.abandoned':
        journeyAbandoned = true;
        break;
      case 'surface.entered':
        surfaceEnterCounts[event.surfaceId] =
          (surfaceEnterCounts[event.surfaceId] ?? 0) + 1;
        break;
      case 'surface.exited':
        surfaceDwellMs[event.surfaceId] =
          (surfaceDwellMs[event.surfaceId] ?? 0) + event.dwellMs;
        break;
      case 'runtime.signal':
        runtimeSignalCounts[event.runtimeEventType] =
          (runtimeSignalCounts[event.runtimeEventType] ?? 0) + 1;
        break;
      case 'terminal.viewed':
        terminalViewCount += 1;
        break;
      case 'story.viewed':
        storyViewCount += 1;
        break;
      case 'ai.session.opened':
        aiSessionOpenCount += 1;
        break;
      case 'ai.interaction':
        aiInteractionCount += 1;
        break;
      case 'conversion.started':
        conversionStartedCount += 1;
        break;
      case 'conversion.completed':
        conversionCompletedCount += 1;
        break;
      default:
        break;
    }
  }

  return Object.freeze({
    sessionId,
    decisionSessionId,
    startedAt,
    endedAt,
    durationMs:
      startedAt !== null && endedAt !== null ? Math.max(0, endedAt - startedAt) : null,
    surfaceEnterCounts: Object.freeze({ ...surfaceEnterCounts }),
    surfaceDwellMs: Object.freeze({ ...surfaceDwellMs }),
    runtimeSignalCounts: Object.freeze({ ...runtimeSignalCounts }),
    terminalViewCount,
    storyViewCount,
    aiSessionOpenCount,
    aiInteractionCount,
    conversionStartedCount,
    conversionCompletedCount,
    journeyCompleted,
    journeyAbandoned,
    eventCount: events.filter((event) => event.sessionId === sessionId).length,
  });
}
