import type {
  DecisionRuntimeEvent,
  RuntimeModel,
} from '../../model';

type DecisionRuntimeOverviewProps = {
  readonly runtimeModel: RuntimeModel | null;
  readonly events: readonly DecisionRuntimeEvent[];
  readonly onCreate: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
};

/**
 * Decision Runtime Overview (EPIC-BLD-16 Runtime Foundation).
 * Preview only — no evaluation, session, Story, or AI.
 */
export function DecisionRuntimeOverview({
  runtimeModel,
  events,
  onCreate,
  onValidate,
  onDispose,
}: DecisionRuntimeOverviewProps) {
  return (
    <div className="space-y-8" data-testid="decision-runtime-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Decision Runtime
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {runtimeModel?.metadata.title ?? 'Runtime Model'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {runtimeModel !== null
              ? `${runtimeModel.id} · ${runtimeModel.status}`
              : 'Zatím nepřipraveno — Runtime pouze připravuje vykonatelný model.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Runtime nic neinterpretuje a nic nevyhodnocuje. Vyžaduje Decision
            Model.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCreate}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Create Runtime
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={
              runtimeModel === null || runtimeModel.status === 'Disposed'
            }
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={
              runtimeModel === null || runtimeModel.status === 'Disposed'
            }
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Dispose
          </button>
        </div>
      </div>

      <section aria-labelledby="runtime-state-heading">
        <h3
          id="runtime-state-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime State
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Initialized · Ready · Disposed
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(['Initialized', 'Ready', 'Disposed'] as const).map((state) => {
            const active = runtimeModel?.status === state;
            return (
              <div
                key={state}
                className={`rounded-[12px] border px-4 py-3 ${
                  active
                    ? 'border-builder-navy bg-builder-navy text-white'
                    : 'border-[#DDE5EF] bg-white text-builder-ink'
                }`}
              >
                <p className="text-sm font-semibold">{state}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="runtime-model-heading">
        <h3
          id="runtime-model-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime Model
        </h3>
        {runtimeModel === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Create Runtime (nejprve Build Decision Model v Engine).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Runtime ID" value={runtimeModel.id} />
            <InfoTile
              label="Decision Model"
              value={runtimeModel.decisionModelId}
            />
            <InfoTile label="Object" value={runtimeModel.metadata.objectId} />
            <InfoTile label="Status" value={runtimeModel.status} />
          </ul>
        )}
      </section>

      <section aria-labelledby="runtime-context-heading">
        <h3
          id="runtime-context-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime Context
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Inputs · Environment · Configuration — bez session logiky.
        </p>
        {runtimeModel === null ? (
          <p className="mt-3 text-sm text-builder-muted">Context není připraven.</p>
        ) : (
          <div className="mt-3 space-y-3">
            <pre className="overflow-x-auto rounded-[12px] border border-[#DDE5EF] bg-white p-4 text-[12px] leading-relaxed text-builder-ink">
              {JSON.stringify(runtimeModel.context, null, 2)}
            </pre>
          </div>
        )}
      </section>

      <section aria-labelledby="runtime-graph-heading">
        <h3
          id="runtime-graph-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime Graph
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Projekce Decision Graph — pouze struktura.
        </p>
        {runtimeModel === null ? (
          <p className="mt-3 text-sm text-builder-muted">Graph není připraven.</p>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryTile
                label="Nodes"
                value={`${runtimeModel.graph.metadata.nodeCount}`}
              />
              <SummaryTile
                label="Edges"
                value={`${runtimeModel.graph.metadata.edgeCount}`}
              />
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {runtimeModel.graph.nodes.slice(0, 12).map((node) => (
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

      <section aria-labelledby="runtime-validation-heading">
        <h3
          id="runtime-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {runtimeModel?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {runtimeModel.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {runtimeModel.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {runtimeModel.validation.issues.map((issue) => (
                  <li key={issue.code} className="text-sm text-builder-muted">
                    [{issue.severity}] {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="runtime-history-heading">
        <h3
          id="runtime-history-heading"
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

function InfoTile({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <li className="rounded-[12px] border border-[#DDE5EF] px-4 py-3">
      <p className="text-[12px] uppercase tracking-wide text-builder-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-builder-ink">{value}</p>
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
