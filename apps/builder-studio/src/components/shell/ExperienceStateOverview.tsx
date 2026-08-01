import type {
  ExperienceStateEvent,
  ExperienceStatePackage,
} from '../../model';

type ExperienceStateOverviewProps = {
  readonly statePackage: ExperienceStatePackage | null;
  readonly events: readonly ExperienceStateEvent[];
  readonly indexCount: number;
  readonly onCreate: () => void;
  readonly onUpdate: () => void;
  readonly onCheckpoint: () => void;
  readonly onRestore: () => void;
  readonly onComplete: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Experience State Overview (EPIC-BLD-35).
 * Diagnostic runtime state SSOT — no Runtime / module control.
 */
export function ExperienceStateOverview({
  statePackage,
  events,
  indexCount,
  onCreate,
  onUpdate,
  onCheckpoint,
  onRestore,
  onComplete,
  onValidate,
  onDispose,
  message,
}: ExperienceStateOverviewProps) {
  const canMutate =
    statePackage !== null &&
    statePackage.metadata.status !== 'Disposed' &&
    statePackage.state.status !== 'Disposed';
  const canUpdate =
    canMutate && statePackage.state.status !== 'Completed';
  const lastCheckpoint =
    statePackage !== null && statePackage.checkpoints.length > 0
      ? statePackage.checkpoints[statePackage.checkpoints.length - 1]
      : null;

  return (
    <div className="space-y-8" data-testid="experience-state-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Experience State
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {statePackage?.metadata.title ?? 'Experience State Manager'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {statePackage !== null
              ? `${statePackage.id} · v${statePackage.version} · ${statePackage.state.status}`
              : 'SSOT pro runtime stav Experience (checkpoint / restore).'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            State Manager nemění Knowledge, AI Context, Personalization ani
            Story. Neřídí Runtime ani moduly a nepoužívá AI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCreate}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Create State
          </button>
          <button
            type="button"
            onClick={onUpdate}
            disabled={!canUpdate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Update
          </button>
          <button
            type="button"
            onClick={onCheckpoint}
            disabled={!canMutate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Checkpoint
          </button>
          <button
            type="button"
            onClick={onRestore}
            disabled={!canMutate || lastCheckpoint === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Restore
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={!canUpdate}
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

      <section aria-labelledby="es-session-heading">
        <h3
          id="es-session-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Active Session
        </h3>
        {statePackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Create State (volitelně po Session / Runtime / Modules).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Session" value={statePackage.state.sessionId} />
            <InfoTile label="State" value={statePackage.state.id} />
            <InfoTile label="Package" value={statePackage.id} />
            <InfoTile label="Index" value={String(indexCount)} />
          </ul>
        )}
      </section>

      <section aria-labelledby="es-runtime-heading">
        <h3
          id="es-runtime-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Active Runtime
        </h3>
        {statePackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {statePackage.state.runtimeExecutionId ?? '—'}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="es-module-heading">
        <h3
          id="es-module-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Active Module
        </h3>
        {statePackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {statePackage.state.metadata.activeModule ?? '—'}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              execution: {statePackage.state.moduleExecutionId ?? '—'}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="es-current-heading">
        <h3
          id="es-current-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Current State
        </h3>
        {statePackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {statePackage.state.currentState}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              status: {statePackage.state.status} · move:{' '}
              {statePackage.state.metadata.activeMove ?? '—'}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="es-checkpoint-heading">
        <h3
          id="es-checkpoint-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Last Checkpoint
        </h3>
        {lastCheckpoint === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {lastCheckpoint.id}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              {lastCheckpoint.reason} · seq #
              {lastCheckpoint.metadata.sequence} · restore:{' '}
              {statePackage?.state.metadata.restoreStatus ?? 'None'}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="es-validation-heading">
        <h3
          id="es-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {statePackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {statePackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {statePackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {statePackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="es-events-heading">
        <h3
          id="es-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          State Events
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
