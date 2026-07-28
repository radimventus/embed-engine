import type {
  PatternCatalog,
  PatternIntelligenceEvent,
} from '../../model';

type PatternIntelligenceOverviewProps = {
  readonly patternCatalog: PatternCatalog | null;
  readonly events: readonly PatternIntelligenceEvent[];
  readonly indexCount: number;
  readonly onExtract: () => void;
  readonly onMerge: () => void;
  readonly onValidate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Pattern Overview (EPIC-BLD-25).
 * Diagnostic Pattern Catalog — no heuristics / AI.
 */
export function PatternIntelligenceOverview({
  patternCatalog,
  events,
  indexCount,
  onExtract,
  onMerge,
  onValidate,
  onPublish,
  onDispose,
  message,
}: PatternIntelligenceOverviewProps) {
  const canMutate =
    patternCatalog !== null && patternCatalog.metadata.status !== 'Disposed';

  return (
    <div className="space-y-8" data-testid="pattern-intelligence-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Patterns
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {patternCatalog?.metadata.title ?? 'Pattern Intelligence'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {patternCatalog !== null
              ? `${patternCatalog.id} · v${patternCatalog.version} · ${patternCatalog.metadata.status}`
              : 'Ověřené patterny z Learning Records → Pattern Catalog.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Pattern Intelligence nemění Learning Records, Package, Analytics ani
            Runtime. Nevytváří heuristiky. Bez AI.
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
            Publish Catalog
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

      <section aria-labelledby="pi-catalog-heading">
        <h3
          id="pi-catalog-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Catalog
        </h3>
        {patternCatalog === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Extract Patterns (volitelně po Package → Add Record Ref).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Catalog" value={patternCatalog.id} />
            <InfoTile label="Version" value={patternCatalog.version} />
            <InfoTile
              label="Package"
              value={patternCatalog.metadata.packageId}
            />
            <InfoTile
              label="Patterns"
              value={`${patternCatalog.patterns.length}`}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="pi-patterns-heading">
        <h3
          id="pi-patterns-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Patterns
        </h3>
        {patternCatalog === null || patternCatalog.patterns.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Žádné patterny.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {patternCatalog.patterns.map((pattern) => (
              <li
                key={pattern.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-builder-ink">
                    {pattern.name}
                  </p>
                  <span className="text-[12px] text-builder-muted">
                    {pattern.type} · {pattern.metadata.status}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {pattern.description}
                </p>
                <p className="mt-1 text-[12px] text-builder-muted">
                  occurrences: {pattern.occurrences} · sources:{' '}
                  {pattern.sources.join(', ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pi-evidence-heading">
        <h3
          id="pi-evidence-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Evidence
        </h3>
        {patternCatalog === null || patternCatalog.patterns.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {patternCatalog.patterns.map((pattern) => (
              <li
                key={`ev-${pattern.id}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {pattern.name}
                </p>
                <ul className="mt-2 space-y-1">
                  {pattern.evidence.map((item) => (
                    <li
                      key={`${pattern.id}-${item.recordId}-${item.timestamp}`}
                      className="text-[13px] text-builder-muted"
                    >
                      {item.recordId} · snap {item.snapshotId} · w=
                      {item.weight.toFixed(2)} · {item.metadata.source}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pi-confidence-heading">
        <h3
          id="pi-confidence-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Confidence
        </h3>
        {patternCatalog === null || patternCatalog.patterns.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {patternCatalog.patterns.map((pattern) => (
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

      <section aria-labelledby="pi-index-heading">
        <h3
          id="pi-index-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Index
        </h3>
        <p className="mt-3 text-sm text-builder-muted">
          Indexed entries: {indexCount}
        </p>
      </section>

      <section aria-labelledby="pi-validation-heading">
        <h3
          id="pi-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {patternCatalog?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {patternCatalog.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {patternCatalog.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {patternCatalog.validation.issues.map((issue) => (
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

      <section aria-labelledby="pi-events-heading">
        <h3
          id="pi-events-heading"
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
