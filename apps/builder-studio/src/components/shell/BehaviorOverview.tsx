import type {
  BehaviorEvaluation,
  BehaviorEvent,
  BehaviorSignal,
} from '../../model';

type BehaviorOverviewProps = {
  readonly evaluation: BehaviorEvaluation | null;
  readonly signals: readonly BehaviorSignal[];
  readonly events: readonly BehaviorEvent[];
  readonly onEvaluate: () => void;
  readonly onReceiveDemoSignals: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Behavior Overview (EPIC-BLD-20).
 * Diagnostic advisory view — does not execute actions or mutate Session/Story.
 */
export function BehaviorOverview({
  evaluation,
  signals,
  events,
  onEvaluate,
  onReceiveDemoSignals,
  onDispose,
  message,
}: BehaviorOverviewProps) {
  return (
    <div className="space-y-8" data-testid="behavior-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Behavior Engine
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {evaluation?.context.metadata.title ?? 'Behavior'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {evaluation !== null
              ? `${evaluation.id} · strategy ${evaluation.strategyId}`
              : 'Vyžaduje Runtime Session — Behavior pouze navrhuje akce.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Behavior nemění Story ani Session. Runtime rozhoduje, zda návrh
            použije. Bez AI a Learning.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onReceiveDemoSignals}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium"
          >
            Receive Demo Signals
          </button>
          <button
            type="button"
            onClick={onEvaluate}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Evaluate Behavior
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={evaluation === null}
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

      <section aria-labelledby="behavior-context-heading">
        <h3
          id="behavior-context-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Context
        </h3>
        {evaluation === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Evaluate Behavior (nejprve Create/Start Session).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Session" value={evaluation.context.sessionId} />
            <InfoTile
              label="Current Move"
              value={evaluation.context.currentMove ?? '—'}
            />
            <InfoTile
              label="History entries"
              value={`${evaluation.context.history.length}`}
            />
            <InfoTile
              label="Signals in context"
              value={`${evaluation.context.signals.length}`}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="behavior-strategy-heading">
        <h3
          id="behavior-strategy-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Strategy
        </h3>
        <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
          <p className="text-sm font-semibold text-builder-ink">
            {evaluation?.strategyId ?? 'basic-behavior-strategy'}
          </p>
          <p className="mt-1 text-[13px] text-builder-muted">
            Deterministic BasicBehaviorStrategy — advisory proposals only.
          </p>
        </div>
      </section>

      <section aria-labelledby="behavior-signals-heading">
        <h3
          id="behavior-signals-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Signals
        </h3>
        {signals.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím žádné Behavior Signals.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {signals.map((item) => (
              <li
                key={item.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-builder-ink">
                    {item.type}
                  </p>
                  <span className="rounded-[8px] border border-[#DDE5EF] px-2.5 py-1 text-[12px]">
                    {item.source}
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-builder-muted">
                  {item.payload.note}
                </p>
                <p className="mt-1 text-[12px] text-builder-muted">
                  move {item.payload.moveId ?? '—'} · {item.id}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="behavior-actions-heading">
        <h3
          id="behavior-actions-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Actions
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Pouze návrhy — BehaviorAction se nevykonává.
        </p>
        {evaluation === null || evaluation.actions.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Žádné navrhované akce.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {evaluation.actions.map((action) => (
              <li
                key={action.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-builder-ink">
                    {action.type}
                  </p>
                  <span className="rounded-[8px] border border-[#DDE5EF] px-2.5 py-1 text-[12px]">
                    priority {action.priority}
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-builder-muted">
                  {action.reason}
                </p>
                <p className="mt-1 text-[12px] text-builder-muted">
                  target {action.target ?? '—'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="behavior-events-heading">
        <h3
          id="behavior-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Behavior Events
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
