import type {
  ExperienceRuntimeEvent,
  RuntimeExecutionPackage,
} from '../../model';

type ExperienceRuntimeOverviewProps = {
  readonly executionPackage: RuntimeExecutionPackage | null;
  readonly events: readonly ExperienceRuntimeEvent[];
  readonly indexCount: number;
  readonly onStart: () => void;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
  readonly onJump: () => void;
  readonly onComplete: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Runtime Overview (EPIC-BLD-32).
 * Diagnostic Experience Runtime Execution — orchestration only.
 */
export function ExperienceRuntimeOverview({
  executionPackage,
  events,
  indexCount,
  onStart,
  onNext,
  onPrevious,
  onJump,
  onComplete,
  onValidate,
  onDispose,
  message,
}: ExperienceRuntimeOverviewProps) {
  const canMutate =
    executionPackage !== null &&
    executionPackage.metadata.status !== 'Disposed' &&
    executionPackage.execution.status !== 'Disposed';
  const canNavigate =
    canMutate && executionPackage.execution.status === 'Running';

  return (
    <div className="space-y-8" data-testid="experience-runtime-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {executionPackage?.metadata.title ??
              'Experience Runtime Orchestrator'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {executionPackage !== null
              ? `${executionPackage.id} · v${executionPackage.version} · ${executionPackage.execution.status}`
              : 'Orchestruje Session, Story, Personalized Context a Modules.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Orchestrator nemění Knowledge Base, AI Context ani Personalized
            Context. Nevytváří Story, nepoužívá AI a neinterpretuje.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onStart}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Start Runtime
          </button>
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canNavigate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNavigate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Next
          </button>
          <button
            type="button"
            onClick={onJump}
            disabled={!canNavigate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Jump
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={
              !canMutate || executionPackage.execution.status === 'Completed'
            }
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Complete
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={!canMutate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={!canMutate}
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

      <section aria-labelledby="er-executions-heading">
        <h3
          id="er-executions-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Executions
        </h3>
        {executionPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Start Runtime (volitelně po Story / Session /
            Personalization).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Package" value={executionPackage.id} />
            <InfoTile label="Execution" value={executionPackage.execution.id} />
            <InfoTile
              label="Session"
              value={executionPackage.metadata.sessionId}
            />
            <InfoTile label="Index" value={String(indexCount)} />
          </ul>
        )}
      </section>

      <section aria-labelledby="er-story-heading">
        <h3
          id="er-story-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Current Story
        </h3>
        {executionPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {executionPackage.metadata.storyId}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="er-move-heading">
        <h3
          id="er-move-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Current Move
        </h3>
        {executionPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {executionPackage.execution.currentMove ?? '—'}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="er-stage-heading">
        <h3
          id="er-stage-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Current Stage
        </h3>
        {executionPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {executionPackage.execution.currentStage} ·{' '}
              {executionPackage.execution.status}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              strategy: {executionPackage.execution.metadata.strategyId}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="er-history-heading">
        <h3
          id="er-history-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Transition History
        </h3>
        {executionPackage === null ||
        executionPackage.execution.transitions.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...executionPackage.execution.transitions]
              .reverse()
              .slice(0, 8)
              .map((item, index) => (
                <li
                  key={`${item.timestamp}-${item.reason}-${index}`}
                  className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
                >
                  <p className="text-sm font-semibold text-builder-ink">
                    {item.from ?? '∅'} → {item.to ?? '∅'}
                  </p>
                  <p className="mt-1 text-[13px] text-builder-muted">
                    {item.reason} · {item.metadata.stage}
                  </p>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="er-validation-heading">
        <h3
          id="er-validation-heading"
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

      <section aria-labelledby="er-events-heading">
        <h3
          id="er-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime Events
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
