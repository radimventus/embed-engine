import type {
  RuntimeGovernanceEvent,
  RuntimeGovernancePackage,
} from '../../model';

type GovernanceOverviewProps = {
  readonly governancePackage: RuntimeGovernancePackage | null;
  readonly events: readonly RuntimeGovernanceEvent[];
  readonly indexCount: number;
  readonly onEvaluate: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Governance Overview (EPIC-BLD-39).
 * Operational projection only — never mutates Runtime / State / Knowledge.
 */
export function GovernanceOverview({
  governancePackage,
  events,
  indexCount,
  onEvaluate,
  onPublish,
  onValidate,
  onDispose,
  message,
}: GovernanceOverviewProps) {
  const canAct =
    governancePackage !== null &&
    governancePackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && governancePackage.metadata.status !== 'Published';

  return (
    <div className="space-y-8" data-testid="governance-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Governance
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {governancePackage?.metadata.title ?? 'Runtime Governance Engine'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {governancePackage !== null
              ? `${governancePackage.id} · v${governancePackage.version} · ${governancePackage.metadata.status}`
              : 'Deterministické vyhodnocení souladu s provozními pravidly.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Governance nikdy nemění Runtime, State, Knowledge ani Execution.
            Nepoužívá AI — pouze vyhodnocuje compliance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEvaluate}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Evaluate Governance
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

      <section aria-labelledby="gov-status-heading">
        <h3
          id="gov-status-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Overall Status
        </h3>
        {governancePackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Evaluate Governance (volitelně po Observability / Health /
            Audit).
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {governancePackage.evaluation.overallStatus}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              session: {governancePackage.evaluation.sessionId} · execution:{' '}
              {governancePackage.evaluation.runtimeExecutionId ?? '—'} · index:{' '}
              {indexCount}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="gov-score-heading">
        <h3
          id="gov-score-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Governance Score
        </h3>
        {governancePackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {governancePackage.evaluation.score}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              rules evaluated:{' '}
              {governancePackage.evaluation.metadata.evaluatedRuleCount}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="gov-passed-heading">
        <h3
          id="gov-passed-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Passed Rules
        </h3>
        {governancePackage === null ||
        governancePackage.evaluation.passedRules.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Žádná splněná pravidla.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {governancePackage.evaluation.passedRules.map((rule) => (
              <li
                key={rule.id}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">
                  {rule.name}
                </span>
                <span className="mt-0.5 block text-builder-muted">
                  {rule.category} · {rule.metadata.code}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="gov-failed-heading">
        <h3
          id="gov-failed-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Failed Rules
        </h3>
        {governancePackage === null ||
        governancePackage.evaluation.failedRules.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Žádná nesplněná pravidla.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {governancePackage.evaluation.failedRules.map((rule) => (
              <li
                key={rule.id}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">
                  [{rule.severity}] {rule.name}
                </span>
                <span className="mt-0.5 block text-builder-muted">
                  {rule.category} · {rule.description}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="gov-validation-heading">
        <h3
          id="gov-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {governancePackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {governancePackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {governancePackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {governancePackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="gov-events-heading">
        <h3
          id="gov-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Governance Events
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
