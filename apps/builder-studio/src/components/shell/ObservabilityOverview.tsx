import type {
  RuntimeObservabilityEvent,
  RuntimeObservabilityPackage,
} from '../../model';

type ObservabilityOverviewProps = {
  readonly observabilityPackage: RuntimeObservabilityPackage | null;
  readonly events: readonly RuntimeObservabilityEvent[];
  readonly indexCount: number;
  readonly activeSessionCount: number;
  readonly onCollect: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Observability Overview (EPIC-BLD-36).
 * Diagnostic projection only — never mutates Runtime / State / Knowledge.
 */
export function ObservabilityOverview({
  observabilityPackage,
  events,
  indexCount,
  activeSessionCount,
  onCollect,
  onPublish,
  onValidate,
  onDispose,
  message,
}: ObservabilityOverviewProps) {
  const canAct =
    observabilityPackage !== null &&
    observabilityPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && observabilityPackage.metadata.status !== 'Published';

  return (
    <div className="space-y-8" data-testid="observability-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Observability
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {observabilityPackage?.metadata.title ??
              'Runtime Observability Engine'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {observabilityPackage !== null
              ? `${observabilityPackage.id} · v${observabilityPackage.version} · ${observabilityPackage.metadata.status}`
              : 'Read-only diagnostika běžící Experience.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Observability nikdy nemění Runtime, State, Knowledge ani
            orchestraci. Nepoužívá AI — pouze pozoruje.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCollect}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Collect Runtime
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={!canAct}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={!canPublish}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Publish
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={!canAct}
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

      <section aria-labelledby="obs-timeline-heading">
        <h3
          id="obs-timeline-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime Timeline
        </h3>
        {observabilityPackage === null ||
        observabilityPackage.timeline.events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Collect Runtime (čte události Runtime / Modules / State).
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {observabilityPackage.timeline.events.slice(0, 12).map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <div>
                  <span className="font-medium text-builder-ink">
                    {item.event}
                  </span>
                  <span className="mt-0.5 block text-builder-muted">
                    {item.metadata.source}
                    {item.moduleId !== null ? ` · ${item.moduleId}` : ''}
                    {item.executionId !== null
                      ? ` · ${item.executionId}`
                      : ''}
                  </span>
                </div>
                <time className="shrink-0 text-[11px] text-builder-muted">
                  {new Date(item.timestamp).toLocaleTimeString('cs-CZ', {
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

      <section aria-labelledby="obs-health-heading">
        <h3
          id="obs-health-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime Health
        </h3>
        {observabilityPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {observabilityPackage.metrics.health}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              score: {observabilityPackage.metrics.healthScore}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="obs-metrics-heading">
        <h3
          id="obs-metrics-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime Metrics
        </h3>
        {observabilityPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile
              label="Observations"
              value={String(observabilityPackage.metrics.observationCount)}
            />
            <InfoTile
              label="Executions"
              value={String(observabilityPackage.metrics.executionCount)}
            />
            <InfoTile
              label="Module events"
              value={String(observabilityPackage.metrics.moduleEventCount)}
            />
            <InfoTile
              label="State events"
              value={String(observabilityPackage.metrics.stateEventCount)}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="obs-sessions-heading">
        <h3
          id="obs-sessions-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Active Sessions
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          <InfoTile
            label="Sessions in package"
            value={
              observabilityPackage !== null
                ? String(observabilityPackage.metrics.sessionCount)
                : '0'
            }
          />
          <InfoTile
            label="Tracked sessions"
            value={String(activeSessionCount)}
          />
          <InfoTile label="Index entries" value={String(indexCount)} />
          <InfoTile
            label="Timeline"
            value={observabilityPackage?.timeline.id ?? '—'}
          />
        </ul>
      </section>

      <section aria-labelledby="obs-validation-heading">
        <h3
          id="obs-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {observabilityPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {observabilityPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {observabilityPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {observabilityPackage.validation.issues.map((issue) => (
                  <li
                    key={`${issue.code}-${issue.message}`}
                    className="text-sm text-builder-muted"
                  >
                    [{issue.severity}] {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="obs-events-heading">
        <h3
          id="obs-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Observability Events
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
