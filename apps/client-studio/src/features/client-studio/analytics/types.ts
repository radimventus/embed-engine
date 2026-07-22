/**
 * Decision Analytics event model (CSCB-08).
 * Observational only — never influences Runtime semantics.
 *
 * Envelope on every event:
 * Session ID · Decision Session ID · Event Type · Timestamp
 * Optional: Experience Surface · Runtime Context Reference
 */

export type AnalyticsTimestamp = number;

export type JourneySurfaceId =
  | 'hero'
  | 'property-explorer'
  | 'walkthrough'
  | 'priority-experience'
  | 'decision-terminal'
  | 'ai-advisor'
  | 'audit-lead-capture';

/** Lightweight pointer into Runtime Context — never a state dump. */
export type RuntimeContextRef = {
  readonly terminalId: string | null;
  readonly storyId: string | null;
  readonly activeRoomId: string | null;
  readonly objectId: string | null;
};

export type AnalyticsEventBase = {
  readonly sessionId: string;
  readonly decisionSessionId: string;
  readonly at: AnalyticsTimestamp;
  readonly surfaceId: JourneySurfaceId | null;
  readonly runtimeContextRef: RuntimeContextRef | null;
};

export type AnalyticsEvent =
  | (AnalyticsEventBase & { readonly type: 'journey.started' })
  | (AnalyticsEventBase & { readonly type: 'journey.resumed' })
  | (AnalyticsEventBase & { readonly type: 'journey.completed' })
  | (AnalyticsEventBase & { readonly type: 'journey.abandoned' })
  | (AnalyticsEventBase & {
      readonly type: 'surface.entered';
      readonly surfaceId: JourneySurfaceId;
    })
  | (AnalyticsEventBase & {
      readonly type: 'surface.exited';
      readonly surfaceId: JourneySurfaceId;
      readonly dwellMs: number;
    })
  | (AnalyticsEventBase & {
      readonly type: 'runtime.signal';
      /** Canonical Runtime DecisionEvent type. */
      readonly runtimeEventType: string;
      readonly payload: Readonly<Record<string, string | number | boolean | null>>;
    })
  | (AnalyticsEventBase & {
      readonly type: 'terminal.viewed';
      readonly terminalId: string;
      readonly recommendationKey: string;
    })
  | (AnalyticsEventBase & {
      readonly type: 'story.viewed';
      readonly storyId: string;
    })
  | (AnalyticsEventBase & {
      readonly type: 'ai.session.opened';
      readonly aiContextId: string;
    })
  | (AnalyticsEventBase & {
      readonly type: 'ai.interaction';
      readonly questionCategory: string;
      readonly responseGenerated: boolean;
      readonly clarificationRequested: boolean;
      readonly conversationLength: number;
    })
  | (AnalyticsEventBase & {
      readonly type: 'ai.session.ended';
      readonly conversationLength: number;
    })
  | (AnalyticsEventBase & {
      readonly type: 'conversion.started';
      readonly ctaId: string;
    })
  | (AnalyticsEventBase & {
      readonly type: 'conversion.form.opened';
      readonly ctaId: string;
    })
  | (AnalyticsEventBase & {
      readonly type: 'conversion.consent.accepted';
      readonly ctaId: string;
    })
  | (AnalyticsEventBase & {
      readonly type: 'conversion.completed';
      readonly ctaId: string;
    })
  | (AnalyticsEventBase & {
      readonly type: 'conversion.cancelled';
      readonly ctaId: string;
    });

export type AnalyticsEventType = AnalyticsEvent['type'];

export type SessionMetricsSnapshot = {
  readonly sessionId: string;
  readonly decisionSessionId: string;
  readonly startedAt: AnalyticsTimestamp | null;
  readonly endedAt: AnalyticsTimestamp | null;
  readonly durationMs: number | null;
  readonly surfaceEnterCounts: Readonly<Record<string, number>>;
  readonly surfaceDwellMs: Readonly<Record<string, number>>;
  readonly runtimeSignalCounts: Readonly<Record<string, number>>;
  readonly terminalViewCount: number;
  readonly storyViewCount: number;
  readonly aiSessionOpenCount: number;
  readonly aiInteractionCount: number;
  readonly conversionStartedCount: number;
  readonly conversionCompletedCount: number;
  readonly journeyCompleted: boolean;
  readonly journeyAbandoned: boolean;
  readonly eventCount: number;
};
