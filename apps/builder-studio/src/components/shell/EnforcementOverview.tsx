import type {
  RuntimeEnforcementEvent,
  RuntimeEnforcementPackage,
} from '../../model';

type EnforcementOverviewProps = {
  readonly enforcementPackage: RuntimeEnforcementPackage | null;
  readonly events: readonly RuntimeEnforcementEvent[];
  readonly indexCount: number;
  readonly onEvaluate: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Enforcement Overview (EPIC-BLD-41).
 * Diagnostic projection of Enforcement Decision — never executes Runtime actions.
 */
export function EnforcementOverview({
  enforcementPackage,
  events,
  indexCount,
  onEvaluate,
  onPublish,
  onValidate,
  onDispose,
  message,
}: EnforcementOverviewProps) {
  const canAct =
    enforcementPackage !== null &&
    enforcementPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && enforcementPackage.metadata.status !== 'Published';

  return (
    <div className="space-y-8" data-testid="enforcement-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Enforcement
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {enforcementPackage?.metadata.title ??
              'Runtime Policy Enforcement Engine'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {enforcementPackage !== null
              ? `${enforcementPackage.id} · v${enforcementPackage.version} · ${enforcementPackage.metadata.status}`
              : 'Deterministické Enforcement Decision (bez výkonu).'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Enforcement nikdy nezastavuje Runtime, nevykonává BLOCK a nepoužívá
            AI. Výstupem je pouze doporučené rozhodnutí.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEvaluate}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Evaluate Enforcement
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

      <section aria-labelledby="enf-status-heading">
        <h3
          id="enf-status-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Decision Status
        </h3>
        {enforcementPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Evaluate Enforcement (volitelně po Governance).
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {enforcementPackage.decision.status}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              session: {enforcementPackage.decision.sessionId} · execution:{' '}
              {enforcementPackage.decision.runtimeExecutionId ?? '—'} · index:{' '}
              {indexCount}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="enf-action-heading">
        <h3
          id="enf-action-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Recommended Action
        </h3>
        {enforcementPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {enforcementPackage.decision.recommendedAction}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              {enforcementPackage.decision.reason}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="enf-rules-heading">
        <h3
          id="enf-rules-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Triggered Rules
        </h3>
        {enforcementPackage === null ||
        enforcementPackage.triggeredRules.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Žádná spuštěná enforcement pravidla.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {enforcementPackage.triggeredRules.map((rule) => (
              <li
                key={rule.id}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">
                  [{rule.action}] {rule.id}
                </span>
                <span className="mt-0.5 block text-builder-muted">
                  priority {rule.priority} · {rule.condition} · policy{' '}
                  {rule.policyId}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="enf-summary-heading">
        <h3
          id="enf-summary-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Evaluation Summary
        </h3>
        {enforcementPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile
              label="Governance"
              value={
                enforcementPackage.decision.metadata.governanceStatus ?? '—'
              }
            />
            <InfoTile
              label="Triggered"
              value={String(enforcementPackage.triggeredRules.length)}
            />
            <InfoTile
              label="Decision"
              value={enforcementPackage.decision.id}
            />
            <InfoTile label="Package" value={enforcementPackage.id} />
          </ul>
        )}
      </section>

      <section aria-labelledby="enf-validation-heading">
        <h3
          id="enf-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {enforcementPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {enforcementPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {enforcementPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {enforcementPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="enf-events-heading">
        <h3
          id="enf-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Enforcement Events
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
