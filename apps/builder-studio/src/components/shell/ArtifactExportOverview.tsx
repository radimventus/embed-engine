import type {
  ArtifactExportEvent,
  ArtifactExportPackage,
} from '../../model';

type ArtifactExportOverviewProps = {
  readonly exportPackage: ArtifactExportPackage | null;
  readonly events: readonly ArtifactExportEvent[];
  readonly indexCount: number;
  readonly onBuild: () => void;
  readonly onValidate: () => void;
  readonly onExport: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function ArtifactExportOverview({
  exportPackage,
  events,
  indexCount,
  onBuild,
  onValidate,
  onExport,
  onDispose,
  message,
}: ArtifactExportOverviewProps) {
  const model = exportPackage?.exportModel ?? null;
  return (
    <div className="space-y-8" data-testid="artifact-export-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Artifact Export
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {exportPackage?.metadata.title ?? 'Artifact Export Contract'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {exportPackage !== null
              ? `${exportPackage.id} · v${exportPackage.version} · ${exportPackage.metadata.status}`
              : 'Deterministicky definovany exportni kontrakt artefaktu.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBuild}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Build Export
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={exportPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={exportPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Export
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={exportPackage === null}
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

      <section aria-labelledby="artifact-export-summary">
        <h3
          id="artifact-export-summary"
          className="text-base font-semibold text-builder-ink"
        >
          Artifact · Export Version · Schema Version · Status · Validation
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-5">
          <InfoTile label="Artifact" value={model?.artifactId ?? '—'} />
          <InfoTile label="Export Version" value={model?.exportVersion ?? '—'} />
          <InfoTile label="Schema Version" value={model?.schemaVersion ?? '—'} />
          <InfoTile label="Status" value={model?.metadata.status ?? '—'} />
          <InfoTile
            label="Validation"
            value={
              exportPackage?.validation == null
                ? 'Pending'
                : exportPackage.validation.valid
                  ? 'Valid'
                  : 'Invalid'
            }
          />
        </ul>
        {exportPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">index: {indexCount}</p>
        ) : null}
      </section>

      <section aria-labelledby="artifact-export-events">
        <h3
          id="artifact-export-events"
          className="text-base font-semibold text-builder-ink"
        >
          Artifact Export Events
        </h3>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatim zadne udalosti.</p>
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
