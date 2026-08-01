import type {
  RuntimeCompatibilityEvent,
  RuntimeCompatibilityPackage,
} from '../../model';

type RuntimeCompatibilityOverviewProps = {
  readonly compatibilityPackage: RuntimeCompatibilityPackage | null;
  readonly events: readonly RuntimeCompatibilityEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onEvaluate: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Runtime Compatibility Overview (EPIC-BLD-52).
 * Diagnostic projection of version compatibility — no migration.
 */
export function RuntimeCompatibilityOverview({
  compatibilityPackage,
  events,
  indexCount,
  onRegister,
  onEvaluate,
  onPublish,
  onValidate,
  onDispose,
  message,
}: RuntimeCompatibilityOverviewProps) {
  const canAct =
    compatibilityPackage !== null &&
    compatibilityPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && compatibilityPackage.metadata.status !== 'Published';
  const matrix = compatibilityPackage?.matrix ?? null;
  const rules = matrix?.rules ?? [];

  return (
    <div className="space-y-8" data-testid="runtime-compatibility-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Compatibility
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {compatibilityPackage?.metadata.title ??
              'Runtime Compatibility Manager'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {compatibilityPackage !== null
              ? `${compatibilityPackage.id} · v${compatibilityPackage.version} · ${compatibilityPackage.metadata.status}`
              : 'Deterministické vyhodnocení kompatibility verzí.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Manager neprovádí migrace a nemění Runtime. Pouze rozhoduje, zda
            jsou artefakty kompatibilní.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Matrix
          </button>
          <button
            type="button"
            onClick={onEvaluate}
            disabled={!canAct}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Evaluate
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

      <section aria-labelledby="compat-versions-heading">
        <h3
          id="compat-versions-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime · Manifest · API Version
        </h3>
        {matrix === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Register Matrix.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            <InfoTile label="Runtime Version" value={matrix.runtimeVersion} />
            <InfoTile
              label="Manifest Version"
              value={matrix.manifestVersion}
            />
            <InfoTile label="API Version" value={matrix.apiVersion} />
          </ul>
        )}
      </section>

      <section aria-labelledby="compat-matrix-heading">
        <h3
          id="compat-matrix-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Compatibility Matrix
        </h3>
        {matrix === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {matrix.id} · {matrix.metadata.overallStatus}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              rules: {matrix.rules.length} · index: {indexCount} · consumers:{' '}
              {matrix.supportedConsumers.join(', ')}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="compat-rules-heading">
        <h3
          id="compat-rules-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Rules
        </h3>
        {rules.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {rule.sourceVersion} → {rule.targetVersion} · {rule.status}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {rule.metadata.dimension} · {rule.reason}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="compat-validation-heading">
        <h3
          id="compat-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {compatibilityPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {compatibilityPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {compatibilityPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {compatibilityPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="compat-events-heading">
        <h3
          id="compat-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Compatibility Events
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
