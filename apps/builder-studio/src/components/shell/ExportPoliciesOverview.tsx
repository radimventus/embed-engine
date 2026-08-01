import type {
  ExportPolicyEvent,
  ExportPolicyPackage,
} from '../../model';

type ExportPoliciesOverviewProps = {
  readonly policyPackage: ExportPolicyPackage | null;
  readonly events: readonly ExportPolicyEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function ExportPoliciesOverview({
  policyPackage,
  events,
  indexCount,
  onRegister,
  onValidate,
  onDispose,
  message,
}: ExportPoliciesOverviewProps) {
  const policies = policyPackage?.policies ?? [];

  return (
    <div className="space-y-8" data-testid="export-policies-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Export Policies
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {policyPackage?.metadata.title ?? 'Export Policy Registry'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {policyPackage !== null
              ? `${policyPackage.id} · v${policyPackage.version} · ${policyPackage.metadata.status}`
              : 'Registr exportnich politik.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Policy
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={policyPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={policyPackage === null}
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

      <section aria-labelledby="export-policy-summary">
        <h3
          id="export-policy-summary"
          className="text-base font-semibold text-builder-ink"
        >
          Policy · Status · Conditions · Validation
        </h3>
        {policies.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatim zadne registrovane politiky.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {policies.map((policy) => (
              <li key={policy.id} className="grid grid-cols-4 gap-2">
                <InfoTile label="Policy" value={policy.name} />
                <InfoTile label="Status" value={policy.status} />
                <InfoTile label="Conditions" value={policy.conditions.join(', ')} />
                <InfoTile
                  label="Validation"
                  value={
                    policyPackage?.validation == null
                      ? 'Pending'
                      : policyPackage.validation.valid
                        ? 'Valid'
                        : 'Invalid'
                  }
                />
              </li>
            ))}
          </ul>
        )}
        {policyPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">index: {indexCount}</p>
        ) : null}
      </section>

      <section aria-labelledby="export-policy-events">
        <h3
          id="export-policy-events"
          className="text-base font-semibold text-builder-ink"
        >
          Export Policy Events
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

