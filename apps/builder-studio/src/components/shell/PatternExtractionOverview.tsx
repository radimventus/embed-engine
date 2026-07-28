import type {
  PatternCollection,
  PatternEngineEvent,
} from '../../model';

type PatternExtractionOverviewProps = {
  readonly patternCollection: PatternCollection | null;
  readonly events: readonly PatternEngineEvent[];
  readonly indexCount: number;
  readonly onExtract: () => void;
  readonly onValidate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Pattern Overview (EPIC-BLD-24).
 * Diagnostic view of Pattern Extraction — no heuristics / AI.
 */
export function PatternExtractionOverview({
  patternCollection,
  events,
  indexCount,
  onExtract,
  onValidate,
  onPublish,
  onDispose,
  message,
}: PatternExtractionOverviewProps) {
  const canMutate =
    patternCollection !== null &&
    !patternCollection.patterns.every(
      (pattern) => pattern.metadata.status === 'Disposed',
    );

  return (
    <div className="space-y-8" data-testid="pattern-extraction-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Patterns
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {patternCollection?.metadata.title ?? 'Pattern Extraction'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {patternCollection !== null
              ? `${patternCollection.id} · v${patternCollection.version}`
              : 'Identifikace opakujících se vzorů z Learning Package.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Pattern Engine nemění Learning Package, Analytics ani Runtime.
            Nevytváří heuristiky ani doporučení. Bez AI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExtract}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Extract Patterns
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
            Publish
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

      <section aria-labelledby="pe-collections-heading">
        <h3
          id="pe-collections-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Collections
        </h3>
        {patternCollection === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Extract Patterns (ideálně po Package → Add Record Ref).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Collection" value={patternCollection.id} />
            <InfoTile label="Version" value={patternCollection.version} />
            <InfoTile
              label="Package"
              value={patternCollection.metadata.packageId}
            />
            <InfoTile
              label="Patterns"
              value={`${patternCollection.patterns.length}`}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="pe-patterns-heading">
        <h3
          id="pe-patterns-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Patterns
        </h3>
        {patternCollection === null ||
        patternCollection.patterns.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Žádné patterny.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {patternCollection.patterns.map((pattern) => (
              <li
                key={pattern.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-builder-ink">
                    {pattern.name}
                  </p>
                  <span className="text-[12px] text-builder-muted">
                    {pattern.metadata.status}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {pattern.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pe-confidence-heading">
        <h3
          id="pe-confidence-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Confidence
        </h3>
        {patternCollection === null ||
        patternCollection.patterns.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {patternCollection.patterns.map((pattern) => (
              <li
                key={`conf-${pattern.id}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {pattern.name}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  confidence: {pattern.confidence}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pe-sources-heading">
        <h3
          id="pe-sources-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Sources
        </h3>
        {patternCollection === null ||
        patternCollection.patterns.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {patternCollection.patterns.map((pattern) => (
              <li
                key={`src-${pattern.id}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {pattern.name}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {pattern.sourceRecords.join(', ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pe-index-heading">
        <h3
          id="pe-index-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Index
        </h3>
        <p className="mt-3 text-sm text-builder-muted">
          Indexed entries: {indexCount}
        </p>
      </section>

      <section aria-labelledby="pe-validation-heading">
        <h3
          id="pe-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {patternCollection?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {patternCollection.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {patternCollection.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {patternCollection.validation.issues.map((issue) => (
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

      <section aria-labelledby="pe-events-heading">
        <h3
          id="pe-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Pattern Events
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
