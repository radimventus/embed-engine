import type {
  PublishedObjectEvent,
  PublishedObjectPackage,
} from '../../model';

type PublishedObjectsOverviewProps = {
  readonly registryPackage: PublishedObjectPackage | null;
  readonly events: readonly PublishedObjectEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onArchive: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Published Objects Overview (EPIC-BLD-56).
 * Diagnostic projection of local Published Object Registry.
 */
export function PublishedObjectsOverview({
  registryPackage,
  events,
  indexCount,
  onRegister,
  onArchive,
  onValidate,
  onDispose,
  message,
}: PublishedObjectsOverviewProps) {
  const canAct =
    registryPackage !== null &&
    registryPackage.metadata.status !== 'Disposed';
  const objects = registryPackage?.catalog.objects ?? [];
  const archiveTarget = objects.find((item) => item.status !== 'Archived');

  return (
    <div className="space-y-8" data-testid="published-objects-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Published Objects
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {registryPackage?.metadata.title ?? 'Published Object Registry'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {registryPackage !== null
              ? `${registryPackage.id} · v${registryPackage.version} · ${registryPackage.metadata.status}`
              : 'Centrální registr publikovaných objektů.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Registry nemění Object Package. Pouze eviduje publikované objekty.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Published Objects
          </button>
          <button
            type="button"
            onClick={onArchive}
            disabled={archiveTarget === undefined}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Archive
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

      <section aria-labelledby="po-list-heading">
        <h3
          id="po-list-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Published Objects
        </h3>
        {objects.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Register Published Objects.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {objects.map((object) => (
              <li
                key={object.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {object.metadata.title}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {object.objectId} · v{object.version} · pub{' '}
                  {object.publicationVersion} · {object.status}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  published:{' '}
                  {new Date(object.createdAt).toLocaleString('cs-CZ')} ·
                  manifest: {object.manifest.id}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="po-meta-heading">
        <h3
          id="po-meta-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Version · Status · Publication Date
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          <InfoTile
            label="Version"
            value={
              [...new Set(objects.map((item) => item.version))].join(', ') ||
              '—'
            }
          />
          <InfoTile
            label="Status"
            value={
              [...new Set(objects.map((item) => item.status))].join(', ') ||
              '—'
            }
          />
          <InfoTile
            label="Publication Date"
            value={
              objects[0]
                ? new Date(objects[0].createdAt).toLocaleDateString('cs-CZ')
                : '—'
            }
          />
        </ul>
        {registryPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">
            catalog: {registryPackage.catalog.id} · objects: {objects.length} ·
            index: {indexCount}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="po-manifest-heading">
        <h3
          id="po-manifest-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Manifest
        </h3>
        {objects.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Manifest zatím není k dispozici.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {objects.map((object) => (
              <li
                key={`${object.id}-manifest`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {object.manifest.id}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  runtime: {object.manifest.runtimeVersion} · contract:{' '}
                  {object.manifest.contractVersion} · compatibility:{' '}
                  {object.manifest.compatibilityVersion}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="po-validation-heading">
        <h3
          id="po-validation-heading"
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

      <section aria-labelledby="po-events-heading">
        <h3
          id="po-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Published Object Events
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
