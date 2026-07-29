import type {
  PublicationPlanEvent,
  PublicationPlanPackage,
} from '../../model';

type PublicationPlanOverviewProps = {
  readonly planPackage: PublicationPlanPackage | null;
  readonly events: readonly PublicationPlanEvent[];
  readonly indexCount: number;
  readonly onBuild: () => void;
  readonly onValidate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function PublicationPlanOverview({
  planPackage,
  events,
  indexCount,
  onBuild,
  onValidate,
  onPublish,
  onDispose,
  message,
}: PublicationPlanOverviewProps) {
  const plan = planPackage?.plan ?? null;
  return (
    <div className="space-y-8" data-testid="publication-plan-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Publication Plan
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {planPackage?.metadata.title ?? 'Publication Plan Builder'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {planPackage !== null
              ? `${planPackage.id} · v${planPackage.version} · ${planPackage.metadata.status}`
              : 'Deterministický publikační plán bez skutečné publikace.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBuild}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Build Plan
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={planPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={planPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Publish
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={planPackage === null}
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

      <section aria-labelledby="publication-plan-summary">
        <h3
          id="publication-plan-summary"
          className="text-base font-semibold text-builder-ink"
        >
          Root Artifact · Steps · Dependencies · Validation · Status
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-5">
          <InfoTile label="Root Artifact" value={plan?.rootArtifactId ?? '—'} />
          <InfoTile label="Steps" value={String(plan?.steps.length ?? 0)} />
          <InfoTile
            label="Dependencies"
            value={String(plan?.dependencies.length ?? 0)}
          />
          <InfoTile
            label="Validation"
            value={
              planPackage?.validation == null
                ? 'Pending'
                : planPackage.validation.valid
                  ? 'Valid'
                  : 'Invalid'
            }
          />
          <InfoTile label="Status" value={plan?.status ?? '—'} />
        </ul>
        {planPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">
            index: {indexCount}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="publication-plan-steps">
        <h3
          id="publication-plan-steps"
          className="text-base font-semibold text-builder-ink"
        >
          Steps
        </h3>
        {plan === null || plan.steps.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Plán zatím nemá kroky.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {plan.steps.map((step) => (
              <li
                key={step.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  #{step.order} · {step.artifactId}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {step.operation} · {step.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="publication-plan-events">
        <h3
          id="publication-plan-events"
          className="text-base font-semibold text-builder-ink"
        >
          Publication Plan Events
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
