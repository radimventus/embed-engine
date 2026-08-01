import type {
  RuntimeRecoveryCoordinatorEvent,
  RuntimeRecoverySummaryPackage,
} from '../../model';

type RecoveryCoordinatorOverviewProps = {
  readonly summaryPackage: RuntimeRecoverySummaryPackage | null;
  readonly events: readonly RuntimeRecoveryCoordinatorEvent[];
  readonly indexCount: number;
  readonly onStart: () => void;
  readonly onComplete: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Recovery Coordinator Overview (EPIC-BLD-45).
 * Diagnostic projection of Recovery Session coordination.
 */
export function RecoveryCoordinatorOverview({
  summaryPackage,
  events,
  indexCount,
  onStart,
  onComplete,
  onPublish,
  onValidate,
  onDispose,
  message,
}: RecoveryCoordinatorOverviewProps) {
  const canAct =
    summaryPackage !== null && summaryPackage.metadata.status !== 'Disposed';
  const canComplete = canAct && summaryPackage.summary === null;
  const canPublish =
    canAct && summaryPackage.metadata.status !== 'Published';
  const session = summaryPackage?.session ?? null;
  const summary = summaryPackage?.summary ?? null;

  return (
    <div className="space-y-8" data-testid="recovery-coordinator-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Recovery Coordinator
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {summaryPackage?.metadata.title ??
              'Runtime Recovery Coordinator'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {summaryPackage !== null
              ? `${summaryPackage.id} · v${summaryPackage.version} · ${summaryPackage.metadata.status}`
              : 'Koordinace Recovery Session (bez výkonu kroků).'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Coordinator nevytváří Plan, Sequence ani Execution. Pouze řídí
            životní cyklus Recovery Session.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onStart}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Start Session
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={!canComplete}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Complete
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

      <section aria-labelledby="rc-session-heading">
        <h3
          id="rc-session-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Recovery Session
        </h3>
        {session === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Start Session (volitelně po Recovery Execution).
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {session.id}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              runtime: {session.runtimeExecutionId ?? '—'} · index: {indexCount}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="rc-status-heading">
        <h3
          id="rc-status-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Current Status
        </h3>
        {session === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {session.status}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              {session.metadata.notes}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="rc-executions-heading">
        <h3
          id="rc-executions-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Executions
        </h3>
        {session === null || session.executions.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Žádné referencované Recovery Execution.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {session.executions.map((item) => (
              <li
                key={item.executionId}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">
                  [{item.status}] {item.executionId}
                </span>
                <span className="mt-0.5 block text-builder-muted">
                  sequence: {item.sequenceId ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="rc-progress-heading">
        <h3
          id="rc-progress-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Progress
        </h3>
        {session === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {session.metadata.progressPercent}%
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              {session.executions.length} execution(s) tracked
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="rc-summary-heading">
        <h3
          id="rc-summary-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Final Summary
        </h3>
        {summary === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím žádný Recovery Summary.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Final" value={summary.finalStatus} />
            <InfoTile label="Duration" value={`${summary.duration}s`} />
            <InfoTile
              label="Completed"
              value={String(summary.completedExecutions)}
            />
            <InfoTile
              label="Failed"
              value={String(summary.failedExecutions)}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="rc-validation-heading">
        <h3
          id="rc-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {summaryPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {summaryPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {summaryPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {summaryPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="rc-events-heading">
        <h3
          id="rc-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Recovery Coordinator Events
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
