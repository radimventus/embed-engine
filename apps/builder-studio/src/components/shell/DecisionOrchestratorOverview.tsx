import type {
  DecisionExecutionPackage,
  DecisionOrchestratorEvent,
} from '../../model';

type DecisionOrchestratorOverviewProps = {
  readonly executionPackage: DecisionExecutionPackage | null;
  readonly events: readonly DecisionOrchestratorEvent[];
  readonly indexCount: number;
  readonly onStart: () => void;
  readonly onAdvance: () => void;
  readonly onTransition: () => void;
  readonly onComplete: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Decision Runtime Overview (EPIC-BLD-31).
 * Diagnostic Decision Execution — orchestration only.
 */
export function DecisionOrchestratorOverview({
  executionPackage,
  events,
  indexCount,
  onStart,
  onAdvance,
  onTransition,
  onComplete,
  onValidate,
  onDispose,
  message,
}: DecisionOrchestratorOverviewProps) {
  const canMutate =
    executionPackage !== null &&
    executionPackage.metadata.status !== 'Disposed' &&
    executionPackage.execution.state !== 'Disposed';
  const canAdvance =
    canMutate && executionPackage.execution.state === 'Running';

  const activeStage =
    executionPackage?.execution.stages.find(
      (stage) => stage.status === 'Active',
    ) ??
    executionPackage?.execution.stages[
      executionPackage.execution.stages.length - 1
    ] ??
    null;

  return (
    <div className="space-y-8" data-testid="decision-orchestrator-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Decision Runtime
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {executionPackage?.metadata.title ?? 'Decision Orchestrator'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {executionPackage !== null
              ? `${executionPackage.id} · v${executionPackage.version} · ${executionPackage.execution.state}`
              : 'Orchestruje Session, Story, Personalization a Behavior.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Orchestrator nemění Knowledge Base, AI Context ani Personalization.
            Negeneruje Story a nevytváří nové znalosti.
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
            onClick={onAdvance}
            disabled={!canAdvance}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Advance
          </button>
          <button
            type="button"
            onClick={onTransition}
            disabled={!canAdvance}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Transition
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={!canMutate || executionPackage.execution.state === 'Completed'}
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

      <section aria-labelledby="do-executions-heading">
        <h3
          id="do-executions-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Executions
        </h3>
        {executionPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Start Execution (volitelně po Story / Session /
            Personalization).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Package" value={executionPackage.id} />
            <InfoTile label="Execution" value={executionPackage.execution.id} />
            <InfoTile label="Session" value={executionPackage.metadata.sessionId} />
            <InfoTile label="Story" value={executionPackage.metadata.storyId} />
          </ul>
        )}
      </section>

      <section aria-labelledby="do-stage-heading">
        <h3
          id="do-stage-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Current Stage
        </h3>
        {activeStage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {activeStage.type} · {activeStage.status}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              {activeStage.metadata.notes}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="do-move-heading">
        <h3
          id="do-move-heading"
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

      <section aria-labelledby="do-state-heading">
        <h3
          id="do-state-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime State
        </h3>
        {executionPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile
              label="State"
              value={executionPackage.execution.state}
            />
            <InfoTile
              label="Strategy"
              value={executionPackage.execution.metadata.strategyId}
            />
            <InfoTile
              label="Personalization"
              value={
                executionPackage.execution.metadata.personalizationPackageId ??
                '—'
              }
            />
            <InfoTile
              label="Behavior"
              value={
                executionPackage.execution.metadata.behaviorEvaluationId ?? '—'
              }
            />
            <InfoTile label="Index" value={String(indexCount)} />
            <InfoTile
              label="Stages"
              value={String(executionPackage.execution.stages.length)}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="do-validation-heading">
        <h3
          id="do-validation-heading"
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

      <section aria-labelledby="do-events-heading">
        <h3
          id="do-events-heading"
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
