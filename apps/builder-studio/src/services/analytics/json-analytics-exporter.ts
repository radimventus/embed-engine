import type { AnalyticsSnapshot } from '../../model';

/**
 * AnalyticsExporter (EPIC-BLD-21).
 * Serialization only — no dashboards or Learning writes.
 */
export type AnalyticsExporter = {
  readonly id: string;
  export(snapshot: AnalyticsSnapshot): string;
  serialize(snapshot: AnalyticsSnapshot): string;
};

/**
 * JsonAnalyticsExporter — JSON only.
 */
export function createJsonAnalyticsExporter(): AnalyticsExporter {
  const serialize = (snapshot: AnalyticsSnapshot): string =>
    JSON.stringify(
      {
        id: snapshot.id,
        session: snapshot.session,
        events: snapshot.events,
        metrics: snapshot.metrics,
        summary: snapshot.summary,
        metadata: snapshot.metadata,
        timestamps: snapshot.timestamps,
      },
      null,
      2,
    );

  return {
    id: 'json-analytics-exporter',
    serialize,
    export(snapshot) {
      return serialize(snapshot);
    },
  };
}
