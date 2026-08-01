import type {
  AIContextPackage,
  ContextEvent,
  ContextFragment,
} from '../../model';

type AIContextPreviewProps = {
  readonly aiContext: AIContextPackage | null;
  readonly events: readonly ContextEvent[];
  readonly onBuild: () => void;
  readonly onRefresh: () => void;
  readonly onClear: () => void;
};

/**
 * AI Context Preview (EPIC-BLD-13).
 * Preview only — no LLM, prompts, chat, or Runtime.
 */
export function AIContextPreview({
  aiContext,
  events,
  onBuild,
  onRefresh,
  onClear,
}: AIContextPreviewProps) {
  return (
    <div className="space-y-8" data-testid="ai-context-preview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            AI Context
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {aiContext?.metadata.title ?? 'AI Context Package'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {aiContext !== null
              ? `${aiContext.id} · v${aiContext.version} · ${aiContext.metadata.status}`
              : 'Zatím nesloženo — dočasný balíček, bez persistence.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            AI dostává pouze AIContextPackage — nikdy přímo Object / Knowledge /
            Decision.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBuild}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Build Context
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={aiContext === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={aiContext === null || aiContext.metadata.status === 'Cleared'}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile
          label="Object"
          value={aiContext?.objectContext ? '1' : '0'}
        />
        <SummaryTile
          label="Experience"
          value={aiContext?.experienceContext ? '1' : '0'}
        />
        <SummaryTile
          label="Knowledge"
          value={aiContext?.knowledgeContext ? '1' : '0'}
        />
        <SummaryTile
          label="Decision"
          value={aiContext?.decisionContext ? '1' : '0'}
        />
      </div>

      <FragmentSection
        title="Object fragment"
        fragment={aiContext?.objectContext ?? null}
      />
      <FragmentSection
        title="Experience fragment"
        fragment={aiContext?.experienceContext ?? null}
      />
      <FragmentSection
        title="Knowledge fragment"
        fragment={aiContext?.knowledgeContext ?? null}
      />
      <FragmentSection
        title="Decision fragment"
        fragment={aiContext?.decisionContext ?? null}
      />

      <section aria-labelledby="context-package-heading">
        <h3
          id="context-package-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Context Package
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Výsledný dočasný balíček — Composer merge / sort / deduplicate.
        </p>
        {aiContext === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Build Context.
          </p>
        ) : (
          <pre className="mt-3 overflow-x-auto rounded-[12px] border border-[#DDE5EF] bg-white p-4 text-[12px] leading-relaxed text-builder-ink">
            {JSON.stringify(
              {
                id: aiContext.id,
                version: aiContext.version,
                status: aiContext.metadata.status,
                fragments: aiContext.fragments.map((item) => ({
                  id: item.id,
                  type: item.type,
                  priority: item.priority,
                  source: item.metadata.source,
                })),
                objectContext: summarizePayload(aiContext.objectContext),
                experienceContext: summarizePayload(aiContext.experienceContext),
                knowledgeContext: summarizePayload(aiContext.knowledgeContext),
                decisionContext: summarizePayload(aiContext.decisionContext),
              },
              null,
              2,
            )}
          </pre>
        )}
      </section>

      <section aria-labelledby="context-history-heading">
        <h3
          id="context-history-heading"
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

function FragmentSection({
  title,
  fragment,
}: {
  readonly title: string;
  readonly fragment: ContextFragment | null;
}) {
  const headingId = `${title.toLowerCase().replace(/\s+/g, '-')}-heading`;
  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className="text-base font-semibold text-builder-ink">
        {title}
      </h3>
      {fragment === null ? (
        <p className="mt-2 text-sm text-builder-muted">Nedostupné.</p>
      ) : (
        <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
          <p className="text-sm font-semibold text-builder-ink">
            {fragment.id}
          </p>
          <p className="mt-1 text-[12px] text-builder-muted">
            {fragment.type} · priority {fragment.priority} ·{' '}
            {fragment.metadata.source}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            {fragment.metadata.notes}
          </p>
          <pre className="mt-3 overflow-x-auto rounded-[8px] bg-builder-canvas p-3 text-[11px] text-builder-ink">
            {JSON.stringify(fragment.payload, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}

function summarizePayload(
  fragment: ContextFragment | null,
): Readonly<Record<string, unknown>> | null {
  if (fragment === null) {
    return null;
  }
  return {
    id: fragment.id,
    type: fragment.type,
    priority: fragment.priority,
    keys: Object.keys(fragment.payload),
  };
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
