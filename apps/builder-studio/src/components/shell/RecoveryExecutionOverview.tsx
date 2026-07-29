import type {
  RuntimeRecoveryExecutionEvent,
  RuntimeRecoveryExecutionPackage,
} from '../../model';

type RecoveryExecutionOverviewProps = {
  readonly executionPackage: RuntimeRecoveryExecutionPackage | null;
  readonly events: readonly RuntimeRecoveryExecutionEvent[];
  readonly indexCount: number;
  readonly onExecute: () => void;
  readonly onPause: () => void;
  readonly onResume: () => void;
  readonly onValidate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Recovery Execution Overview (EPIC-BLD-44).
 * Diagnostic projection of coordinated Recovery Execution.
 */
export function RecoveryExecutionOverview({
  executionPackage,
  events,
  indexCount,
  onExecute,
  onPause,
  onResume,
  onValidate,
  onPublish,
  onDispose,
  message,
}: RecoveryExecutionOverviewProps) {
  const canAct =
    executionPackage !== null &&
    executionPackage.metadata.status !== 'Disposed';
  const status = executionPackage?.execution.status ?? null;
  const canPause = status === 'READY' || status === 'RUNNING';
  const canResume = status === 'PAUSED';
  const canPublish =
    canAct && executionPackage.metadata.status !== 'Published';
  const execution = executionPackage?.execution ?? null;
  const result = executionPackage?.result ?? null;

  return (
    <div className="space-y-8" data-testid="recovery-execution-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Recovery Execution
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {executionPackage?.metadata.title ??
              'Runtime Recovery Executor'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {executionPackage !== null
              ? `${executionPackage.id} · v${executionPackage.version} · ${executionPackage.metadata.status}`
              : 'Deterministické vykonání Recovery Sequence.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Executor koordinuje requesty vůči Execution Layer. Nevlastní Runtime
            a nevytváří Policy, Governance ani AI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExecute}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Execute Recovery
          </button>
          <button
            type="button"
            onClick={onPause}
            disabled={!canPause}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={onResume}
            disabled={!canResume}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Resume
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

      <section aria-labelledby="rex-status-heading">
        <h3
          id="rex-status-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Execution Status
        </h3>
        {execution === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Execute Recovery (volitelně po Recovery Sequence).
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {execution.status}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              sequence: {execution.sequenceId} · session:{' '}
              {execution.metadata.sessionId} · index: {indexCount}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="rex-current-heading">
        <h3
          id="rex-current-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Current Step
        </h3>
        {execution === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {execution.currentStep ?? '—'}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              {execution.metadata.notes}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="rex-completed-heading">
        <h3
          id="rex-completed-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Completed Steps
        </h3>
        {execution === null ||
        execution.metadata.completedStepIds.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím žádné dokončené kroky.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {execution.metadata.completedStepIds.map((stepId) => (
              <li
                key={stepId}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px] text-builder-ink"
              >
                {stepId}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="rex-failed-heading">
        <h3
          id="rex-failed-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Failed Steps
        </h3>
        {execution === null ||
        execution.metadata.failedStepIds.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Žádné selhané kroky.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {execution.metadata.failedStepIds.map((stepId) => (
              <li
                key={stepId}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px] text-builder-ink"
              >
                {stepId}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="rex-duration-heading">
        <h3
          id="rex-duration-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Duration
        </h3>
        {result === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Duration" value={`${result.duration}s`} />
            <InfoTile label="Result" value={result.status} />
            <InfoTile
              label="Completed"
              value={String(result.completedSteps.length)}
            />
            <InfoTile label="Package" value={executionPackage!.id} />
          </ul>
        )}
      </section>

      <section aria-labelledby="rex-validation-heading">
        <h3
          id="rex-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {executionPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {executionPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {executionPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {executionPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="rex-events-heading">
        <h3
          id="rex-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Recovery Execution Events
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
