import type {
  PublicationReadinessEvent,
  PublicationReadinessPackage,
} from '../../model';

type PublicationReadinessOverviewProps = {
  readonly readinessPackage: PublicationReadinessPackage | null;
  readonly events: readonly PublicationReadinessEvent[];
  readonly indexCount: number;
  readonly onValidate: () => void;
  readonly onEvaluate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function PublicationReadinessOverview({
  readinessPackage,
  events,
  indexCount,
  onValidate,
  onEvaluate,
  onPublish,
  onDispose,
  message,
}: PublicationReadinessOverviewProps) {
  const canAct =
    readinessPackage !== null &&
    readinessPackage.metadata.status !== 'Disposed';
  const report = readinessPackage?.report ?? null;

  return (
    <div className="space-y-8" data-testid="publication-readiness-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Publication Readiness
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {readinessPackage?.metadata.title ?? 'Publication Readiness Validator'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {readinessPackage !== null
              ? `${readinessPackage.id} · v${readinessPackage.version} · ${readinessPackage.metadata.status}`
              : 'Deterministická validace připravenosti pro Client Studio.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Validator nic neopravuje. Pouze vydává rozhodnutí READY,
            READY_WITH_WARNINGS nebo NOT_READY.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onValidate}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Validate Readiness
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

      <section aria-labelledby="publication-readiness-summary">
        <h3
          id="publication-readiness-summary"
          className="text-base font-semibold text-builder-ink"
        >
          Publication · Status · Checks · Warnings · Errors
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-5">
          <InfoTile label="Publication" value={report?.publicationId ?? '—'} />
          <InfoTile label="Status" value={report?.status ?? '—'} />
          <InfoTile
            label="Checks"
            value={String(report?.checks.length ?? 0)}
          />
          <InfoTile
            label="Warnings"
            value={String(report?.warnings.length ?? 0)}
          />
          <InfoTile
            label="Errors"
            value={String(report?.errors.length ?? 0)}
          />
        </ul>
        {readinessPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">
            report: {readinessPackage.report.id} · object:{' '}
            {readinessPackage.report.metadata.objectId} · index: {indexCount}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="publication-readiness-checks">
        <h3
          id="publication-readiness-checks"
          className="text-base font-semibold text-builder-ink"
        >
          Checks
        </h3>
        {report === null || report.checks.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nebyly provedeny žádné kontroly.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {report.checks.map((check) => (
              <li
                key={check.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {check.name}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {check.result} · {check.severity}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {check.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="publication-readiness-events">
        <h3
          id="publication-readiness-events"
          className="text-base font-semibold text-builder-ink"
        >
          Publication Readiness Events
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
