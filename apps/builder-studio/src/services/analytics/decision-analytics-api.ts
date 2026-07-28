import type {
  AnalyticsEvent,
  AnalyticsMetric,
  AnalyticsSnapshot,
  InitializeAnalyticsInput,
  RecordAnalyticsEventInput,
} from '../../model';
import type { DecisionAnalyticsEngine } from './decision-analytics-engine';

/**
 * Public Decision Analytics API (EPIC-BLD-21).
 */
export type DecisionAnalyticsApi = {
  recordAnalytics(input: RecordAnalyticsEventInput): AnalyticsEvent;
  previewAnalytics(analyticsSessionId: string): AnalyticsSnapshot | null;
  exportAnalytics(analyticsSessionId: string): AnalyticsSnapshot;
  listAnalyticsEvents(analyticsSessionId?: string): readonly AnalyticsEvent[];
  listAnalyticsMetrics(analyticsSessionId?: string): readonly AnalyticsMetric[];
  initializeAnalytics(input: InitializeAnalyticsInput): void;
  createAnalyticsSnapshot(analyticsSessionId: string): AnalyticsSnapshot;
};

export function createDecisionAnalyticsApi(
  engine: DecisionAnalyticsEngine,
): DecisionAnalyticsApi {
  return {
    initializeAnalytics(input) {
      engine.initialize(input);
    },
    recordAnalytics(input) {
      return engine.record(input);
    },
    previewAnalytics(analyticsSessionId) {
      return engine.preview(analyticsSessionId);
    },
    exportAnalytics(analyticsSessionId) {
      return engine.exportSnapshot(analyticsSessionId);
    },
    listAnalyticsEvents(analyticsSessionId) {
      return engine.listEvents(analyticsSessionId);
    },
    listAnalyticsMetrics(analyticsSessionId) {
      return engine.listMetrics(analyticsSessionId);
    },
    createAnalyticsSnapshot(analyticsSessionId) {
      return engine.createSnapshot(analyticsSessionId);
    },
  };
}
