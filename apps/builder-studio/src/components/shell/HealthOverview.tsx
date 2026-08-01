import type {
  RuntimeHealthEvent,
  RuntimeHealthPackage,
} from '../../model';

type HealthOverviewProps = {
  readonly healthPackage: RuntimeHealthPackage | null;
  readonly events: readonly RuntimeHealthEvent[];
  readonly indexCount: number;
  readonly onInspect: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Health Overview (EPIC-BLD-37).
 * Diagnostic projection only — never mutates Runtime / State / Knowledge.
 */
export function HealthOverview({
  healthPackage,
  events,
  indexCount,
  onInspect,
  onPublish,
  onValidate,
  onDispose,
  message,
}: HealthOverviewProps) {
  const canAct =
    healthPackage !== null && healthPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && healthPackage.metadata.status !== 'Published';

  return (
    <div className="space-y-8" data-testid="health-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Health
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {healthPackage?.metadata.title ?? 'Runtime Health Engine'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {healthPackage !== null
              ? `${healthPackage.id} · v${healthPackage.version} · ${healthPackage.metadata.status}`
              : 'Read-only diagnostika zdraví Builder Runtime.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Health nikdy nemění Runtime, State, Knowledge ani Execution.
            Nepoužívá AI — pouze diagnostikuje.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onInspect}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Inspect Runtime
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

      <section aria-labelledby="health-overall-heading">
        <h3
          id="health-overall-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Overall Health
        </h3>
        {healthPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Inspect Runtime (volitelně po Observability Collect).
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {healthPackage.report.overallHealth}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              session: {healthPackage.report.sessionId} · execution:{' '}
              {healthPackage.report.runtimeExecutionId ?? '—'} · index:{' '}
              {indexCount}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="health-score-heading">
        <h3
          id="health-score-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime Score
        </h3>
        {healthPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {healthPackage.report.score}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="health-warnings-heading">
        <h3
          id="health-warnings-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Active Warnings
        </h3>
        {healthPackage === null || healthPackage.report.warnings.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Žádná varování.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {healthPackage.report.warnings.map((item) => (
              <li
                key={item.id}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">
                  [{item.category}] {item.description}
                </span>
                <span className="mt-0.5 block text-builder-muted">
                  {item.metadata.code} · {item.source}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="health-errors-heading">
        <h3
          id="health-errors-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Active Errors
        </h3>
        {healthPackage === null || healthPackage.report.errors.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Žádné chyby.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {healthPackage.report.errors.map((item) => (
              <li
                key={item.id}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">
                  [{item.category}] {item.description}
                </span>
                <span className="mt-0.5 block text-builder-muted">
                  {item.metadata.code} · {item.source}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="health-validation-heading">
        <h3
          id="health-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {healthPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {healthPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {healthPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {healthPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="health-findings-heading">
        <h3
          id="health-findings-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Findings Timeline
        </h3>
        {healthPackage === null || healthPackage.report.findings.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím žádné findings.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {healthPackage.report.findings.slice(0, 12).map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <div>
                  <span className="font-medium text-builder-ink">
                    {item.severity} · {item.category}
                  </span>
                  <span className="mt-0.5 block text-builder-muted">
                    {item.description}
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

      <section aria-labelledby="health-events-heading">
        <h3
          id="health-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Health Events
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
