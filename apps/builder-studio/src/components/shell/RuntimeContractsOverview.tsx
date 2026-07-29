import type {
  RuntimeContractEvent,
  RuntimeContractPackage,
} from '../../model';

type RuntimeContractsOverviewProps = {
  readonly contractPackage: RuntimeContractPackage | null;
  readonly events: readonly RuntimeContractEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Runtime Contracts Overview (EPIC-BLD-53).
 * Diagnostic projection of public Runtime contracts.
 */
export function RuntimeContractsOverview({
  contractPackage,
  events,
  indexCount,
  onRegister,
  onPublish,
  onValidate,
  onDispose,
  message,
}: RuntimeContractsOverviewProps) {
  const canAct =
    contractPackage !== null &&
    contractPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && contractPackage.metadata.status !== 'Published';
  const contracts = contractPackage?.contracts ?? [];
  const capabilities = [...new Set(contracts.map((item) => item.capability))];
  const versions = [...new Set(contracts.map((item) => item.version))];
  const operations = [
    ...new Set(
      contracts.flatMap((item) =>
        item.operations.map((operation) => operation.operation),
      ),
    ),
  ];
  const compatibility = [
    ...new Set(contracts.map((item) => item.metadata.compatibility)),
  ];

  return (
    <div className="space-y-8" data-testid="runtime-contracts-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Contracts
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {contractPackage?.metadata.title ?? 'Runtime Contract Manager'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {contractPackage !== null
              ? `${contractPackage.id} · v${contractPackage.version} · ${contractPackage.metadata.status}`
              : 'Správa veřejných Runtime kontraktů.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Manager neroutuje API a nemění Runtime. Pouze spravuje veřejné
            kontrakty capability.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Contracts
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

      <section aria-labelledby="contracts-list-heading">
        <h3
          id="contracts-list-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Contracts
        </h3>
        {contracts.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Register Contracts.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {contracts.map((contract) => (
              <li
                key={contract.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {contract.metadata.title}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {contract.capability} · v{contract.version} ·{' '}
                  {contract.metadata.status}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  ops:{' '}
                  {contract.operations
                    .map((operation) => operation.operation)
                    .join(', ')}{' '}
                  · compatibility: {contract.metadata.compatibility}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="contracts-meta-heading">
        <h3
          id="contracts-meta-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Capability · Version · Operations · Compatibility
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          <InfoTile
            label="Capability"
            value={capabilities.length > 0 ? capabilities.join(', ') : '—'}
          />
          <InfoTile
            label="Version"
            value={versions.length > 0 ? versions.join(', ') : '—'}
          />
          <InfoTile
            label="Operations"
            value={operations.length > 0 ? operations.join(', ') : '—'}
          />
          <InfoTile
            label="Compatibility"
            value={compatibility.length > 0 ? compatibility.join(', ') : '—'}
          />
        </ul>
        {contractPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">
            package: {contractPackage.id} · contracts: {contracts.length} ·
            index: {indexCount}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="contracts-validation-heading">
        <h3
          id="contracts-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {contractPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {contractPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {contractPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {contractPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="contracts-events-heading">
        <h3
          id="contracts-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Contract Events
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
