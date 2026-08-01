import type {
  RuntimeResilienceEvent,
  RuntimeResiliencePackage,
} from '../../model';

type ResilienceOverviewProps = {
  readonly resiliencePackage: RuntimeResiliencePackage | null;
  readonly events: readonly RuntimeResilienceEvent[];
  readonly indexCount: number;
  readonly onEvaluate: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Resilience Overview (EPIC-BLD-42).
 * Diagnostic projection of Recovery Plan — never executes recovery.
 */
export function ResilienceOverview({
  resiliencePackage,
  events,
  indexCount,
  onEvaluate,
  onPublish,
  onValidate,
  onDispose,
  message,
}: ResilienceOverviewProps) {
  const canAct =
    resiliencePackage !== null &&
    resiliencePackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && resiliencePackage.metadata.status !== 'Published';
  const plan = resiliencePackage?.recoveryPlan ?? null;

  return (
    <div className="space-y-8" data-testid="resilience-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Resilience
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {resiliencePackage?.metadata.title ??
              'Runtime Resilience Engine'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {resiliencePackage !== null
              ? `${resiliencePackage.id} · v${resiliencePackage.version} · ${resiliencePackage.metadata.status}`
              : 'Deterministický Recovery Plan (bez výkonu obnovy).'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Resilience nikdy neprovádí Recovery, nespouští Restart a nepoužívá
            AI. Výstupem je pouze plán obnovy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEvaluate}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Evaluate Recovery
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

      <section aria-labelledby="res-strategy-heading">
        <h3
          id="res-strategy-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Recovery Strategy
        </h3>
        {plan === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Evaluate Recovery (volitelně po Health / Enforcement).
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {plan.recoveryStrategy}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              severity: {plan.severity} · session: {plan.sessionId} · execution:{' '}
              {plan.runtimeExecutionId ?? '—'} · index: {indexCount}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="res-plan-heading">
        <h3
          id="res-plan-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Recovery Plan
        </h3>
        {plan === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">{plan.id}</p>
            <p className="mt-1 text-[13px] text-builder-muted">
              {plan.metadata.notes}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="res-actions-heading">
        <h3
          id="res-actions-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Recovery Actions
        </h3>
        {plan === null || plan.recommendedSteps.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Žádné doporučené kroky obnovy.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {plan.recommendedSteps.map((action) => (
              <li
                key={action.id}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">
                  Step {action.step}: {action.description}
                </span>
                <span className="mt-0.5 block text-builder-muted">
                  priority {action.priority} · {action.metadata.strategy}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="res-level-heading">
        <h3
          id="res-level-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Estimated Recovery Level
        </h3>
        {plan === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Level" value={plan.estimatedRecoveryLevel} />
            <InfoTile
              label="Health"
              value={plan.metadata.healthStatus ?? '—'}
            />
            <InfoTile
              label="Enforcement"
              value={plan.metadata.enforcementStatus ?? '—'}
            />
            <InfoTile label="Package" value={resiliencePackage!.id} />
          </ul>
        )}
      </section>

      <section aria-labelledby="res-validation-heading">
        <h3
          id="res-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {resiliencePackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {resiliencePackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {resiliencePackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {resiliencePackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="res-events-heading">
        <h3
          id="res-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Resilience Events
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
