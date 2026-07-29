import type {
  ExportSchemaEvent,
  ExportSchemaPackage,
} from '../../model';

type ExportSchemaOverviewProps = {
  readonly schemaPackage: ExportSchemaPackage | null;
  readonly events: readonly ExportSchemaEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function ExportSchemaOverview({
  schemaPackage,
  events,
  indexCount,
  onRegister,
  onValidate,
  onDispose,
  message,
}: ExportSchemaOverviewProps) {
  const schemas = schemaPackage?.schemas ?? [];
  return (
    <div className="space-y-8" data-testid="export-schema-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Export Schemas
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {schemaPackage?.metadata.title ?? 'Export Schema Registry'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {schemaPackage !== null
              ? `${schemaPackage.id} · v${schemaPackage.version} · ${schemaPackage.metadata.status}`
              : 'Centralni registr exportnich schemat platformy.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Schema
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={schemaPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={schemaPackage === null}
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

      <section aria-labelledby="export-schema-summary">
        <h3 id="export-schema-summary" className="text-base font-semibold text-builder-ink">
          Schema Name · Version · Status · Validation
        </h3>
        {schemas.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zadna registrovana schemata.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {schemas.map((s) => (
              <li key={s.id} className="grid grid-cols-4 gap-2">
                <InfoTile label="Name" value={s.name} />
                <InfoTile label="Version" value={s.schemaVersion} />
                <InfoTile label="Status" value={s.status} />
                <InfoTile
                  label="Validation"
                  value={
                    schemaPackage?.validation == null
                      ? 'Pending'
                      : schemaPackage.validation.valid
                        ? 'Valid'
                        : 'Invalid'
                  }
                />
              </li>
            ))}
          </ul>
        )}
        {schemaPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">index: {indexCount}</p>
        ) : null}
      </section>

      <section aria-labelledby="export-schema-events">
        <h3 id="export-schema-events" className="text-base font-semibold text-builder-ink">
          Export Schema Events
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
                  <span className="mt-0.5 block text-builder-muted">{event.message}</span>
                </div>
                <time className="shrink-0 text-[11px] text-builder-muted">
                  {new Date(event.at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function InfoTile({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-[12px] border border-[#DDE5EF] px-4 py-3">
      <p className="text-[12px] uppercase tracking-wide text-builder-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-builder-ink">{value}</p>
    </div>
  );
}
