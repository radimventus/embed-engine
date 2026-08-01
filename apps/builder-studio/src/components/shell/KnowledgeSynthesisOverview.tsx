import type {
  KnowledgeSynthesisEvent,
  SynthesizedKnowledgeBase,
} from '../../model';

type KnowledgeSynthesisOverviewProps = {
  readonly knowledgeBase: SynthesizedKnowledgeBase | null;
  readonly events: readonly KnowledgeSynthesisEvent[];
  readonly indexCount: number;
  readonly onSynthesize: () => void;
  readonly onMerge: () => void;
  readonly onValidate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Knowledge Overview (EPIC-BLD-27).
 * Diagnostic Knowledge Base — no AI / personalization.
 */
export function KnowledgeSynthesisOverview({
  knowledgeBase,
  events,
  indexCount,
  onSynthesize,
  onMerge,
  onValidate,
  onPublish,
  onDispose,
  message,
}: KnowledgeSynthesisOverviewProps) {
  const canMutate =
    knowledgeBase !== null && knowledgeBase.metadata.status !== 'Disposed';

  return (
    <div className="space-y-8" data-testid="knowledge-synthesis-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Knowledge
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {knowledgeBase?.metadata.title ?? 'Knowledge Synthesis'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {knowledgeBase !== null
              ? `${knowledgeBase.id} · v${knowledgeBase.version} · ${knowledgeBase.metadata.status}`
              : 'Konsolidace Heuristic Catalog → Knowledge Base.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Knowledge Synthesis nemění Heuristic Catalog, Pattern Intelligence,
            Learning ani Runtime. Bez AI a personalizace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSynthesize}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Synthesize
          </button>
          <button
            type="button"
            onClick={onMerge}
            disabled={!canMutate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Merge
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
            Publish Base
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

      <section aria-labelledby="ks-base-heading">
        <h3
          id="ks-base-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Knowledge Base
        </h3>
        {knowledgeBase === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Synthesize (volitelně po Heuristics → Derive).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Base" value={knowledgeBase.id} />
            <InfoTile label="Version" value={knowledgeBase.version} />
            <InfoTile label="Catalog" value={knowledgeBase.metadata.catalogId} />
            <InfoTile
              label="Entries"
              value={`${knowledgeBase.entries.length}`}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="ks-entries-heading">
        <h3
          id="ks-entries-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Entries
        </h3>
        {knowledgeBase === null || knowledgeBase.entries.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Žádné entries.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {knowledgeBase.entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-builder-ink">
                    {entry.title}
                  </p>
                  <span className="text-[12px] text-builder-muted">
                    {entry.metadata.status}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {entry.description}
                </p>
                <p className="mt-1 text-[12px] text-builder-muted">
                  sources: {entry.sourceHeuristics.join(', ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ks-references-heading">
        <h3
          id="ks-references-heading"
          className="text-base font-semibold text-builder-ink"
        >
          References
        </h3>
        {knowledgeBase === null || knowledgeBase.entries.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {knowledgeBase.entries.flatMap((entry) =>
              entry.references.map((ref) => (
                <li
                  key={`${entry.id}-${ref.heuristicId}-${ref.relationship}`}
                  className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
                >
                  <p className="text-sm font-semibold text-builder-ink">
                    {entry.title}
                  </p>
                  <p className="mt-1 text-[13px] text-builder-muted">
                    {ref.relationship} → {ref.heuristicId} (w={ref.weight})
                  </p>
                </li>
              )),
            )}
          </ul>
        )}
      </section>

      <section aria-labelledby="ks-confidence-heading">
        <h3
          id="ks-confidence-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Confidence
        </h3>
        {knowledgeBase === null || knowledgeBase.entries.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {knowledgeBase.entries.map((entry) => (
              <li
                key={`conf-${entry.id}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {entry.title}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  confidence: {entry.confidence}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ks-index-heading">
        <h3
          id="ks-index-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Index
        </h3>
        <p className="mt-3 text-sm text-builder-muted">
          Indexed entries: {indexCount}
        </p>
      </section>

      <section aria-labelledby="ks-validation-heading">
        <h3
          id="ks-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {knowledgeBase?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {knowledgeBase.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {knowledgeBase.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {knowledgeBase.validation.issues.map((issue) => (
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

      <section aria-labelledby="ks-events-heading">
        <h3
          id="ks-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Knowledge Events
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
