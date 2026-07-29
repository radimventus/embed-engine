import type {
  RuntimeBootstrapEvent,
  RuntimeBootstrapPackage,
} from '../../model';

type RuntimeBootstrapOverviewProps = {
  readonly bootstrapPackage: RuntimeBootstrapPackage | null;
  readonly events: readonly RuntimeBootstrapEvent[];
  readonly indexCount: number;
  readonly onBuild: () => void;
  readonly onValidate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function RuntimeBootstrapOverview({
  bootstrapPackage,
  events,
  indexCount,
  onBuild,
  onValidate,
  onPublish,
  onDispose,
  message,
}: RuntimeBootstrapOverviewProps) {
  const canAct =
    bootstrapPackage !== null && bootstrapPackage.metadata.status !== 'Disposed';
  const session = bootstrapPackage?.runtimeSession ?? null;
  const validation = bootstrapPackage?.validation ?? null;

  return (
    <div className="space-y-8" data-testid="runtime-bootstrap-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Bootstrap
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {bootstrapPackage?.metadata.title ?? 'Runtime Session Bootstrap'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {bootstrapPackage !== null
              ? `${bootstrapPackage.id} · v${bootstrapPackage.version} · ${bootstrapPackage.metadata.status}`
              : 'Deterministická příprava vstupu pro Runtime.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Builder zde nic nespouští. Pouze skládá bootstrap balíček pro Runtime.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBuild}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Build Bootstrap
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
            disabled={!canAct}
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

      <section aria-labelledby="runtime-bootstrap-summary">
        <h3
          id="runtime-bootstrap-summary"
          className="text-base font-semibold text-builder-ink"
        >
          Session · Publication · Runtime Version · Bootstrap Version · Validation
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-5">
          <InfoTile label="Session" value={session?.id ?? '—'} />
          <InfoTile label="Publication" value={session?.publicationId ?? '—'} />
          <InfoTile
            label="Runtime Version"
            value={session?.runtimeVersion ?? '—'}
          />
          <InfoTile
            label="Bootstrap Version"
            value={session?.bootstrapVersion ?? '—'}
          />
          <InfoTile
            label="Validation"
            value={
              validation === null
                ? 'Pending'
                : validation.valid
                  ? 'Valid'
                  : 'Invalid'
            }
          />
        </ul>
        {bootstrapPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">
            state: {bootstrapPackage.runtimeSession.metadata.sessionState} ·
            readiness: {bootstrapPackage.runtimeSession.metadata.readinessStatus} ·
            index: {indexCount}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="runtime-bootstrap-validation">
        <h3
          id="runtime-bootstrap-validation"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {validation === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Bootstrap zatím nebyl validován.
          </p>
        ) : validation.issues.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Validation OK.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {validation.issues.map((issue, index) => (
              <li
                key={`${issue.code}-${index}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {issue.code}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {issue.severity}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {issue.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="runtime-bootstrap-events">
        <h3
          id="runtime-bootstrap-events"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime Bootstrap Events
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
