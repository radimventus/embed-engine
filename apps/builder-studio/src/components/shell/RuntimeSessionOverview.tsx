import type { RuntimeSession, SessionEvent } from '../../model';
import { createSessionNavigator } from '../../services/runtime-session/session-navigator';

type RuntimeSessionOverviewProps = {
  readonly runtimeSession: RuntimeSession | null;
  readonly events: readonly SessionEvent[];
  readonly onCreate: () => void;
  readonly onStart: () => void;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
  readonly onComplete: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Runtime Session Overview (EPIC-BLD-19).
 * Diagnostic view of visitor session through Decision Story — no AI / adaptation.
 */
export function RuntimeSessionOverview({
  runtimeSession,
  events,
  onCreate,
  onStart,
  onNext,
  onPrevious,
  onComplete,
  onDispose,
  message,
}: RuntimeSessionOverviewProps) {
  const navigator =
    runtimeSession === null
      ? null
      : createSessionNavigator(
          runtimeSession.moveIds,
          runtimeSession.currentMoveId,
        );
  const canNavigate =
    runtimeSession !== null &&
    (runtimeSession.status === 'Running' ||
      runtimeSession.status === 'Paused');

  return (
    <div className="space-y-8" data-testid="runtime-session-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Session
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {runtimeSession?.metadata.title ?? 'Runtime Session'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {runtimeSession !== null
              ? `${runtimeSession.id} · ${runtimeSession.status}`
              : 'Vyžaduje Decision Story — Session pouze vykonává průchod.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Session nevytváří Story, nevyhodnocuje pravidla a neobsahuje AI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCreate}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Create Session
          </button>
          <button
            type="button"
            onClick={onStart}
            disabled={
              runtimeSession === null ||
              runtimeSession.status === 'Disposed' ||
              runtimeSession.status === 'Completed' ||
              runtimeSession.status === 'Running'
            }
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Start
          </button>
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canNavigate || !(navigator?.canGoPrevious() ?? false)}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNavigate || !(navigator?.canGoNext() ?? false)}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Next
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={!canNavigate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Complete
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={
              runtimeSession === null || runtimeSession.status === 'Disposed'
            }
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

      <section aria-labelledby="session-state-heading">
        <h3
          id="session-state-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Session State
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Created · Running · Paused · Completed · Disposed
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {(
            [
              'Created',
              'Running',
              'Paused',
              'Completed',
              'Disposed',
            ] as const
          ).map((state) => {
            const active = runtimeSession?.status === state;
            return (
              <div
                key={state}
                className={`rounded-[12px] border px-4 py-3 ${
                  active
                    ? 'border-builder-blue bg-builder-creamDark text-builder-blue'
                    : 'border-[#DDE5EF] bg-white text-builder-ink'
                }`}
              >
                <p className="text-sm font-semibold">{state}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="session-current-heading">
        <h3
          id="session-current-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Current Move
        </h3>
        {runtimeSession === null || runtimeSession.currentMoveId === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Žádný aktuální move — spusťte Start.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {runtimeSession.currentMoveId}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              index{' '}
              {(navigator?.indexOf(runtimeSession.currentMoveId) ?? -1) + 1} /{' '}
              {runtimeSession.moveIds.length}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="session-navigation-heading">
        <h3
          id="session-navigation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Navigation
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Lineární průchod Decision Story — bez větvení.
        </p>
        {runtimeSession === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Session ještě neexistuje.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {runtimeSession.moveIds.map((moveId, index) => {
              const active = runtimeSession.currentMoveId === moveId;
              return (
                <li
                  key={moveId}
                  className={`rounded-[12px] border px-4 py-3 ${
                    active
                      ? 'border-builder-navy bg-[#F4F7FB]'
                      : 'border-[#DDE5EF]'
                  }`}
                >
                  <p className="text-sm font-semibold text-builder-ink">
                    {index + 1}. {moveId}
                  </p>
                  {active ? (
                    <p className="mt-1 text-[12px] text-builder-muted">
                      current
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section aria-labelledby="session-history-heading">
        <h3
          id="session-history-heading"
          className="text-base font-semibold text-builder-ink"
        >
          History
        </h3>
        {runtimeSession === null || runtimeSession.history.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím žádná historie průchodu.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {runtimeSession.history.map((entry, index) => (
              <li
                key={`${entry.timestamp}-${entry.action}-${index}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-builder-ink">
                    {entry.action}
                  </p>
                  <time className="text-[12px] text-builder-muted">
                    {new Date(entry.timestamp).toLocaleTimeString('cs-CZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </time>
                </div>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {entry.moveId ?? '—'} · {entry.metadata.note}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="session-events-heading">
        <h3
          id="session-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Session Events
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
