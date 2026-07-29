import type {
  PublicationExecutionEvent,
  PublicationExecutionPackage,
} from '../../model';

type PublicationExecutionOverviewProps = {
  readonly executionPackage: PublicationExecutionPackage | null;
  readonly events: readonly PublicationExecutionEvent[];
  readonly indexCount: number;
  readonly onStart: () => void;
  readonly onExecuteStep: () => void;
  readonly onComplete: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function PublicationExecutionOverview({
  executionPackage,
  events,
  indexCount,
  onStart,
  onExecuteStep,
  onComplete,
  onValidate,
  onDispose,
  message,
}: PublicationExecutionOverviewProps) {
  const session = executionPackage?.session ?? null;
  return (
    <div className="space-y-8" data-testid="publication-execution-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Publication Execution
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {executionPackage?.metadata.title ?? 'Publication Execution Coordinator'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {executionPackage !== null
              ? `${executionPackage.id} · v${executionPackage.version} · ${executionPackage.metadata.status}`
              : 'Deterministická koordinace kroků publikačního plánu.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onStart}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Start Execution
          </button>
          <button
            type="button"
            onClick={onExecuteStep}
            disabled={session?.status !== 'RUNNING'}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Execute Step
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={executionPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Complete
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={executionPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={executionPackage === null}
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

      <section aria-labelledby="publication-execution-summary">
        <h3
          id="publication-execution-summary"
          className="text-base font-semibold text-builder-ink"
        >
          Plan · Current Step · Status · Progress · Validation
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-5">
          <InfoTile label="Plan" value={session?.planId ?? '—'} />
          <InfoTile label="Current Step" value={String(session?.currentStep ?? 0)} />
          <InfoTile label="Status" value={session?.status ?? '—'} />
          <InfoTile
            label="Progress"
            value={
              session === null
                ? '0/0'
                : `${session.metadata.completedSteps}/${session.metadata.totalSteps}`
            }
          />
          <InfoTile
            label="Validation"
            value={
              executionPackage?.validation == null
                ? 'Pending'
                : executionPackage.validation.valid
                  ? 'Valid'
                  : 'Invalid'
            }
          />
        </ul>
        {executionPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">index: {indexCount}</p>
        ) : null}
      </section>

      <section aria-labelledby="publication-execution-events">
        <h3
          id="publication-execution-events"
          className="text-base font-semibold text-builder-ink"
        >
          Publication Execution Events
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
