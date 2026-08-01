import type {
  KnowledgeLayerBundle,
  KnowledgeLayerDefinition,
  KnowledgeLayerEvent,
  KnowledgeReference,
  ResolvedLayerReferences,
} from '../../model';

type KnowledgeLayersOverviewProps = {
  readonly registry: readonly KnowledgeLayerDefinition[];
  readonly bundle: KnowledgeLayerBundle | null;
  readonly references: readonly KnowledgeReference[];
  readonly resolved: {
    readonly platform: ResolvedLayerReferences;
    readonly company: ResolvedLayerReferences;
    readonly object: ResolvedLayerReferences;
    readonly session: ResolvedLayerReferences;
  } | null;
  readonly events: readonly KnowledgeLayerEvent[];
  readonly onEnsureLayers: () => void;
  readonly onAddDemoReferences: () => void;
  readonly onRemoveReference: (referenceId: string) => void;
};

/**
 * Knowledge Layers Overview (EPIC-BLD-14).
 * Architecture of layers and references — no AI, sync, or learning.
 */
export function KnowledgeLayersOverview({
  registry,
  bundle,
  references,
  resolved,
  events,
  onEnsureLayers,
  onAddDemoReferences,
  onRemoveReference,
}: KnowledgeLayersOverviewProps) {
  return (
    <div className="space-y-8" data-testid="knowledge-layers-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Knowledge Layers
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            Multi-Layer Knowledge Architecture
          </h2>
          <p className="mt-2 text-[13px] text-builder-muted">
            Každá znalost patří právě do jedné vrstvy. Knowledge Package drží
            reference — ne kopie.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEnsureLayers}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Layers
          </button>
          <button
            type="button"
            onClick={onAddDemoReferences}
            disabled={bundle === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            + Demo References
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {registry.map((layer) => (
          <div
            key={layer.id}
            className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
          >
            <p className="text-[12px] uppercase tracking-wide text-builder-muted">
              {layer.id}
            </p>
            <p className="mt-1 text-sm font-semibold text-builder-ink">
              {layer.owner}
            </p>
            <p className="mt-1 text-[12px] text-builder-muted">
              scope: {layer.scope}
            </p>
          </div>
        ))}
      </div>

      <section aria-labelledby="layer-models-heading">
        <h3
          id="layer-models-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Layer Models
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Pouze modely — žádný přenos dat mezi vrstvami.
        </p>
        {bundle === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Register Layers.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            <LayerCard
              title="Platform"
              modelId={bundle.platform.id}
              description={bundle.platform.metadata.description}
              status={bundle.platform.metadata.status}
            />
            <LayerCard
              title="Company"
              modelId={bundle.company.id}
              description={bundle.company.metadata.description}
              status={bundle.company.metadata.status}
            />
            <LayerCard
              title="Object"
              modelId={bundle.object.id}
              description={bundle.object.metadata.description}
              status={bundle.object.metadata.status}
            />
            <LayerCard
              title="Session"
              modelId={bundle.session.id}
              description={bundle.session.metadata.description}
              status={bundle.session.metadata.status}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="layer-refs-heading">
        <h3
          id="layer-refs-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Knowledge References
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Vazby Knowledge Package → vrstvy (bez kopií).
        </p>
        {references.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím žádné reference.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {references.map((ref) => (
              <li
                key={ref.id}
                className="flex items-center justify-between gap-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-builder-ink">
                    {ref.layer} · {ref.type}
                  </p>
                  <p className="mt-1 text-[12px] text-builder-muted">
                    {ref.id} → {ref.targetId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveReference(ref.id)}
                  className="rounded-[8px] border border-[#DDE5EF] px-3 py-1.5 text-[12px]"
                >
                  Odebrat
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="resolved-heading">
        <h3
          id="resolved-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Context Resolver
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Vrací odkazy — nevytváří AI Context.
        </p>
        {resolved === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Resolver čeká na layer bundle.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ResolvedCard label="Platform" resolved={resolved.platform} />
            <ResolvedCard label="Company" resolved={resolved.company} />
            <ResolvedCard label="Object" resolved={resolved.object} />
            <ResolvedCard label="Session" resolved={resolved.session} />
          </div>
        )}
      </section>

      <section aria-labelledby="layer-history-heading">
        <h3
          id="layer-history-heading"
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

function LayerCard({
  title,
  modelId,
  description,
  status,
}: {
  readonly title: string;
  readonly modelId: string;
  readonly description: string;
  readonly status: string;
}) {
  return (
    <li className="rounded-[12px] border border-[#DDE5EF] px-4 py-3">
      <p className="text-sm font-semibold text-builder-ink">{title}</p>
      <p className="mt-1 text-[12px] text-builder-muted">
        {modelId} · {status}
      </p>
      <p className="mt-2 text-[13px] text-builder-muted">{description}</p>
    </li>
  );
}

function ResolvedCard({
  label,
  resolved,
}: {
  readonly label: string;
  readonly resolved: ResolvedLayerReferences;
}) {
  return (
    <div className="rounded-[12px] border border-[#DDE5EF] px-4 py-3">
      <p className="text-sm font-semibold text-builder-ink">{label}</p>
      <p className="mt-1 text-[12px] text-builder-muted">
        refs: {resolved.references.length} · model:{' '}
        {resolved.layerModel?.id ?? '—'}
      </p>
    </div>
  );
}
