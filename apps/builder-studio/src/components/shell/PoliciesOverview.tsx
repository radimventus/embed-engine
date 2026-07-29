import type {
  RuntimePolicyEvent,
  RuntimePolicyPackage,
} from '../../model';

type PoliciesOverviewProps = {
  readonly policyPackage: RuntimePolicyPackage | null;
  readonly events: readonly RuntimePolicyEvent[];
  readonly indexCount: number;
  readonly onInitialize: () => void;
  readonly onRegister: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Policies Overview (EPIC-BLD-40).
 * Registry projection only — no enforcement, no Runtime mutation.
 */
export function PoliciesOverview({
  policyPackage,
  events,
  indexCount,
  onInitialize,
  onRegister,
  onPublish,
  onValidate,
  onDispose,
  message,
}: PoliciesOverviewProps) {
  const canAct =
    policyPackage !== null && policyPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && policyPackage.metadata.status !== 'Published';
  const categories = Array.from(
    new Set(policyPackage?.registry.policies.map((item) => item.category) ?? []),
  );

  return (
    <div className="space-y-8" data-testid="policies-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Policies
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {policyPackage?.metadata.title ?? 'Runtime Policy Engine'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {policyPackage !== null
              ? `${policyPackage.id} · v${policyPackage.version} · ${policyPackage.metadata.status}`
              : 'SSOT registr provozních politik platformy.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Policy Engine neřídí Runtime, neprovádí enforcement a nepoužívá AI.
            Governance z něj pouze čte.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onInitialize}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Initialize Registry
          </button>
          <button
            type="button"
            onClick={onRegister}
            disabled={!canAct && policyPackage !== null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Register Policy
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
            disabled={!canPublish}
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

      <section aria-labelledby="pol-registered-heading">
        <h3
          id="pol-registered-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Registered Policies
        </h3>
        {policyPackage === null || policyPackage.registry.policies.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Initialize Registry (seed politiky pro Governance).
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {policyPackage.registry.policies.map((policy) => (
              <li
                key={policy.id}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">
                  {policy.name}
                </span>
                <span className="mt-0.5 block text-builder-muted">
                  {policy.category} · {policy.metadata.code} · v
                  {policy.version} · {policy.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pol-categories-heading">
        <h3
          id="pol-categories-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Categories
        </h3>
        {categories.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <li
                key={category}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm font-medium text-builder-ink"
              >
                {category}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pol-version-heading">
        <h3
          id="pol-version-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Current Version
        </h3>
        {policyPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Package" value={`v${policyPackage.version}`} />
            <InfoTile
              label="Registry"
              value={`v${policyPackage.registry.version}`}
            />
            <InfoTile
              label="Policies"
              value={String(policyPackage.registry.policies.length)}
            />
            <InfoTile label="Index" value={String(indexCount)} />
          </ul>
        )}
      </section>

      <section aria-labelledby="pol-registry-heading">
        <h3
          id="pol-registry-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Registry Status
        </h3>
        {policyPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {policyPackage.registry.metadata.status}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              {policyPackage.registry.id} · {policyPackage.registry.metadata.title}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="pol-validation-heading">
        <h3
          id="pol-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {policyPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {policyPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {policyPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {policyPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="pol-events-heading">
        <h3
          id="pol-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Policy Events
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
