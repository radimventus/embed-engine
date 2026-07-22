/**
 * Decision Analytics event model (CSCB-08).
 * Observational only — never influences Runtime semantics.
 */

export type AnalyticsTimestamp = number;

export type JourneySurfaceId =
  | 'hero'
  | 'property-explorer'
  | 'walkthrough'
  | 'priority-experience'
  | 'ai-advisor'
  | 'audit-lead-capture';

export type AnalyticsEvent =
  | {
      readonly type: 'journey.started';
      readonly at: AnalyticsTimestamp;
      readonly sessionId: string;
    }
  | {
      readonly type: 'journey.completed';
      readonly at: AnalyticsTimestamp;
      readonly sessionId: string;
    }
  | {
      readonly type: 'surface.entered';
      readonly at: AnalyticsTimestamp;
      readonly sessionId: string;
      readonly surfaceId: JourneySurfaceId;
    }
  | {
      readonly type: 'surface.exited';
      readonly at: AnalyticsTimestamp;
      readonly sessionId: string;
      readonly surfaceId: JourneySurfaceId;
      readonly dwellMs: number;
    }
  | {
      readonly type: 'runtime.signal';
      readonly at: AnalyticsTimestamp;
      readonly sessionId: string;
      /** Canonical Runtime DecisionEvent type when available. */
      readonly runtimeEventType: string;
      readonly payload: Readonly<Record<string, string | number | boolean | null>>;
    }
  | {
      readonly type: 'terminal.viewed';
      readonly at: AnalyticsTimestamp;
      readonly sessionId: string;
      readonly terminalId: string;
      readonly recommendationKey: string;
    }
  | {
      readonly type: 'ai.session.opened';
      readonly at: AnalyticsTimestamp;
      readonly sessionId: string;
      readonly aiContextId: string;
    }
  | {
      readonly type: 'ai.interaction';
      readonly at: AnalyticsTimestamp;
      readonly sessionId: string;
      /** Coarse category only — never prompt/response body unless policy allows. */
      readonly questionCategory: string;
      readonly responseGenerated: boolean;
      readonly clarificationRequested: boolean;
      readonly conversationLength: number;
    }
  | {
      readonly type: 'conversion.started';
      readonly at: AnalyticsTimestamp;
      readonly sessionId: string;
      readonly ctaId: string;
    }
  | {
      readonly type: 'conversion.completed';
      readonly at: AnalyticsTimestamp;
      readonly sessionId: string;
      readonly ctaId: string;
    };

export type AnalyticsEventType = AnalyticsEvent['type'];

export type SessionMetricsSnapshot = {
  readonly sessionId: string;
  readonly startedAt: AnalyticsTimestamp | null;
  readonly endedAt: AnalyticsTimestamp | null;
  readonly durationMs: number | null;
  readonly surfaceEnterCounts: Readonly<Record<string, number>>;
  readonly surfaceDwellMs: Readonly<Record<string, number>>;
  readonly runtimeSignalCounts: Readonly<Record<string, number>>;
  readonly terminalViewCount: number;
  readonly aiSessionOpenCount: number;
  readonly aiInteractionCount: number;
  readonly conversionStartedCount: number;
  readonly conversionCompletedCount: number;
  readonly journeyCompleted: boolean;
  readonly eventCount: number;
};
