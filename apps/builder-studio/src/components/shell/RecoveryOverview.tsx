import type {
  RuntimeRecoveryEvent,
  RuntimeRecoveryPackage,
} from '../../model';

type RecoveryOverviewProps = {
  readonly recoveryPackage: RuntimeRecoveryPackage | null;
  readonly events: readonly RuntimeRecoveryEvent[];
  readonly indexCount: number;
  readonly onBuild: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Recovery Overview (EPIC-BLD-43).
 * Diagnostic projection of Recovery Sequence — never executes recovery.
 */
export function RecoveryOverview({
  recoveryPackage,
  events,
  indexCount,
  onBuild,
  onPublish,
  onValidate,
  onDispose,
  message,
}: RecoveryOverviewProps) {
  const canAct =
    recoveryPackage !== null && recoveryPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && recoveryPackage.metadata.status !== 'Published';
  const sequence = recoveryPackage?.sequence ?? null;

  return (
    <div className="space-y-8" data-testid="recovery-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Recovery
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {recoveryPackage?.metadata.title ??
              'Runtime Recovery Orchestrator'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {recoveryPackage !== null
              ? `${recoveryPackage.id} · v${recoveryPackage.version} · ${recoveryPackage.metadata.status}`
              : 'Deterministická Recovery Sequence (bez výkonu obnovy).'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Orchestrátor nikdy nespouští Recovery, nerestartuje Runtime a
            nepoužívá AI. Výstupem je pouze sekvence kroků.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBuild}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Build Sequence
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

      <section aria-labelledby="rec-plan-heading">
        <h3
          id="rec-plan-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Recovery Plan
        </h3>
        {sequence === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Build Sequence (volitelně po Resilience).
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {sequence.metadata.recoveryStrategy ?? '—'}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              plan: {sequence.metadata.planId ?? 'demo'} · session:{' '}
              {sequence.metadata.sessionId} · index: {indexCount}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="rec-sequence-heading">
        <h3
          id="rec-sequence-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Recovery Sequence
        </h3>
        {sequence === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {sequence.id}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              risk: {sequence.riskLevel} · execution:{' '}
              {sequence.runtimeExecutionId ?? '—'}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="rec-steps-heading">
        <h3
          id="rec-steps-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Ordered Steps
        </h3>
        {sequence === null || sequence.steps.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Žádné seřazené kroky.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {sequence.steps.map((step) => (
              <li
                key={step.id}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">
                  #{step.order} [{step.action}] {step.description}
                </span>
                <span className="mt-0.5 block text-builder-muted">
                  dependsOn:{' '}
                  {step.dependsOn.length === 0
                    ? '—'
                    : step.dependsOn.join(', ')}{' '}
                  · ~{step.metadata.estimatedSeconds}s
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="rec-duration-heading">
        <h3
          id="rec-duration-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Estimated Duration
        </h3>
        {sequence === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile
              label="Duration"
              value={`${sequence.estimatedDuration}s`}
            />
            <InfoTile label="Risk" value={sequence.riskLevel} />
            <InfoTile
              label="Steps"
              value={String(sequence.steps.length)}
            />
            <InfoTile label="Package" value={recoveryPackage!.id} />
          </ul>
        )}
      </section>

      <section aria-labelledby="rec-validation-heading">
        <h3
          id="rec-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {recoveryPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {recoveryPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {recoveryPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {recoveryPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="rec-events-heading">
        <h3
          id="rec-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Recovery Events
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
