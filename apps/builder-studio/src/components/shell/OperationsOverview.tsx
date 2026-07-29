import type {
  RuntimeOperationsEvent,
  RuntimeOperationsPackage,
} from '../../model';

type OperationsOverviewProps = {
  readonly operationsPackage: RuntimeOperationsPackage | null;
  readonly events: readonly RuntimeOperationsEvent[];
  readonly indexCount: number;
  readonly onCollect: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Operations Overview (EPIC-BLD-47).
 * Diagnostic projection of aggregated Production Layer statuses.
 */
export function OperationsOverview({
  operationsPackage,
  events,
  indexCount,
  onCollect,
  onPublish,
  onValidate,
  onDispose,
  message,
}: OperationsOverviewProps) {
  const canAct =
    operationsPackage !== null &&
    operationsPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && operationsPackage.metadata.status !== 'Published';
  const snapshot = operationsPackage?.snapshot ?? null;

  return (
    <div className="space-y-8" data-testid="operations-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Operations
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {operationsPackage?.metadata.title ??
              'Runtime Operations Dashboard'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {operationsPackage !== null
              ? `${operationsPackage.id} · v${operationsPackage.version} · ${operationsPackage.metadata.status}`
              : 'Jednotná projekce provozního stavu.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Dashboard nic nevyhodnocuje a nic nevytváří. Pouze agreguje již
            publikované artefakty Production Layer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCollect}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Collect Operations
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

      <section aria-labelledby="ops-runtime-heading">
        <h3
          id="ops-runtime-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime Status
        </h3>
        {snapshot === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Collect Operations.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {snapshot.runtimeExecutionId ?? '—'}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              session: {snapshot.metadata.sessionId} · index: {indexCount}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="ops-grid-heading">
        <h3
          id="ops-grid-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Capability Projection
        </h3>
        {snapshot === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Policy" value={snapshot.policyStatus} />
            <InfoTile label="Governance" value={snapshot.governanceStatus} />
            <InfoTile label="Health" value={snapshot.healthStatus} />
            <InfoTile label="Audit" value={snapshot.auditStatus} />
            <InfoTile label="Enforcement" value={snapshot.enforcementStatus} />
            <InfoTile label="Recovery" value={snapshot.recoveryStatus} />
          </ul>
        )}
      </section>

      <section aria-labelledby="ops-report-heading">
        <h3
          id="ops-report-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Last Report
        </h3>
        {snapshot === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {snapshot.metadata.lastReportId ?? '—'}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              status: {snapshot.metadata.lastReportStatus ?? '—'} ·
              observability: {snapshot.metadata.observabilityStatus}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="ops-validation-heading">
        <h3
          id="ops-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {operationsPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {operationsPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {operationsPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {operationsPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="ops-events-heading">
        <h3
          id="ops-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Operations Events
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
