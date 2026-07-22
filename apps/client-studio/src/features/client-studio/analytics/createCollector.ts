import type { DecisionEvent, DispatchResult } from '@embed-engine/runtime';

import type {
  AnalyticsExportAdapter,
} from './exportAdapter';
import { deriveSessionMetrics } from './exportAdapter';
import type {
  AnalyticsEvent,
  AnalyticsTimestamp,
  JourneySurfaceId,
  SessionMetricsSnapshot,
} from './types';

export type DecisionAnalyticsCollector = {
  readonly sessionId: string;
  readonly getEvents: () => readonly AnalyticsEvent[];
  readonly getMetrics: () => SessionMetricsSnapshot;
  readonly startJourney: (at?: AnalyticsTimestamp) => void;
  readonly completeJourney: (at?: AnalyticsTimestamp) => void;
  readonly enterSurface: (surfaceId: JourneySurfaceId, at?: AnalyticsTimestamp) => void;
  readonly exitSurface: (surfaceId: JourneySurfaceId, at?: AnalyticsTimestamp) => void;
  readonly observeDispatch: (result: DispatchResult, at?: AnalyticsTimestamp) => void;
  readonly terminalViewed: (input: {
    readonly terminalId: string;
    readonly recommendationKey: string;
    readonly at?: AnalyticsTimestamp;
  }) => void;
  readonly aiSessionOpened: (aiContextId: string, at?: AnalyticsTimestamp) => void;
  readonly aiInteraction: (input: {
    readonly questionCategory: string;
    readonly responseGenerated: boolean;
    readonly clarificationRequested: boolean;
    readonly conversationLength: number;
    readonly at?: AnalyticsTimestamp;
  }) => void;
  readonly conversionStarted: (ctaId: string, at?: AnalyticsTimestamp) => void;
  readonly conversionCompleted: (ctaId: string, at?: AnalyticsTimestamp) => void;
  readonly flush: () => void;
};

export type CreateCollectorInput = {
  readonly sessionId: string;
  readonly adapter: AnalyticsExportAdapter;
  readonly now?: () => number;
};

/**
 * Passive in-memory collector. Emits to export adapter; never mutates Runtime.
 */
export function createDecisionAnalyticsCollector(
  input: CreateCollectorInput,
): DecisionAnalyticsCollector {
  const { sessionId, adapter } = input;
  const now = input.now ?? (() => Date.now());
  const events: AnalyticsEvent[] = [];
  const surfaceEnteredAt = new Map<JourneySurfaceId, number>();
  let journeyStarted = false;
  let terminalViewedOnce = false;

  const emit = (event: AnalyticsEvent): void => {
    events.push(event);
    try {
      adapter.exportEvent(event);
    } catch {
      // never break the experience
    }
  };

  return {
    sessionId,
    getEvents: () => events.slice(),
    getMetrics: () => deriveSessionMetrics(sessionId, events),
    startJourney(at = now()) {
      if (journeyStarted) {
        return;
      }
      journeyStarted = true;
      emit({ type: 'journey.started', at, sessionId });
    },
    completeJourney(at = now()) {
      emit({ type: 'journey.completed', at, sessionId });
    },
    enterSurface(surfaceId, at = now()) {
      if (!surfaceEnteredAt.has(surfaceId)) {
        surfaceEnteredAt.set(surfaceId, at);
        emit({ type: 'surface.entered', at, sessionId, surfaceId });
      }
    },
    exitSurface(surfaceId, at = now()) {
      const entered = surfaceEnteredAt.get(surfaceId);
      if (entered === undefined) {
        return;
      }
      surfaceEnteredAt.delete(surfaceId);
      emit({
        type: 'surface.exited',
        at,
        sessionId,
        surfaceId,
        dwellMs: Math.max(0, at - entered),
      });
    },
    observeDispatch(result, at = now()) {
      if (!result.ok) {
        return;
      }
      emit({
        type: 'runtime.signal',
        at,
        sessionId,
        runtimeEventType: result.event.type,
        payload: payloadFromDecisionEvent(result.event),
      });

      const terminal = result.experience.context.decision.terminal;
      if (!terminalViewedOnce) {
        terminalViewedOnce = true;
        emit({
          type: 'terminal.viewed',
          at,
          sessionId,
          terminalId: terminal.id,
          recommendationKey: terminal.outcome.recommendation,
        });
      }
    },
    terminalViewed(input) {
      emit({
        type: 'terminal.viewed',
        at: input.at ?? now(),
        sessionId,
        terminalId: input.terminalId,
        recommendationKey: input.recommendationKey,
      });
    },
    aiSessionOpened(aiContextId, at = now()) {
      emit({ type: 'ai.session.opened', at, sessionId, aiContextId });
    },
    aiInteraction(input) {
      emit({
        type: 'ai.interaction',
        at: input.at ?? now(),
        sessionId,
        questionCategory: input.questionCategory,
        responseGenerated: input.responseGenerated,
        clarificationRequested: input.clarificationRequested,
        conversationLength: input.conversationLength,
      });
    },
    conversionStarted(ctaId, at = now()) {
      emit({ type: 'conversion.started', at, sessionId, ctaId });
    },
    conversionCompleted(ctaId, at = now()) {
      emit({ type: 'conversion.completed', at, sessionId, ctaId });
      emit({ type: 'journey.completed', at, sessionId });
    },
    flush() {
      adapter.flush?.();
    },
  };
}

function payloadFromDecisionEvent(
  event: DecisionEvent,
): Readonly<Record<string, string | number | boolean | null>> {
  switch (event.type) {
    case 'RoomSelected':
      return Object.freeze({ roomId: event.roomId });
    case 'PriorityChanged':
      return Object.freeze({
        priorityCount: event.priorityIds.length,
        priorityIds: event.priorityIds.join(','),
      });
    case 'VariantSelected':
      return Object.freeze({ variantId: event.variantId });
    case 'ScenarioActivated':
      return Object.freeze({ scenarioId: event.scenarioId });
    case 'QuestionAnswered':
      return Object.freeze({
        questionId: event.questionId,
        answerId: event.answerId,
      });
    default:
      return Object.freeze({});
  }
}

/** Coarse AI question category — never stores free-text content. */
export function categorizeAiQuestion(text: string): string {
  const normalized = text.trim().toLowerCase();
  if (normalized.length === 0) {
    return 'empty';
  }
  if (/proč|why|důvod/.test(normalized)) {
    return 'why-recommendation';
  }
  if (/priorit|ovlivn|driver|vliv/.test(normalized)) {
    return 'drivers';
  }
  if (/pokoj|room|místnost|fokus/.test(normalized)) {
    return 'room-focus';
  }
  if (/story|příběh|shrň|summ/.test(normalized)) {
    return 'story-summary';
  }
  if (/další|next|krok/.test(normalized)) {
    return 'next-step';
  }
  return 'general';
}
