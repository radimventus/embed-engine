import type {
  ExportCertificationEvent,
  ExportCertificationPackage,
} from '../../model';

type ExportCertificationOverviewProps = {
  readonly certificationPackage: ExportCertificationPackage | null;
  readonly events: readonly ExportCertificationEvent[];
  readonly indexCount: number;
  readonly onCertify: () => void;
  readonly onValidate: () => void;
  readonly onRevoke: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function ExportCertificationOverview({
  certificationPackage,
  events,
  indexCount,
  onCertify,
  onValidate,
  onRevoke,
  onDispose,
  message,
}: ExportCertificationOverviewProps) {
  const certificate = certificationPackage?.certificate ?? null;

  return (
    <div className="space-y-8" data-testid="export-certification-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Export Certification
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {certificationPackage?.metadata.title ?? 'Export Certification Service'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {certificationPackage !== null
              ? `${certificationPackage.id} · v${certificationPackage.version} · ${certificationPackage.metadata.status}`
              : 'Certifikacni vrstva pripravenosti exportu.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCertify}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Certify Export
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={certificationPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onRevoke}
            disabled={certificationPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Revoke
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={certificationPackage === null}
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

      <section aria-labelledby="export-certification-summary">
        <h3
          id="export-certification-summary"
          className="text-base font-semibold text-builder-ink"
        >
          Artifact · Schema · Certification · Status · Validation
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-5">
          <InfoTile label="Artifact" value={certificate?.artifactId ?? '—'} />
          <InfoTile label="Schema" value={certificate?.schemaVersion ?? '—'} />
          <InfoTile
            label="Certification"
            value={certificate?.certificationVersion ?? '—'}
          />
          <InfoTile label="Status" value={certificate?.status ?? '—'} />
          <InfoTile
            label="Validation"
            value={
              certificationPackage?.validation == null
                ? 'Pending'
                : certificationPackage.validation.valid
                  ? 'Valid'
                  : 'Invalid'
            }
          />
        </ul>
        {certificationPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">index: {indexCount}</p>
        ) : null}
      </section>

      <section aria-labelledby="export-certification-events">
        <h3
          id="export-certification-events"
          className="text-base font-semibold text-builder-ink"
        >
          Export Certification Events
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
                  <span className="font-medium text-builder-ink">{event.type}</span>
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

