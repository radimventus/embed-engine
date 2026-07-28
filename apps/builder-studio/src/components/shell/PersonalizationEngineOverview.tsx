import type {
  PersonalizationEngineEvent,
  PersonalizationPackage,
} from '../../model';

type PersonalizationEngineOverviewProps = {
  readonly personalizationPackage: PersonalizationPackage | null;
  readonly events: readonly PersonalizationEngineEvent[];
  readonly indexCount: number;
  readonly onPersonalize: () => void;
  readonly onRank: () => void;
  readonly onValidate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Personalization Overview (EPIC-BLD-29).
 * Diagnostic Personalization Package — no LLM / recommendations.
 */
export function PersonalizationEngineOverview({
  personalizationPackage,
  events,
  indexCount,
  onPersonalize,
  onRank,
  onValidate,
  onPublish,
  onDispose,
  message,
}: PersonalizationEngineOverviewProps) {
  const canMutate =
    personalizationPackage !== null &&
    personalizationPackage.metadata.status !== 'Disposed';

  return (
    <div className="space-y-8" data-testid="personalization-engine-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Personalization
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {personalizationPackage?.metadata.title ?? 'Personalization Engine'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {personalizationPackage !== null
              ? `${personalizationPackage.id} · v${personalizationPackage.version} · ${personalizationPackage.metadata.status}`
              : 'Deterministická projekce AI Context pro Decision Session.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Personalization nemění Knowledge Base, AI Context ani Runtime
            Session. Nevolá LLM a nevytváří nové znalosti.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPersonalize}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Personalize
          </button>
          <button
            type="button"
            onClick={onRank}
            disabled={!canMutate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Rank
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

      <section aria-labelledby="pe-packages-heading">
        <h3
          id="pe-packages-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Personalization Packages
        </h3>
        {personalizationPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Personalize (volitelně po AI Gateway → Build a Session).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Package" value={personalizationPackage.id} />
            <InfoTile label="Version" value={personalizationPackage.version} />
            <InfoTile
              label="AI Context"
              value={personalizationPackage.metadata.aiContextPackageId}
            />
            <InfoTile
              label="Session"
              value={personalizationPackage.metadata.sessionId}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="pe-contexts-heading">
        <h3
          id="pe-contexts-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Personalized Contexts
        </h3>
        {personalizationPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {personalizationPackage.context.id}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              session: {personalizationPackage.context.sessionId} · profile:{' '}
              {personalizationPackage.context.priorityProfile.join(' > ')} ·{' '}
              {personalizationPackage.context.metadata.status}
            </p>
            <p className="mt-1 text-[12px] text-builder-muted">
              entries:{' '}
              {personalizationPackage.context.knowledgeEntries.join(', ')}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="pe-ranking-heading">
        <h3
          id="pe-ranking-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Ranking
        </h3>
        {personalizationPackage === null ||
        personalizationPackage.context.ranking.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {personalizationPackage.context.ranking.map((item) => (
              <li
                key={`${item.rank}-${item.knowledgeEntryId}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  #{item.rank} · {item.knowledgeEntryId}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  score: {item.score}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pe-rules-heading">
        <h3
          id="pe-rules-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Rules
        </h3>
        {personalizationPackage === null ||
        personalizationPackage.rules.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {personalizationPackage.rules.map((rule) => (
              <li
                key={rule.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {rule.id}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  if {rule.condition} → {rule.adjustment} (w={rule.weight})
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
        {personalizationPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              Context confidence:{' '}
              {personalizationPackage.context.confidence}
            </p>
          </div>
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
        {personalizationPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {personalizationPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {personalizationPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {personalizationPackage.validation.issues.map((issue) => (
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
          Personalization Events
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
