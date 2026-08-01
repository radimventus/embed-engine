import type {
  DecisionEngineEvent,
  DecisionModel,
} from '../../model';

type DecisionEngineOverviewProps = {
  readonly decisionModel: DecisionModel | null;
  readonly events: readonly DecisionEngineEvent[];
  readonly onBuild: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
};

/**
 * Decision Engine Overview (EPIC-BLD-16).
 * Visualization only — no evaluation, Story, Runtime, or AI.
 */
export function DecisionEngineOverview({
  decisionModel,
  events,
  onBuild,
  onValidate,
  onDispose,
}: DecisionEngineOverviewProps) {
  return (
    <div className="space-y-8" data-testid="decision-engine-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Decision Engine
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {decisionModel?.metadata.title ?? 'Decision Model'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {decisionModel !== null
              ? `${decisionModel.id} · ${decisionModel.metadata.status}`
              : 'Zatím nesloženo — pouze architektura, bez evaluace.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Decision Engine skládá model ze vstupů — nevyhodnocuje pravidla,
            nevytváří Story ani AI Context.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBuild}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Build Model
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={decisionModel === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={
              decisionModel === null ||
              decisionModel.metadata.status === 'Disposed'
            }
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Dispose
          </button>
        </div>
      </div>

      <section aria-labelledby="inputs-heading">
        <h3
          id="inputs-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Inputs
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Knowledge · Decision Knowledge · Experience · Learning
        </p>
        {decisionModel === null ? (
          <p className="mt-3 text-sm text-builder-muted">Spusťte Build Model.</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InputTile label="Knowledge" value={decisionModel.knowledge} />
            <InputTile
              label="Decision Knowledge"
              value={decisionModel.decisionKnowledge}
            />
            <InputTile label="Experience" value={decisionModel.experience} />
            <InputTile label="Learning" value={decisionModel.learning} />
          </ul>
        )}
      </section>

      <section aria-labelledby="nodes-heading">
        <h3
          id="nodes-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Nodes
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          KnowledgeNode · PriorityNode · RuleNode · SignalNode · ExperienceNode
        </p>
        {decisionModel === null || decisionModel.graph.nodes.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Žádné uzly.</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {decisionModel.graph.nodes.map((node) => (
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
                <p className="mt-1 text-[12px] text-builder-muted">
                  {node.id}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="graph-heading">
        <h3
          id="graph-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Graph
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Pouze struktura — bez algoritmů.
        </p>
        {decisionModel === null ? (
          <p className="mt-3 text-sm text-builder-muted">Graph není sestaven.</p>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryTile
                label="Nodes"
                value={`${decisionModel.graph.metadata.nodeCount}`}
              />
              <SummaryTile
                label="Edges"
                value={`${decisionModel.graph.metadata.edgeCount}`}
              />
            </div>
            <ul className="space-y-2">
              {decisionModel.graph.edges.map((edge) => (
                <li
                  key={edge.id}
                  className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-[13px] text-builder-muted"
                >
                  <span className="font-medium text-builder-ink">
                    {edge.relation}
                  </span>
                  <span className="mt-0.5 block">
                    {edge.from} → {edge.to}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="validation-heading">
        <h3
          id="validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {decisionModel?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {decisionModel.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            <p className="mt-1 text-[12px] text-builder-muted">
              {new Date(decisionModel.validation.validatedAt).toLocaleString(
                'cs-CZ',
              )}
            </p>
            {decisionModel.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {decisionModel.validation.issues.map((issue) => (
                  <li key={issue.code} className="text-sm text-builder-muted">
                    [{issue.severity}] {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="decision-engine-history-heading">
        <h3
          id="decision-engine-history-heading"
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

function InputTile({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string | null;
}) {
  return (
    <li className="rounded-[12px] border border-[#DDE5EF] px-4 py-3">
      <p className="text-[12px] uppercase tracking-wide text-builder-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-builder-ink">
        {value ?? '—'}
      </p>
    </li>
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
