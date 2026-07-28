import type {
  AIDecisionGatewayEvent,
  GatewayAIContextPackage,
} from '../../model';

type AIDecisionGatewayOverviewProps = {
  readonly aiContextPackage: GatewayAIContextPackage | null;
  readonly events: readonly AIDecisionGatewayEvent[];
  readonly indexCount: number;
  readonly onBuild: () => void;
  readonly onFilter: () => void;
  readonly onValidate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * AI Gateway Overview (EPIC-BLD-28).
 * Diagnostic AI Context Package — no LLM / chat.
 */
export function AIDecisionGatewayOverview({
  aiContextPackage,
  events,
  indexCount,
  onBuild,
  onFilter,
  onValidate,
  onPublish,
  onDispose,
  message,
}: AIDecisionGatewayOverviewProps) {
  const canMutate =
    aiContextPackage !== null &&
    aiContextPackage.metadata.status !== 'Disposed';

  return (
    <div className="space-y-8" data-testid="ai-decision-gateway-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            AI Gateway
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {aiContextPackage?.metadata.title ?? 'AI Decision Gateway'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {aiContextPackage !== null
              ? `${aiContextPackage.id} · v${aiContextPackage.version} · ${aiContextPackage.metadata.status}`
              : 'Bezpečný AI Context z Knowledge Base — bez LLM.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Gateway nemění Knowledge Base, Heuristics, Patterny ani Learning.
            Nevolá LLM a negeneruje odpovědi.
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
            onClick={onFilter}
            disabled={!canMutate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Filter
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
            onClick={onPublish}
            disabled={!canMutate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Publish Package
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

      <section aria-labelledby="ag-packages-heading">
        <h3
          id="ag-packages-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Context Packages
        </h3>
        {aiContextPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Build Context (volitelně po Base → Synthesize).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Package" value={aiContextPackage.id} />
            <InfoTile label="Version" value={aiContextPackage.version} />
            <InfoTile
              label="Knowledge Base"
              value={aiContextPackage.metadata.knowledgeBaseId}
            />
            <InfoTile
              label="Context"
              value={aiContextPackage.context.id}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="ag-entries-heading">
        <h3
          id="ag-entries-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Knowledge Entries
        </h3>
        {aiContextPackage === null ||
        aiContextPackage.context.knowledgeEntries.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Žádné entries.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {aiContextPackage.context.knowledgeEntries.map((entryId) => (
              <li
                key={entryId}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {entryId}
                </p>
                <p className="mt-1 text-[12px] text-builder-muted">
                  Included in AI Context
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ag-references-heading">
        <h3
          id="ag-references-heading"
          className="text-base font-semibold text-builder-ink"
        >
          References
        </h3>
        {aiContextPackage === null ||
        aiContextPackage.context.references.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {aiContextPackage.context.references.map((ref) => (
              <li
                key={`${ref.knowledgeEntryId}-${ref.relationship}-${ref.weight}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {ref.knowledgeEntryId}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {ref.relationship} (w={ref.weight}) · {ref.metadata.notes}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ag-confidence-heading">
        <h3
          id="ag-confidence-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Confidence
        </h3>
        {aiContextPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              Context confidence: {aiContextPackage.context.confidence}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              maxEntries: {aiContextPackage.context.metadata.maxEntries} ·
              entries: {aiContextPackage.context.knowledgeEntries.length}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="ag-index-heading">
        <h3
          id="ag-index-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Index
        </h3>
        <p className="mt-3 text-sm text-builder-muted">
          Indexed entries: {indexCount}
        </p>
      </section>

      <section aria-labelledby="ag-validation-heading">
        <h3
          id="ag-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {aiContextPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {aiContextPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {aiContextPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {aiContextPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="ag-events-heading">
        <h3
          id="ag-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          AI Gateway Events
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
