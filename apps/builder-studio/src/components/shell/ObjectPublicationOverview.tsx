import type {
  ObjectPublicationEvent,
  PublicationPackage,
} from '../../model';

type ObjectPublicationOverviewProps = {
  readonly publicationPackage: PublicationPackage | null;
  readonly events: readonly ObjectPublicationEvent[];
  readonly indexCount: number;
  readonly onBuild: () => void;
  readonly onValidate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Object Publication Overview (EPIC-BLD-55).
 * Diagnostic projection of local publication pipeline — no remote deploy.
 */
export function ObjectPublicationOverview({
  publicationPackage,
  events,
  indexCount,
  onBuild,
  onValidate,
  onPublish,
  onDispose,
  message,
}: ObjectPublicationOverviewProps) {
  const canAct =
    publicationPackage !== null &&
    publicationPackage.metadata.status !== 'Disposed';
  const canValidate =
    canAct &&
    publicationPackage.objectPackage.objectId !== 'object-pending' &&
    publicationPackage.metadata.status !== 'Draft';
  const canPublish =
    canAct &&
    (publicationPackage.metadata.status === 'Validated' ||
      (publicationPackage.validation?.valid === true &&
        publicationPackage.metadata.status !== 'Published'));
  const objectPackage = publicationPackage?.objectPackage ?? null;
  const isPending = objectPackage?.objectId === 'object-pending';

  return (
    <div className="space-y-8" data-testid="object-publication-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Object Publication
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {publicationPackage?.metadata.title ?? 'Object Publication Pipeline'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {publicationPackage !== null
              ? `${publicationPackage.id} · v${publicationPackage.version} · ${publicationPackage.metadata.status}`
              : 'Lokální pipeline pro publikovatelný Object Package.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Pipeline nemění Runtime ani Experience. Pouze připravuje
            publikovatelný artefakt.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBuild}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Build Publication
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={!canValidate}
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
            Publish Object
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

      <section aria-labelledby="pub-object-heading">
        <h3
          id="pub-object-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Object · Version · Publication Status
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          <InfoTile
            label="Object"
            value={
              isPending || objectPackage === null
                ? '—'
                : objectPackage.metadata.title
            }
          />
          <InfoTile
            label="Version"
            value={
              isPending || objectPackage === null
                ? '—'
                : objectPackage.version
            }
          />
          <InfoTile
            label="Publication Status"
            value={publicationPackage?.metadata.status ?? '—'}
          />
        </ul>
        {objectPackage !== null && !isPending ? (
          <p className="mt-3 text-[13px] text-builder-muted">
            objectId: {objectPackage.objectId} · package:{' '}
            {objectPackage.id} · checksum: {objectPackage.checksum} · index:{' '}
            {indexCount}
          </p>
        ) : (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Build Publication.
          </p>
        )}
      </section>

      <section aria-labelledby="pub-runtime-heading">
        <h3
          id="pub-runtime-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime Version · Manifest
        </h3>
        {objectPackage === null || isPending ? (
          <p className="mt-3 text-sm text-builder-muted">
            Manifest zatím není sestaven.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {objectPackage.manifest.id}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              runtime: {objectPackage.manifest.runtimeVersion} · contract:{' '}
              {objectPackage.manifest.contractVersion} · compatibility:{' '}
              {objectPackage.manifest.compatibilityVersion}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              objectVersion: {objectPackage.manifest.objectVersion} · assets:{' '}
              {objectPackage.assets.length}
            </p>
            <ul className="mt-2 space-y-1">
              {objectPackage.assets.map((asset) => (
                <li key={asset.id} className="text-[13px] text-builder-muted">
                  [{asset.kind}] {asset.label} · {asset.ref}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="pub-validation-heading">
        <h3
          id="pub-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {publicationPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {publicationPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {publicationPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {publicationPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="pub-events-heading">
        <h3
          id="pub-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Publication Events
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
