import type {
  RuntimeManifestEvent,
  RuntimeManifestPackage,
} from '../../model';

type RuntimeManifestOverviewProps = {
  readonly manifestPackage: RuntimeManifestPackage | null;
  readonly events: readonly RuntimeManifestEvent[];
  readonly indexCount: number;
  readonly onGenerate: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Runtime Manifest Overview (EPIC-BLD-50).
 * Diagnostic projection of declarative Runtime Manifest.
 */
export function RuntimeManifestOverview({
  manifestPackage,
  events,
  indexCount,
  onGenerate,
  onPublish,
  onValidate,
  onDispose,
  message,
}: RuntimeManifestOverviewProps) {
  const canAct =
    manifestPackage !== null &&
    manifestPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && manifestPackage.metadata.status !== 'Published';
  const manifest = manifestPackage?.manifest ?? null;
  const capabilities = manifest?.capabilities ?? [];

  return (
    <div className="space-y-8" data-testid="runtime-manifest-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Manifest
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {manifestPackage?.metadata.title ?? 'Runtime Manifest Engine'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {manifestPackage !== null
              ? `${manifestPackage.id} · v${manifestPackage.version} · ${manifestPackage.metadata.status}`
              : 'Deklarativní popis publikovaných Runtime capability.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Manifest nevytváří Runtime a nemění Registry. Pouze deklaruje
            publikované capability.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onGenerate}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Generate Manifest
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

      <section aria-labelledby="man-version-heading">
        <h3
          id="man-version-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Manifest Version
        </h3>
        {manifest === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Generate Manifest.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {manifest.id} · v{manifest.version}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              registry: {manifest.registryVersion} · index: {indexCount} ·
              generated:{' '}
              {new Date(manifest.generatedAt).toLocaleString('cs-CZ')}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="man-capabilities-heading">
        <h3
          id="man-capabilities-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Registered Capabilities
        </h3>
        {capabilities.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {capabilities.map((capability) => (
              <li
                key={capability.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {capability.metadata.title}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {capability.id} · v{capability.version} ·{' '}
                  {capability.metadata.packageType}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  package: {capability.package} · source:{' '}
                  {capability.metadata.source}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="man-packages-heading">
        <h3
          id="man-packages-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Packages
        </h3>
        {manifest === null || manifest.packages.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {manifest.packages.map((packageId) => (
              <li
                key={packageId}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3 text-sm font-semibold text-builder-ink"
              >
                {packageId}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="man-deps-heading">
        <h3
          id="man-deps-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Dependencies
        </h3>
        {capabilities.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {capabilities.map((capability) => (
              <li
                key={`dep-${capability.id}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3 text-[13px]"
              >
                <span className="font-medium text-builder-ink">
                  {capability.id}
                </span>
                <span className="mt-1 block text-builder-muted">
                  {capability.dependencies.length > 0
                    ? capability.dependencies.join(', ')
                    : 'none'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="man-validation-heading">
        <h3
          id="man-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {manifestPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {manifestPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {manifestPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {manifestPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="man-events-heading">
        <h3
          id="man-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Manifest Events
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
