import type {
  ClientPublicationEvent,
  ClientPublicationPackage,
} from '../../model';

type ClientPublicationOverviewProps = {
  readonly publicationPackage: ClientPublicationPackage | null;
  readonly events: readonly ClientPublicationEvent[];
  readonly indexCount: number;
  readonly onLoad: () => void;
  readonly onTransform: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function ClientPublicationOverview({
  publicationPackage,
  events,
  indexCount,
  onLoad,
  onTransform,
  onPublish,
  onValidate,
  onDispose,
  message,
}: ClientPublicationOverviewProps) {
  const canAct =
    publicationPackage !== null &&
    publicationPackage.metadata.status !== 'Disposed';
  const model = publicationPackage?.publicationModel ?? null;

  return (
    <div className="space-y-8" data-testid="client-publication-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Client Publication
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {publicationPackage?.metadata.title ?? 'Client Publication Adapter'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {publicationPackage !== null
              ? `${publicationPackage.id} · v${publicationPackage.version} · ${publicationPackage.metadata.status}`
              : 'Adaptační vrstva mezi Builder Studio a Client Studio.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Adapter nezná interní Client Studio. Pouze převádí Builder
            artefakty na Client input.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onLoad}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Load Publication
          </button>
          <button
            type="button"
            onClick={onTransform}
            disabled={!canAct}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Transform
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
            disabled={!canAct}
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

      <section aria-labelledby="client-publication-summary">
        <h3
          id="client-publication-summary"
          className="text-base font-semibold text-builder-ink"
        >
          Publication · Object · Version · Status
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-4">
          <InfoTile label="Publication" value={model?.publicationId ?? '—'} />
          <InfoTile label="Object" value={model?.objectId ?? '—'} />
          <InfoTile label="Version" value={model?.version ?? '—'} />
          <InfoTile
            label="Status"
            value={model?.metadata.status ?? publicationPackage?.metadata.status ?? '—'}
          />
        </ul>
        {publicationPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">
            model: {publicationPackage.publicationModel.id} · assets:{' '}
            {publicationPackage.publicationModel.assets.length} · index: {indexCount}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="client-publication-validation">
        <h3
          id="client-publication-validation"
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

      <section aria-labelledby="client-publication-events">
        <h3
          id="client-publication-events"
          className="text-base font-semibold text-builder-ink"
        >
          Client Publication Events
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
