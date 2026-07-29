import type { RuntimeApiEvent, RuntimeApiPackage } from '../../model';

type RuntimeApiOverviewProps = {
  readonly apiPackage: RuntimeApiPackage | null;
  readonly events: readonly RuntimeApiEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Runtime API Overview (EPIC-BLD-51).
 * Diagnostic projection of Gateway routes — no business execution.
 */
export function RuntimeApiOverview({
  apiPackage,
  events,
  indexCount,
  onRegister,
  onPublish,
  onValidate,
  onDispose,
  message,
}: RuntimeApiOverviewProps) {
  const canAct =
    apiPackage !== null && apiPackage.metadata.status !== 'Disposed';
  const canPublish = canAct && apiPackage.metadata.status !== 'Published';
  const registry = apiPackage?.registry ?? null;
  const routes = registry?.routes ?? [];

  return (
    <div className="space-y-8" data-testid="runtime-api-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime API
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {apiPackage?.metadata.title ?? 'Runtime API Gateway'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {apiPackage !== null
              ? `${apiPackage.id} · v${apiPackage.version} · ${apiPackage.metadata.status}`
              : 'Veřejná hranice Runtime capability.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Gateway neobsahuje business logiku. Pouze směruje požadavky na
            publikované capability.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Routes
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
            Publish API
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

      <section aria-labelledby="api-routes-heading">
        <h3
          id="api-routes-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Registered Routes
        </h3>
        {routes.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Register Routes.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {routes.map((route) => (
              <li
                key={route.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {route.metadata.title}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {route.capability}.{route.operation} · v{route.version}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  handler: {route.handler} · status: {route.metadata.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="api-meta-heading">
        <h3
          id="api-meta-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Capability · Version · Handler
        </h3>
        {routes.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            <InfoTile
              label="Capability"
              value={[...new Set(routes.map((r) => r.capability))].join(', ')}
            />
            <InfoTile
              label="Version"
              value={[...new Set(routes.map((r) => r.version))].join(', ')}
            />
            <InfoTile
              label="Handler"
              value={[...new Set(routes.map((r) => r.handler))].join(', ')}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="api-published-heading">
        <h3
          id="api-published-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Published API
        </h3>
        {registry === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {registry.id}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              routes: {registry.routes.length} · index: {indexCount} · session:{' '}
              {registry.metadata.sessionId}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              package status: {apiPackage?.metadata.status ?? '—'}
              {registry.metadata.manifestId
                ? ` · manifest: ${registry.metadata.manifestId}`
                : ''}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="api-validation-heading">
        <h3
          id="api-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {apiPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {apiPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {apiPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {apiPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="api-events-heading">
        <h3
          id="api-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          API Events
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
