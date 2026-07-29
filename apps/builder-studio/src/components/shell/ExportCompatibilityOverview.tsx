import type {
  ExportCompatibilityEvent,
  ExportCompatibilityPackage,
} from '../../model';

type ExportCompatibilityOverviewProps = {
  readonly compatibilityPackage: ExportCompatibilityPackage | null;
  readonly events: readonly ExportCompatibilityEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function ExportCompatibilityOverview({
  compatibilityPackage,
  events,
  indexCount,
  onRegister,
  onValidate,
  onDispose,
  message,
}: ExportCompatibilityOverviewProps) {
  const items = compatibilityPackage?.compatibilities ?? [];
  return (
    <div className="space-y-8" data-testid="export-compatibility-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Export Compatibility
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {compatibilityPackage?.metadata.title ?? 'Export Compatibility Registry'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {compatibilityPackage !== null
              ? `${compatibilityPackage.id} · v${compatibilityPackage.version} · ${compatibilityPackage.metadata.status}`
              : 'Registr kompatibility exportnich schemat.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onRegister} className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white">
            Register Compatibility
          </button>
          <button type="button" onClick={onValidate} disabled={compatibilityPackage === null} className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40">
            Validate
          </button>
          <button type="button" onClick={onDispose} disabled={compatibilityPackage === null} className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40">
            Dispose
          </button>
        </div>
      </div>

      {message !== null ? (
        <p className="rounded-[10px] border border-[#DDE5EF] px-4 py-3 text-sm text-builder-muted">{message}</p>
      ) : null}

      <section aria-labelledby="export-compat-summary">
        <h3 id="export-compat-summary" className="text-base font-semibold text-builder-ink">
          Source Schema · Target Schema · Compatibility Level · Status
        </h3>
        {items.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zadne registrovane zaznamy kompatibility.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {items.map((c) => (
              <li key={c.id} className="grid grid-cols-4 gap-2">
                <InfoTile label="Source" value={c.sourceSchemaVersion} />
                <InfoTile label="Target" value={c.targetSchemaVersion} />
                <InfoTile label="Level" value={c.compatibilityLevel} />
                <InfoTile label="Status" value={c.status} />
              </li>
            ))}
          </ul>
        )}
        {compatibilityPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">index: {indexCount}</p>
        ) : null}
      </section>

      <section aria-labelledby="export-compat-events">
        <h3 id="export-compat-events" className="text-base font-semibold text-builder-ink">Export Compatibility Events</h3>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatim zadne udalosti.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.slice(0, 12).map((event) => (
              <li key={event.eventId} className="flex items-start justify-between gap-3 rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]">
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
