import type { DecisionEvent, DispatchResult } from '@embed-engine/runtime';

import type { AnalyticsExportAdapter } from './exportAdapter';
import { deriveSessionMetrics } from './exportAdapter';
import type {
  ExperienceEventPayload,
  ExperienceEventType,
} from './experienceEvents';
import type {
  AnalyticsEvent,
  AnalyticsEventBase,
  AnalyticsTimestamp,
  JourneySurfaceId,
  RuntimeContextRef,
  SessionMetricsSnapshot,
} from './types';

export type DecisionAnalyticsCollector = {
  readonly sessionId: string;
  readonly getDecisionSessionId: () => string;
  readonly getEvents: () => readonly AnalyticsEvent[];
  readonly getMetrics: () => SessionMetricsSnapshot;
  readonly bindDecisionSession: (input: {
    readonly decisionSessionId: string;
    readonly runtimeContextRef?: RuntimeContextRef | null;
  }) => void;
  readonly subscribe: (listener: () => void) => () => void;
  readonly setActiveSurface: (surfaceId: JourneySurfaceId | null) => void;
  readonly startJourney: (at?: AnalyticsTimestamp) => void;
  readonly resumeJourney: (at?: AnalyticsTimestamp) => void;
  readonly completeJourney: (at?: AnalyticsTimestamp) => void;
  readonly abandonJourney: (at?: AnalyticsTimestamp) => void;
  readonly enterSurface: (surfaceId: JourneySurfaceId, at?: AnalyticsTimestamp) => void;
  readonly exitSurface: (surfaceId: JourneySurfaceId, at?: AnalyticsTimestamp) => void;
  readonly observeDispatch: (result: DispatchResult, at?: AnalyticsTimestamp) => void;
  readonly terminalViewed: (input: {
    readonly terminalId: string;
    readonly recommendationKey: string;
    readonly at?: AnalyticsTimestamp;
  }) => void;
  readonly storyViewed: (storyId: string, at?: AnalyticsTimestamp) => void;
  readonly aiSessionOpened: (aiContextId: string, at?: AnalyticsTimestamp) => void;
  readonly aiInteraction: (input: {
    readonly questionCategory: string;
    readonly responseGenerated: boolean;
    readonly clarificationRequested: boolean;
    readonly conversationLength: number;
    readonly at?: AnalyticsTimestamp;
  }) => void;
  readonly aiSessionEnded: (conversationLength: number, at?: AnalyticsTimestamp) => void;
  readonly experienceEvent: (input: {
    readonly experienceEventType: ExperienceEventType;
    readonly payload?: ExperienceEventPayload;
    readonly surfaceId?: JourneySurfaceId | null;
    readonly at?: AnalyticsTimestamp;
  }) => void;
  readonly conversionStarted: (ctaId: string, at?: AnalyticsTimestamp) => void;
  readonly conversionFormOpened: (ctaId: string, at?: AnalyticsTimestamp) => void;
  readonly conversionConsentAccepted: (ctaId: string, at?: AnalyticsTimestamp) => void;
  readonly conversionCompleted: (ctaId: string, at?: AnalyticsTimestamp) => void;
  readonly conversionCancelled: (ctaId: string, at?: AnalyticsTimestamp) => void;
  readonly flush: () => void;
};

export type CreateCollectorInput = {
  readonly sessionId: string;
  readonly decisionSessionId?: string;
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
  const listeners = new Set<() => void>();
  let decisionSessionId = input.decisionSessionId ?? 'decision-session:pending';
  let runtimeContextRef: RuntimeContextRef | null = null;
  let activeSurface: JourneySurfaceId | null = null;
  let journeyStarted = false;
  let journeyCompleted = false;
  let terminalViewedOnce = false;
  let storyViewedOnce = false;

  const base = (at: number): AnalyticsEventBase =>
    Object.freeze({
      sessionId,
      decisionSessionId,
      at,
      surfaceId: activeSurface,
      runtimeContextRef,
    });

  const emit = (event: AnalyticsEvent): void => {
    events.push(event);
    for (const listener of listeners) {
      listener();
    }
    try {
      adapter.exportEvent(event);
    } catch {
      // never break the experience
    }
  };

  return {
    sessionId,
    getDecisionSessionId: () => decisionSessionId,
    getEvents: () => events.slice(),
    getMetrics: () => deriveSessionMetrics(sessionId, events),
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    bindDecisionSession(bindInput) {
      decisionSessionId = bindInput.decisionSessionId;
      if (bindInput.runtimeContextRef !== undefined) {
        runtimeContextRef = bindInput.runtimeContextRef;
      }
    },
    setActiveSurface(surfaceId) {
      activeSurface = surfaceId;
    },
    startJourney(at = now()) {
      if (journeyStarted) {
        return;
      }
      journeyStarted = true;
      emit({ ...base(at), type: 'journey.started' });
    },
    resumeJourney(at = now()) {
      if (!journeyStarted || journeyCompleted) {
        return;
      }
      emit({ ...base(at), type: 'journey.resumed' });
    },
    completeJourney(at = now()) {
      journeyCompleted = true;
      emit({ ...base(at), type: 'journey.completed' });
    },
    abandonJourney(at = now()) {
      if (!journeyStarted || journeyCompleted) {
        return;
      }
      emit({ ...base(at), type: 'journey.abandoned' });
    },
    enterSurface(surfaceId, at = now()) {
      if (!surfaceEnteredAt.has(surfaceId)) {
        surfaceEnteredAt.set(surfaceId, at);
        activeSurface = surfaceId;
        emit({ ...base(at), type: 'surface.entered', surfaceId });
      }
    },
    exitSurface(surfaceId, at = now()) {
      const entered = surfaceEnteredAt.get(surfaceId);
      if (entered === undefined) {
        return;
      }
      surfaceEnteredAt.delete(surfaceId);
      if (activeSurface === surfaceId) {
        activeSurface = null;
      }
      emit({
        ...base(at),
        type: 'surface.exited',
        surfaceId,
        dwellMs: Math.max(0, at - entered),
      });
    },
    observeDispatch(result, at = now()) {
      if (!result.ok) {
        return;
      }

      const decision = result.experience.context.decision;
      const objectId = result.experience.context.object.id;
      decisionSessionId = `${objectId}:${result.session.createdAt}`;
      runtimeContextRef = Object.freeze({
        terminalId: decision.terminal.id,
        storyId: decision.story.id,
        activeRoomId: result.experience.context.activeRoom.id,
        objectId,
      });

      const payload = {
        ...payloadFromDecisionEvent(result.event),
        floor:
          result.experience.context.navigation.currentFloor ??
          (result.experience.context.activeRoom.room !== null
            ? String(result.experience.context.activeRoom.room.floor)
            : null),
      };

      emit({
        ...base(at),
        type: 'runtime.signal',
        runtimeEventType: result.event.type,
        payload: Object.freeze(payload),
      });

      if (result.event.type === 'RoomSelected') {
        emit({
          ...base(at),
          type: 'experience.event',
          experienceEventType: 'room.viewed',
          payload: Object.freeze({ roomId: result.event.roomId }),
        });
      }

      if (result.event.type === 'PriorityChanged') {
        const priorityCount = result.event.priorityIds.length;
        const priorityIds = result.event.priorityIds.join(',');
        emit({
          ...base(at),
          type: 'experience.event',
          experienceEventType: priorityCount > 0 ? 'priority.selected' : 'priority.changed',
          payload: Object.freeze({ priorityCount, priorityIds }),
        });
        emit({
          ...base(at),
          type: 'experience.event',
          experienceEventType: 'priority.changed',
          payload: Object.freeze({ priorityCount, priorityIds }),
        });
        if (priorityCount >= 3) {
          emit({
            ...base(at),
            type: 'experience.event',
            experienceEventType: 'priority.completed',
            payload: Object.freeze({ priorityCount, priorityIds }),
          });
        }
      }

      if (!terminalViewedOnce) {
        terminalViewedOnce = true;
        emit({
          ...base(at),
          type: 'terminal.viewed',
          surfaceId: 'decision-terminal',
          terminalId: decision.terminal.id,
          recommendationKey: decision.terminal.outcome.recommendation,
        });
      }

      if (!storyViewedOnce) {
        storyViewedOnce = true;
        emit({
          ...base(at),
          type: 'story.viewed',
          surfaceId: 'decision-terminal',
          storyId: decision.story.id,
        });
      }
    },
    terminalViewed(input) {
      emit({
        ...base(input.at ?? now()),
        type: 'terminal.viewed',
        surfaceId: 'decision-terminal',
        terminalId: input.terminalId,
        recommendationKey: input.recommendationKey,
      });
    },
    storyViewed(storyId, at = now()) {
      emit({
        ...base(at),
        type: 'story.viewed',
        surfaceId: 'decision-terminal',
        storyId,
      });
    },
    aiSessionOpened(aiContextId, at = now()) {
      emit({
        ...base(at),
        type: 'ai.session.opened',
        surfaceId: 'ai-advisor',
        aiContextId,
      });
      emit({
        ...base(at),
        type: 'experience.event',
        experienceEventType: 'ai.conversation.started',
        payload: Object.freeze({ aiContextId }),
      });
    },
    aiInteraction(input) {
      emit({
        ...base(input.at ?? now()),
        type: 'ai.interaction',
        surfaceId: 'ai-advisor',
        questionCategory: input.questionCategory,
        responseGenerated: input.responseGenerated,
        clarificationRequested: input.clarificationRequested,
        conversationLength: input.conversationLength,
      });
    },
    aiSessionEnded(conversationLength, at = now()) {
      emit({
        ...base(at),
        type: 'ai.session.ended',
        surfaceId: 'ai-advisor',
        conversationLength,
      });
      emit({
        ...base(at),
        type: 'experience.event',
        experienceEventType: 'ai.conversation.completed',
        payload: Object.freeze({ conversationLength }),
      });
    },
    experienceEvent(input) {
      const at = input.at ?? now();
      const previousSurface = activeSurface;
      if (input.surfaceId !== undefined) {
        activeSurface = input.surfaceId;
      }
      emit({
        ...base(at),
        type: 'experience.event',
        experienceEventType: input.experienceEventType,
        payload: Object.freeze({ ...(input.payload ?? {}) }),
      });
      activeSurface = previousSurface;
    },
    conversionStarted(ctaId, at = now()) {
      emit({
        ...base(at),
        type: 'conversion.started',
        surfaceId: 'audit-lead-capture',
        ctaId,
      });
      emit({
        ...base(at),
        type: 'experience.event',
        experienceEventType: 'contact.opened',
        payload: Object.freeze({ ctaId }),
      });
    },
    conversionFormOpened(ctaId, at = now()) {
      emit({
        ...base(at),
        type: 'conversion.form.opened',
        surfaceId: 'audit-lead-capture',
        ctaId,
      });
    },
    conversionConsentAccepted(ctaId, at = now()) {
      emit({
        ...base(at),
        type: 'conversion.consent.accepted',
        surfaceId: 'audit-lead-capture',
        ctaId,
      });
    },
    conversionCompleted(ctaId, at = now()) {
      emit({
        ...base(at),
        type: 'conversion.completed',
        surfaceId: 'audit-lead-capture',
        ctaId,
      });
      emit({
        ...base(at),
        type: 'experience.event',
        experienceEventType: 'contact.submitted',
        payload: Object.freeze({ ctaId }),
      });
      journeyCompleted = true;
      emit({ ...base(at), type: 'journey.completed' });
    },
    conversionCancelled(ctaId, at = now()) {
      emit({
        ...base(at),
        type: 'conversion.cancelled',
        surfaceId: 'audit-lead-capture',
        ctaId,
      });
    },
    flush() {
      adapter.flush?.();
    },
  };
}

function payloadFromDecisionEvent(
  event: DecisionEvent,
): Record<string, string | number | boolean | null> {
  switch (event.type) {
    case 'RoomSelected':
      return { roomId: event.roomId };
    case 'PriorityChanged':
      return {
        priorityCount: event.priorityIds.length,
        priorityIds: event.priorityIds.join(','),
      };
    case 'VariantSelected':
      return { variantId: event.variantId };
    case 'ScenarioActivated':
      return { scenarioId: event.scenarioId };
    case 'QuestionAnswered':
      return {
        questionId: event.questionId,
        answerId: event.answerId,
      };
    default:
      return {};
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
