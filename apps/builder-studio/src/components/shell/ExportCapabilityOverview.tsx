import type {
  ExportCapabilityEvent,
  ExportCapabilityPackage,
} from '../../model';

type ExportCapabilityOverviewProps = {
  readonly capabilityPackage: ExportCapabilityPackage | null;
  readonly events: readonly ExportCapabilityEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function ExportCapabilityOverview({
  capabilityPackage,
  events,
  indexCount,
  onRegister,
  onValidate,
  onDispose,
  message,
}: ExportCapabilityOverviewProps) {
  const capabilities = capabilityPackage?.capabilities ?? [];
  return (
    <div className="space-y-8" data-testid="export-capability-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Export Capabilities
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {capabilityPackage?.metadata.title ?? 'Export Capability Registry'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {capabilityPackage !== null
              ? `${capabilityPackage.id} · v${capabilityPackage.version} · ${capabilityPackage.metadata.status}`
              : 'Registr exportnich schopnosti.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Capability
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={capabilityPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={capabilityPackage === null}
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

      <section aria-labelledby="export-capability-summary">
        <h3
          id="export-capability-summary"
          className="text-base font-semibold text-builder-ink"
        >
          Capability · Supported Schemas · Status · Validation
        </h3>
        {capabilities.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatim zadne registrovane schopnosti.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {capabilities.map((c) => (
              <li key={c.id} className="grid grid-cols-4 gap-2">
                <InfoTile label="Capability" value={c.name} />
                <InfoTile
                  label="Schemas"
                  value={c.supportedSchemaVersions.join(', ')}
                />
                <InfoTile label="Status" value={c.status} />
                <InfoTile
                  label="Validation"
                  value={
                    capabilityPackage?.validation == null
                      ? 'Pending'
                      : capabilityPackage.validation.valid
                        ? 'Valid'
                        : 'Invalid'
                  }
                />
              </li>
            ))}
          </ul>
        )}
        {capabilityPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">index: {indexCount}</p>
        ) : null}
      </section>

      <section aria-labelledby="export-capability-events">
        <h3
          id="export-capability-events"
          className="text-base font-semibold text-builder-ink"
        >
          Export Capability Events
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

