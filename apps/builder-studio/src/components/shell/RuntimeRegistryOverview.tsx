import type {
  RuntimeRegistryEvent,
  RuntimeRegistryPackage,
} from '../../model';

type RuntimeRegistryOverviewProps = {
  readonly registryPackage: RuntimeRegistryPackage | null;
  readonly events: readonly RuntimeRegistryEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Runtime Registry Overview (EPIC-BLD-49).
 * Diagnostic projection of registered published Runtime packages.
 */
export function RuntimeRegistryOverview({
  registryPackage,
  events,
  indexCount,
  onRegister,
  onPublish,
  onValidate,
  onDispose,
  message,
}: RuntimeRegistryOverviewProps) {
  const canAct =
    registryPackage !== null && registryPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && registryPackage.metadata.status !== 'Published';
  const catalog = registryPackage?.catalog ?? null;
  const entries = catalog?.entries ?? [];
  const packageTypes = [...new Set(entries.map((item) => item.packageType))];
  const versions = [...new Set(entries.map((item) => item.version))];
  const sources = [...new Set(entries.map((item) => item.source))];

  return (
    <div className="space-y-8" data-testid="runtime-registry-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Registry
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {registryPackage?.metadata.title ?? 'Runtime Integration Registry'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {registryPackage !== null
              ? `${registryPackage.id} · v${registryPackage.version} · ${registryPackage.metadata.status}`
              : 'Evidence publikovaných Runtime Package.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Registry nevytváří Package a neprovádí agregaci. Pouze eviduje již
            publikované artefakty z Integration Hub.
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
            Publish Registry
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

      <section aria-labelledby="reg-packages-heading">
        <h3
          id="reg-packages-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Registered Packages
        </h3>
        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Register Packages.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {entry.metadata.title}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {entry.packageType} · {entry.packageId} · v{entry.version}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  source: {entry.source} · status: {entry.metadata.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="reg-meta-heading">
        <h3
          id="reg-meta-heading"
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

      <section aria-labelledby="reg-time-heading">
        <h3
          id="reg-time-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Registration Time
        </h3>
        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {entries.map((entry) => (
              <li
                key={`time-${entry.id}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3 text-[13px]"
              >
                <span className="font-medium text-builder-ink">
                  {entry.packageId}
                </span>
                <span className="mt-1 block text-builder-muted">
                  registered:{' '}
                  {new Date(entry.registeredAt).toLocaleString('cs-CZ')}
                  {entry.metadata.publishedAt
                    ? ` · published: ${new Date(entry.metadata.publishedAt).toLocaleString('cs-CZ')}`
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="reg-catalog-heading">
        <h3
          id="reg-catalog-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Registry Catalog
        </h3>
        {catalog === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {catalog.id}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              entries: {catalog.entries.length} · index: {indexCount} ·
              session: {catalog.metadata.sessionId}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              package status: {registryPackage?.metadata.status ?? '—'}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="reg-validation-heading">
        <h3
          id="reg-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {registryPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {registryPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {registryPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {registryPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="reg-events-heading">
        <h3
          id="reg-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Registry Events
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
