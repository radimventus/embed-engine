import type {
  RuntimeRecoveryReportPackage,
  RuntimeRecoveryReportingEvent,
} from '../../model';

type RecoveryReportingOverviewProps = {
  readonly reportPackage: RuntimeRecoveryReportPackage | null;
  readonly events: readonly RuntimeRecoveryReportingEvent[];
  readonly indexCount: number;
  readonly onGenerate: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Recovery Reporting Overview (EPIC-BLD-46).
 * Diagnostic projection of Recovery Report — never executes recovery.
 */
export function RecoveryReportingOverview({
  reportPackage,
  events,
  indexCount,
  onGenerate,
  onPublish,
  onValidate,
  onDispose,
  message,
}: RecoveryReportingOverviewProps) {
  const canAct =
    reportPackage !== null && reportPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && reportPackage.metadata.status !== 'Published';
  const report = reportPackage?.report ?? null;

  return (
    <div className="space-y-8" data-testid="recovery-reporting-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Recovery Reporting
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {reportPackage?.metadata.title ??
              'Runtime Recovery Reporting Engine'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {reportPackage !== null
              ? `${reportPackage.id} · v${reportPackage.version} · ${reportPackage.metadata.status}`
              : 'Finální Recovery Report (bez řízení obnovy).'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Reporting nikdy neprovádí Recovery, nekoordinuje Session a
            nepoužívá AI. Výstupem je pouze report.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onGenerate}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Generate Report
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

      <section aria-labelledby="rrp-session-heading">
        <h3
          id="rrp-session-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Recovery Session
        </h3>
        {report === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Generate Report (volitelně po Recovery Coordinator).
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {report.metadata.recoverySessionId ?? report.sessionId}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              session: {report.sessionId} · runtime:{' '}
              {report.runtimeExecutionId ?? '—'} · index: {indexCount}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="rrp-executions-heading">
        <h3
          id="rrp-executions-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Executions
        </h3>
        {report === null || report.executions.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Žádné reportované Recovery Execution.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {report.executions.map((item) => (
              <li
                key={item.id}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">
                  [{item.status}] {item.executionId}
                </span>
                <span className="mt-0.5 block text-builder-muted">
                  {item.description} · {item.duration}s · sequence{' '}
                  {item.metadata.sequenceId ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="rrp-status-heading">
        <h3
          id="rrp-status-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Final Status
        </h3>
        {report === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {report.finalStatus}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="rrp-duration-heading">
        <h3
          id="rrp-duration-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Duration
        </h3>
        {report === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {report.duration}s
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="rrp-report-heading">
        <h3
          id="rrp-report-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Generated Report
        </h3>
        {report === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {report.id}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              {report.summary}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="rrp-validation-heading">
        <h3
          id="rrp-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {reportPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {reportPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {reportPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {reportPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="rrp-events-heading">
        <h3
          id="rrp-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Recovery Reporting Events
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
