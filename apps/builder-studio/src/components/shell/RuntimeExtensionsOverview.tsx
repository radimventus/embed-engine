import type {
  RuntimeExtensionEvent,
  RuntimeExtensionPackage,
} from '../../model';

type RuntimeExtensionsOverviewProps = {
  readonly extensionPackage: RuntimeExtensionPackage | null;
  readonly events: readonly RuntimeExtensionEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onEnable: () => void;
  readonly onDisable: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Runtime Extensions Overview (EPIC-BLD-54).
 * Diagnostic projection of extension registry — no dynamic loading.
 */
export function RuntimeExtensionsOverview({
  extensionPackage,
  events,
  indexCount,
  onRegister,
  onEnable,
  onDisable,
  onPublish,
  onValidate,
  onDispose,
  message,
}: RuntimeExtensionsOverviewProps) {
  const canAct =
    extensionPackage !== null &&
    extensionPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && extensionPackage.metadata.status !== 'Published';
  const extensions = extensionPackage?.registry.extensions ?? [];
  const hasToggleTarget = extensions.length > 0;

  return (
    <div className="space-y-8" data-testid="runtime-extensions-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Extensions
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {extensionPackage?.metadata.title ?? 'Runtime Extension Framework'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {extensionPackage !== null
              ? `${extensionPackage.id} · v${extensionPackage.version} · ${extensionPackage.metadata.status}`
              : 'Deterministická správa Runtime Extension.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Framework nemění Runtime Capability. Pouze registruje rozšíření
            přes veřejné Runtime kontrakty.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Extensions
          </button>
          <button
            type="button"
            onClick={onEnable}
            disabled={!hasToggleTarget}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Enable
          </button>
          <button
            type="button"
            onClick={onDisable}
            disabled={!hasToggleTarget}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Disable
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

      <section aria-labelledby="ext-list-heading">
        <h3
          id="ext-list-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Registered Extensions
        </h3>
        {extensions.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Register Extensions.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {extensions.map((extension) => (
              <li
                key={extension.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {extension.metadata.title}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {extension.capability} · v{extension.version} ·{' '}
                  {extension.status}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  deps:{' '}
                  {extension.dependencies.length > 0
                    ? extension.dependencies.join(', ')
                    : 'none'}{' '}
                  · source: {extension.metadata.source}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ext-meta-heading">
        <h3
          id="ext-meta-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Version · Status · Dependencies
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          <InfoTile
            label="Version"
            value={
              [...new Set(extensions.map((item) => item.version))].join(
                ', ',
              ) || '—'
            }
          />
          <InfoTile
            label="Status"
            value={
              [...new Set(extensions.map((item) => item.status))].join(
                ', ',
              ) || '—'
            }
          />
          <InfoTile
            label="Dependencies"
            value={
              [
                ...new Set(
                  extensions.flatMap((item) => item.dependencies),
                ),
              ].join(', ') || 'none'
            }
          />
        </ul>
        {extensionPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">
            registry: {extensionPackage.registry.id} · extensions:{' '}
            {extensions.length} · index: {indexCount}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="ext-validation-heading">
        <h3
          id="ext-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {extensionPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {extensionPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {extensionPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {extensionPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="ext-events-heading">
        <h3
          id="ext-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Extension Events
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
