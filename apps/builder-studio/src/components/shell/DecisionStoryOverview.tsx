import type { DecisionStory, StoryEvent } from '../../model';

type DecisionStoryOverviewProps = {
  readonly decisionStory: DecisionStory | null;
  readonly events: readonly StoryEvent[];
  readonly onCompose: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Decision Story Overview (EPIC-BLD-18).
 * Diagnostic view of domain DecisionStory — no rendering / Runtime / AI.
 */
export function DecisionStoryOverview({
  decisionStory,
  events,
  onCompose,
  onValidate,
  onDispose,
  message,
}: DecisionStoryOverviewProps) {
  return (
    <div className="space-y-8" data-testid="decision-story-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Decision Story
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {decisionStory?.metadata.title ?? 'Decision Story'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {decisionStory !== null
              ? `${decisionStory.id} · eval ${decisionStory.evaluationId}`
              : 'Vyžaduje Evaluation Result — Story je doménový model, ne UI.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Story nevykonává logiku, není Runtime ani AI prompt. Pouze
            interpretuje EvaluationResult.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCompose}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Compose Story
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={decisionStory === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={decisionStory === null}
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile
          label="Moves"
          value={`${decisionStory?.summary.moveCount ?? 0}`}
        />
        <SummaryTile
          label="Insights"
          value={`${decisionStory?.summary.insightCount ?? 0}`}
        />
        <SummaryTile
          label="Recommendations"
          value={`${decisionStory?.summary.recommendationCount ?? 0}`}
        />
        <SummaryTile
          label="Actions"
          value={`${decisionStory?.summary.actionCount ?? 0}`}
        />
      </div>

      <section aria-labelledby="story-moves-heading">
        <h3
          id="story-moves-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Moves
        </h3>
        {decisionStory === null || decisionStory.moves.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Compose Story (nejprve Evaluate Rules).
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {decisionStory.moves.map((move) => (
              <li
                key={move.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-builder-ink">
                    {move.title}
                  </p>
                  <span className="rounded-[8px] border border-[#DDE5EF] px-2.5 py-1 text-[12px]">
                    {move.type}
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-builder-muted">
                  {move.description}
                </p>
                <p className="mt-1 text-[12px] text-builder-muted">
                  priority {move.priority} · refs:{' '}
                  {move.references.join(', ') || '—'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="story-graph-heading">
        <h3
          id="story-graph-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Story Graph
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Tok příběhu — oddělený od DecisionGraph.
        </p>
        {decisionStory === null ? (
          <p className="mt-3 text-sm text-builder-muted">Graph není sestaven.</p>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryTile
                label="Nodes"
                value={`${decisionStory.graph.metadata.nodeCount}`}
              />
              <SummaryTile
                label="Edges"
                value={`${decisionStory.graph.metadata.edgeCount}`}
              />
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {decisionStory.graph.nodes.map((node) => (
                <li
                  key={node.id}
                  className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
                >
                  <p className="text-[12px] uppercase tracking-wide text-builder-muted">
                    {node.type}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-builder-ink">
                    {node.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="story-validation-heading">
        <h3
          id="story-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {decisionStory?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {decisionStory.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {decisionStory.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {decisionStory.validation.issues.map((issue) => (
                  <li key={issue.code} className="text-sm text-builder-muted">
                    [{issue.severity}] {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="story-history-heading">
        <h3
          id="story-history-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Historie relace
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
