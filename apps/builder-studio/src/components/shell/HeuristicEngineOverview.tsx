import type {
  HeuristicCatalog,
  HeuristicEngineEvent,
} from '../../model';

type HeuristicEngineOverviewProps = {
  readonly heuristicCatalog: HeuristicCatalog | null;
  readonly events: readonly HeuristicEngineEvent[];
  readonly indexCount: number;
  readonly onDerive: () => void;
  readonly onValidate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Heuristic Overview (EPIC-BLD-26).
 * Diagnostic Heuristic Catalog — no Knowledge / AI.
 */
export function HeuristicEngineOverview({
  heuristicCatalog,
  events,
  indexCount,
  onDerive,
  onValidate,
  onPublish,
  onDispose,
  message,
}: HeuristicEngineOverviewProps) {
  const canMutate =
    heuristicCatalog !== null &&
    heuristicCatalog.metadata.status !== 'Disposed';

  return (
    <div className="space-y-8" data-testid="heuristic-engine-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Heuristics
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {heuristicCatalog?.metadata.title ?? 'Heuristic Engine'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {heuristicCatalog !== null
              ? `${heuristicCatalog.id} · v${heuristicCatalog.version} · ${heuristicCatalog.metadata.status}`
              : 'Odvození heuristik z Pattern Collection → Heuristic Catalog.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Heuristic Engine nemění Pattern Collection, Learning Package ani
            Runtime. Nevytváří Knowledge Layer. Bez AI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDerive}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Derive Heuristics
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

      <section aria-labelledby="he-catalog-heading">
        <h3
          id="he-catalog-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Catalog
        </h3>
        {heuristicCatalog === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Derive Heuristics (volitelně po Extraction → Extract).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Catalog" value={heuristicCatalog.id} />
            <InfoTile label="Version" value={heuristicCatalog.version} />
            <InfoTile
              label="Collection"
              value={heuristicCatalog.metadata.collectionId}
            />
            <InfoTile
              label="Heuristics"
              value={`${heuristicCatalog.heuristics.length}`}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="he-heuristics-heading">
        <h3
          id="he-heuristics-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Heuristics
        </h3>
        {heuristicCatalog === null ||
        heuristicCatalog.heuristics.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Žádné heuristiky.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {heuristicCatalog.heuristics.map((heuristic) => (
              <li
                key={heuristic.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-builder-ink">
                    {heuristic.name}
                  </p>
                  <span className="text-[12px] text-builder-muted">
                    P{heuristic.priority} · {heuristic.metadata.status}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {heuristic.description}
                </p>
                <p className="mt-1 text-[12px] text-builder-muted">
                  sources: {heuristic.sourcePatterns.join(', ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="he-rules-heading">
        <h3
          id="he-rules-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Rules
        </h3>
        {heuristicCatalog === null ||
        heuristicCatalog.heuristics.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {heuristicCatalog.heuristics.flatMap((heuristic) =>
              heuristic.rules.map((rule) => (
                <li
                  key={rule.id}
                  className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
                >
                  <p className="text-sm font-semibold text-builder-ink">
                    {heuristic.name}
                  </p>
                  <p className="mt-1 text-[13px] text-builder-muted">
                    if {rule.condition} → {rule.outcome} (w={rule.weight})
                  </p>
                </li>
              )),
            )}
          </ul>
        )}
      </section>

      <section aria-labelledby="he-confidence-heading">
        <h3
          id="he-confidence-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Confidence
        </h3>
        {heuristicCatalog === null ||
        heuristicCatalog.heuristics.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {heuristicCatalog.heuristics.map((heuristic) => (
              <li
                key={`conf-${heuristic.id}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {heuristic.name}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  confidence: {heuristic.confidence}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="he-index-heading">
        <h3
          id="he-index-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Index
        </h3>
        <p className="mt-3 text-sm text-builder-muted">
          Indexed entries: {indexCount}
        </p>
      </section>

      <section aria-labelledby="he-validation-heading">
        <h3
          id="he-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {heuristicCatalog?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {heuristicCatalog.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {heuristicCatalog.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {heuristicCatalog.validation.issues.map((issue) => (
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

      <section aria-labelledby="he-events-heading">
        <h3
          id="he-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Heuristic Events
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
