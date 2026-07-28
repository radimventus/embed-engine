import type {
  DecisionEvent,
  DecisionKnowledgePackage,
  PriorityDefinition,
  PriorityId,
} from '../../model';

type DecisionOverviewProps = {
  readonly decisionKnowledge: DecisionKnowledgePackage;
  readonly priorityRegistry: readonly PriorityDefinition[];
  readonly events: readonly DecisionEvent[];
  readonly onSave: () => void;
  readonly onAddRule: () => void;
  readonly onAddSignal: () => void;
  readonly onAddStrategy: () => void;
  readonly onTogglePriority: (priorityId: PriorityId) => void;
};

/**
 * Decision Overview (EPIC-BLD-12).
 * Authoring overview — no evaluation, no Story, no Runtime.
 */
export function DecisionOverview({
  decisionKnowledge,
  priorityRegistry,
  events,
  onSave,
  onAddRule,
  onAddSignal,
  onAddStrategy,
  onTogglePriority,
}: DecisionOverviewProps) {
  const registered = new Set(decisionKnowledge.priorities);

  return (
    <div className="space-y-8" data-testid="decision-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Decision Knowledge
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {decisionKnowledge.metadata.title}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {decisionKnowledge.id} · v{decisionKnowledge.version} ·{' '}
            {decisionKnowledge.metadata.status}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Knowledge ≠ Decision Knowledge — pouze autorský model interpretace.
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
        >
          Uložit Decision
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile
          label="Rules"
          value={`${decisionKnowledge.decisionRules.length}`}
        />
        <SummaryTile
          label="Signals"
          value={`${decisionKnowledge.decisionSignals.length}`}
        />
        <SummaryTile
          label="Priorities"
          value={`${decisionKnowledge.priorities.length}`}
        />
        <SummaryTile
          label="Strategies"
          value={`${decisionKnowledge.strategies.length}`}
        />
      </div>

      <section aria-labelledby="rules-heading">
        <div className="flex items-center justify-between gap-3">
          <h3
            id="rules-heading"
            className="text-base font-semibold text-builder-ink"
          >
            Rules
          </h3>
          <button
            type="button"
            onClick={onAddRule}
            className="rounded-[8px] border border-[#DDE5EF] px-3 py-1.5 text-[12px] font-medium"
          >
            + Rule
          </button>
        </div>
        <p className="mt-1 text-[13px] text-builder-muted">
          Datový model — žádná evaluace.
        </p>
        <ul className="mt-3 space-y-2">
          {decisionKnowledge.decisionRules.map((rule) => (
            <li
              key={rule.id}
              className="rounded-[12px] border border-[#DDE5EF] px-4 py-3 text-sm"
            >
              <p className="font-semibold text-builder-ink">
                IF {rule.condition}
              </p>
              <p className="mt-1 text-builder-muted">THEN {rule.outcome}</p>
              <p className="mt-1 text-[12px] text-builder-muted">
                priority {rule.priority} · weight {rule.weight}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="signals-heading">
        <div className="flex items-center justify-between gap-3">
          <h3
            id="signals-heading"
            className="text-base font-semibold text-builder-ink"
          >
            Signals
          </h3>
          <button
            type="button"
            onClick={onAddSignal}
            className="rounded-[8px] border border-[#DDE5EF] px-3 py-1.5 text-[12px] font-medium"
          >
            + Signal
          </button>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {decisionKnowledge.decisionSignals.map((signal) => (
            <li
              key={signal.id}
              className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
            >
              <p className="text-sm font-semibold text-builder-ink">
                {signal.label}
              </p>
              <p className="mt-1 text-[12px] text-builder-muted">
                {signal.source} · {signal.type} · importance{' '}
                {signal.importance}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="priorities-heading">
        <h3
          id="priorities-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Priority Registry
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Katalog priorit — bez skládání Decision Story.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {priorityRegistry.map((priority) => {
            const isOn = registered.has(priority.id);
            return (
              <li key={priority.id}>
                <button
                  type="button"
                  onClick={() => onTogglePriority(priority.id)}
                  aria-pressed={isOn}
                  className={`flex w-full flex-col rounded-[12px] border px-4 py-3 text-left ${
                    isOn
                      ? 'border-builder-navy bg-builder-navy text-white'
                      : 'border-[#DDE5EF] bg-white text-builder-ink'
                  }`}
                >
                  <span className="text-sm font-semibold">{priority.label}</span>
                  <span
                    className={`mt-1 text-[12px] ${
                      isOn ? 'text-white/80' : 'text-builder-muted'
                    }`}
                  >
                    {priority.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="strategies-heading">
        <div className="flex items-center justify-between gap-3">
          <h3
            id="strategies-heading"
            className="text-base font-semibold text-builder-ink"
          >
            Strategies
          </h3>
          <button
            type="button"
            onClick={onAddStrategy}
            className="rounded-[8px] border border-[#DDE5EF] px-3 py-1.5 text-[12px] font-medium"
          >
            + Strategy
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {decisionKnowledge.strategies.map((strategy) => (
            <li
              key={strategy.id}
              className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
            >
              <p className="text-sm font-semibold text-builder-ink">
                {strategy.title}
              </p>
              <p className="mt-1 text-sm text-builder-muted">
                {strategy.description}
              </p>
              <p className="mt-1 text-[12px] text-builder-muted">
                signals: {strategy.targetSignals.join(', ') || '—'}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="decision-history-heading">
        <h3
          id="decision-history-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Historie relace
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Session only — bez persistence.
        </p>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím žádné události.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.slice(0, 10).map((event) => (
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

function SummaryTile({
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
      <p className="mt-1 text-xl font-semibold text-builder-ink">{value}</p>
    </div>
  );
}
