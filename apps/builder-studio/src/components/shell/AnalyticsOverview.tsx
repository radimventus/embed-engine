import type {
  AnalyticsEngineEvent,
  AnalyticsSnapshot,
} from '../../model';

type AnalyticsOverviewProps = {
  readonly snapshot: AnalyticsSnapshot | null;
  readonly events: readonly AnalyticsEngineEvent[];
  readonly onRecord: () => void;
  readonly onAggregate: () => void;
  readonly onExport: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Analytics Overview (EPIC-BLD-21).
 * Diagnostic recording view — no dashboards, AI, or Learning writes.
 */
export function AnalyticsOverview({
  snapshot,
  events,
  onRecord,
  onAggregate,
  onExport,
  onDispose,
  message,
}: AnalyticsOverviewProps) {
  return (
    <div className="space-y-8" data-testid="analytics-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Decision Analytics
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {snapshot?.metadata.title ?? 'Analytics'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {snapshot !== null
              ? `${snapshot.id} · ${snapshot.summary.eventCount} events`
              : 'Vyžaduje Runtime Session — Analytics pouze zaznamenává.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Analytics nemění Story, Runtime Session, Behavior ani Learning.
            Pouze strukturovaná fakta.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRecord}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Record Analytics
          </button>
          <button
            type="button"
            onClick={onAggregate}
            disabled={snapshot === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Aggregate
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={snapshot === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={snapshot === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Dispose
          </button>
        </div>
      </div>

      {message !== null ? (
        <p className="rounded-[10px] border border-[#DDE5EF] px-4 py-3 text-sm text-builder-muted">
          {message}
        </p>
      ) : null}

      <section aria-labelledby="analytics-session-heading">
        <h3
          id="analytics-session-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Session
        </h3>
        {snapshot === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Record Analytics (nejprve Session).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Analytics Session" value={snapshot.session.id} />
            <InfoTile
              label="Runtime Session"
              value={snapshot.session.runtimeSessionId}
            />
            <InfoTile label="Story" value={snapshot.session.storyId} />
            <InfoTile
              label="Started"
              value={new Date(snapshot.session.startedAt).toLocaleString(
                'cs-CZ',
              )}
            />
            <InfoTile
              label="Completed"
              value={
                snapshot.session.completedAt === null
                  ? '—'
                  : new Date(snapshot.session.completedAt).toLocaleString(
                      'cs-CZ',
                    )
              }
            />
            <InfoTile
              label="Behavior"
              value={snapshot.session.metadata.behaviorId ?? '—'}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="analytics-metrics-heading">
        <h3
          id="analytics-metrics-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Metrics
        </h3>
        {snapshot === null || snapshot.metrics.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím žádné metriky.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {snapshot.metrics.map((metric) => (
              <div
                key={metric.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-[12px] uppercase tracking-wide text-builder-muted">
                  {metric.name}
                </p>
                <p className="mt-1 text-xl font-semibold text-builder-ink">
                  {metric.value}
                  <span className="ml-1 text-sm font-normal text-builder-muted">
                    {metric.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="analytics-events-heading">
        <h3
          id="analytics-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Events
        </h3>
        {snapshot === null || snapshot.events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím žádné Analytics Events.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {snapshot.events.map((item) => (
              <li
                key={item.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-builder-ink">
                    {item.type}
                  </p>
                  <span className="rounded-[8px] border border-[#DDE5EF] px-2.5 py-1 text-[12px]">
                    {item.source}
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-builder-muted">
                  {item.payload.note}
                </p>
                <p className="mt-1 text-[12px] text-builder-muted">
                  move {item.payload.moveId ?? '—'}
                  {item.payload.durationMs !== null
                    ? ` · ${item.payload.durationMs} ms`
                    : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="analytics-snapshot-heading">
        <h3
          id="analytics-snapshot-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Snapshot
        </h3>
        {snapshot === null ? (
          <p className="mt-3 text-sm text-builder-muted">Snapshot neexistuje.</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Snapshot ID" value={snapshot.id} />
            <InfoTile
              label="Event count"
              value={`${snapshot.summary.eventCount}`}
            />
            <InfoTile
              label="Metric count"
              value={`${snapshot.summary.metricCount}`}
            />
            <InfoTile
              label="Move count"
              value={`${snapshot.summary.moveCount}`}
            />
            <InfoTile
              label="Completed"
              value={snapshot.summary.completed ? 'yes' : 'no'}
            />
            <InfoTile
              label="Runtime"
              value={snapshot.session.metadata.runtimeId}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="analytics-export-heading">
        <h3
          id="analytics-export-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Export
        </h3>
        {snapshot?.exportPayload == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím neexportováno — Export JSON.
          </p>
        ) : (
          <pre className="mt-3 max-h-64 overflow-auto rounded-[12px] border border-[#DDE5EF] bg-[#F8FAFC] px-4 py-3 text-[12px] text-builder-ink">
            {snapshot.exportPayload}
          </pre>
        )}
      </section>

      <section aria-labelledby="analytics-engine-events-heading">
        <h3
          id="analytics-engine-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Engine Events
        </h3>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím žádné události.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.slice(0, 12).map((event) => (
              <li
                key={event.eventId}
                className="flex items-start justify-between gap-3 rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <div>
                  <span className="font-medium text-builder-ink">
                    {event.type}
                  </span>
                  <span className="mt-0.5 block text-builder-muted">
                    {event.message}
                  </span>
                </div>
                <time className="shrink-0 text-[11px] text-builder-muted">
                  {new Date(event.at).toLocaleTimeString('cs-CZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function InfoTile({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#DDE5EF] px-4 py-3">
      <p className="text-[12px] uppercase tracking-wide text-builder-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-builder-ink">{value}</p>
    </div>
  );
}
