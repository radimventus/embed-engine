import type {
  ExperienceModulePackage,
  ModuleCoordinatorEvent,
} from '../../model';

type ExperienceModulesOverviewProps = {
  readonly modulePackage: ExperienceModulePackage | null;
  readonly events: readonly ModuleCoordinatorEvent[];
  readonly indexCount: number;
  readonly onInitialize: () => void;
  readonly onActivate: () => void;
  readonly onTransition: () => void;
  readonly onComplete: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Experience Modules Overview (EPIC-BLD-33).
 * Diagnostic module lifecycle — coordination only.
 */
export function ExperienceModulesOverview({
  modulePackage,
  events,
  indexCount,
  onInitialize,
  onActivate,
  onTransition,
  onComplete,
  onValidate,
  onDispose,
  message,
}: ExperienceModulesOverviewProps) {
  const canMutate =
    modulePackage !== null && modulePackage.metadata.status !== 'Disposed';

  const active = modulePackage?.modules.find(
    (item) => item.status === 'Active',
  );
  const completed =
    modulePackage?.modules.filter((item) => item.status === 'Completed') ??
    [];
  const pending =
    modulePackage?.modules.filter((item) => item.status === 'Pending') ?? [];

  return (
    <div className="space-y-8" data-testid="experience-modules-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Experience Modules
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {modulePackage?.metadata.title ?? 'Experience Module Coordinator'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {modulePackage !== null
              ? `${modulePackage.id} · v${modulePackage.version} · ${modulePackage.metadata.status}`
              : 'Koordinuje životní cyklus modulů během Decision Session.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Coordinator nemění Knowledge, AI Context, Personalization ani
            Story. Neobsahuje logiku modulů a nepoužívá AI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onInitialize}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Initialize
          </button>
          <button
            type="button"
            onClick={onActivate}
            disabled={!canMutate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Activate
          </button>
          <button
            type="button"
            onClick={onTransition}
            disabled={!canMutate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Transition
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={!canMutate || modulePackage.metadata.status === 'Published'}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Complete
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={!canMutate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={!canMutate}
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

      <section aria-labelledby="em-active-heading">
        <h3
          id="em-active-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Active Module
        </h3>
        {active === undefined ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {active.metadata.label} · {active.moduleId}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              sequence #{active.metadata.sequence} · index {indexCount}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="em-completed-heading">
        <h3
          id="em-completed-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Completed Modules
        </h3>
        {completed.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {completed.map((item) => (
              <li
                key={item.id}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm text-builder-ink"
              >
                {item.metadata.label}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="em-pending-heading">
        <h3
          id="em-pending-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Pending Modules
        </h3>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {pending.map((item) => (
              <li
                key={item.id}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm text-builder-muted"
              >
                {item.metadata.label}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="em-history-heading">
        <h3
          id="em-history-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Transition History
        </h3>
        {modulePackage === null || modulePackage.transitions.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...modulePackage.transitions]
              .reverse()
              .slice(0, 8)
              .map((item, index) => (
                <li
                  key={`${item.timestamp}-${item.reason}-${index}`}
                  className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
                >
                  <p className="text-sm font-semibold text-builder-ink">
                    {item.fromModule ?? '∅'} → {item.toModule ?? '∅'}
                  </p>
                  <p className="mt-1 text-[13px] text-builder-muted">
                    {item.reason} · {item.metadata.action}
                  </p>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="em-validation-heading">
        <h3
          id="em-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {modulePackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {modulePackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {modulePackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {modulePackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="em-events-heading">
        <h3
          id="em-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Module Events
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
