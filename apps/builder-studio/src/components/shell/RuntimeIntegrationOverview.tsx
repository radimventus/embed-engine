import type {
  RuntimeIntegrationEvent,
  RuntimeIntegrationPackage,
} from '../../model';

type RuntimeIntegrationOverviewProps = {
  readonly integrationPackage: RuntimeIntegrationPackage | null;
  readonly events: readonly RuntimeIntegrationEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Runtime Integration Overview (EPIC-BLD-48).
 * Diagnostic projection of registered published Runtime packages.
 */
export function RuntimeIntegrationOverview({
  integrationPackage,
  events,
  indexCount,
  onRegister,
  onPublish,
  onValidate,
  onDispose,
  message,
}: RuntimeIntegrationOverviewProps) {
  const canAct =
    integrationPackage !== null &&
    integrationPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && integrationPackage.metadata.status !== 'Published';
  const catalog = integrationPackage?.catalog ?? null;
  const records = catalog?.records ?? [];
  const packageTypes = [...new Set(records.map((item) => item.packageType))];
  const versions = [...new Set(records.map((item) => item.version))];
  const sources = [...new Set(records.map((item) => item.source))];

  return (
    <div className="space-y-8" data-testid="runtime-integration-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Integration
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {integrationPackage?.metadata.title ?? 'Runtime Integration Hub'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {integrationPackage !== null
              ? `${integrationPackage.id} · v${integrationPackage.version} · ${integrationPackage.metadata.status}`
              : 'Katalog publikovaných Runtime Package.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Hub nevytváří Runtime objekty. Pouze registruje a zpřístupňuje již
            publikované artefakty.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Packages
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
            Publish Catalog
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

      <section aria-labelledby="int-packages-heading">
        <h3
          id="int-packages-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Registered Packages
        </h3>
        {records.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Register Packages.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {records.map((record) => (
              <li
                key={record.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {record.metadata.title}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {record.packageType} · {record.packageId} · v
                  {record.version}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  source: {record.source} · status: {record.metadata.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="int-meta-heading">
        <h3
          id="int-meta-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Package Types · Versions · Sources
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          <InfoTile
            label="Package Types"
            value={packageTypes.length > 0 ? packageTypes.join(', ') : '—'}
          />
          <InfoTile
            label="Versions"
            value={versions.length > 0 ? versions.join(', ') : '—'}
          />
          <InfoTile
            label="Sources"
            value={sources.length > 0 ? sources.join(', ') : '—'}
          />
        </ul>
      </section>

      <section aria-labelledby="int-catalog-heading">
        <h3
          id="int-catalog-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Published Catalog
        </h3>
        {catalog === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {catalog.id}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              records: {catalog.records.length} · index: {indexCount} · session:{' '}
              {catalog.metadata.sessionId}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              package status: {integrationPackage?.metadata.status ?? '—'}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="int-validation-heading">
        <h3
          id="int-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {integrationPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {integrationPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {integrationPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {integrationPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="int-events-heading">
        <h3
          id="int-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Integration Events
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
