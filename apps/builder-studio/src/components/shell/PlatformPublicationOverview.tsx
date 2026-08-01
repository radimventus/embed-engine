import type {
  PlatformPublicationEvent,
  PlatformPublicationPackage,
} from '../../model';

type PlatformPublicationOverviewProps = {
  readonly catalogPackage: PlatformPublicationPackage | null;
  readonly events: readonly PlatformPublicationEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onRefresh: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Platform Publication Catalog Overview (EPIC-BLD-57).
 * Diagnostic projection — no registry mutation or deployment.
 */
export function PlatformPublicationOverview({
  catalogPackage,
  events,
  indexCount,
  onRegister,
  onRefresh,
  onValidate,
  onDispose,
  message,
}: PlatformPublicationOverviewProps) {
  const canAct =
    catalogPackage !== null && catalogPackage.metadata.status !== 'Disposed';
  const entries = catalogPackage?.snapshot.entries ?? [];

  return (
    <div className="space-y-8" data-testid="platform-publication-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Platform Publication Catalog
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {catalogPackage?.metadata.title ?? 'Platform Publication Catalog'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {catalogPackage !== null
              ? `${catalogPackage.id} · v${catalogPackage.version} · ${catalogPackage.metadata.status}`
              : 'Veřejný katalog publikovaných objektů pro studia platformy.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Katalog nemění Published Object Registry. Pouze agreguje veřejnou
            projekci.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Catalog
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={!canAct || entries.length === 0}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Refresh
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

      <section aria-labelledby="ppc-objects-heading">
        <h3
          id="ppc-objects-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Published Objects
        </h3>
        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Register Catalog.
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
                  {entry.objectId} · pub {entry.publicationVersion} ·{' '}
                  {entry.status}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  category: {entry.category} · visibility: {entry.visibility}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ppc-meta-heading">
        <h3
          id="ppc-meta-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Categories · Visibility · Version
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          <InfoTile
            label="Categories"
            value={
              [...new Set(entries.map((item) => item.category))].join(', ') ||
              '—'
            }
          />
          <InfoTile
            label="Visibility"
            value={
              [...new Set(entries.map((item) => item.visibility))].join(
                ', ',
              ) || '—'
            }
          />
          <InfoTile
            label="Version"
            value={
              [
                ...new Set(entries.map((item) => item.publicationVersion)),
              ].join(', ') || '—'
            }
          />
        </ul>
        {catalogPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">
            snapshot: {catalogPackage.snapshot.id} · entries: {entries.length}{' '}
            · index: {indexCount}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="ppc-validation-heading">
        <h3
          id="ppc-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {catalogPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {catalogPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {catalogPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {catalogPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="ppc-events-heading">
        <h3
          id="ppc-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Platform Publication Events
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
