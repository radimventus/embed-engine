import type {
  PersonalizedContextPackage,
  PersonalizationRuntimeEvent,
} from '../../model';

type PersonalizationRuntimeOverviewProps = {
  readonly personalizedContextPackage: PersonalizedContextPackage | null;
  readonly events: readonly PersonalizationRuntimeEvent[];
  readonly indexCount: number;
  readonly onProject: () => void;
  readonly onRank: () => void;
  readonly onValidate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Personalization Runtime Overview (EPIC-BLD-30).
 * Diagnostic Personalized Decision Context — no LLM.
 */
export function PersonalizationRuntimeOverview({
  personalizedContextPackage,
  events,
  indexCount,
  onProject,
  onRank,
  onValidate,
  onPublish,
  onDispose,
  message,
}: PersonalizationRuntimeOverviewProps) {
  const canMutate =
    personalizedContextPackage !== null &&
    personalizedContextPackage.metadata.status !== 'Disposed';

  return (
    <div className="space-y-8" data-testid="personalization-runtime-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Personalization
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {personalizedContextPackage?.metadata.title ??
              'Personalization Runtime'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {personalizedContextPackage !== null
              ? `${personalizedContextPackage.id} · v${personalizedContextPackage.version} · ${personalizedContextPackage.metadata.status}`
              : 'Runtime projekce AI Context → Personalized Decision Context.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Runtime Engine nemění Knowledge Base, AI Context ani Runtime
            Session. Nepoužívá AI a nevytváří nové znalosti.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onProject}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Project Context
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

      <section aria-labelledby="pr-packages-heading">
        <h3
          id="pr-packages-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Context Packages
        </h3>
        {personalizedContextPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Project Context (volitelně po AI Gateway + Session).
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Package" value={personalizedContextPackage.id} />
            <InfoTile
              label="Version"
              value={personalizedContextPackage.version}
            />
            <InfoTile
              label="AI Context"
              value={personalizedContextPackage.metadata.aiContextPackageId}
            />
            <InfoTile
              label="Session"
              value={personalizedContextPackage.metadata.sessionId}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="pr-ranking-heading">
        <h3
          id="pr-ranking-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Ranking
        </h3>
        {personalizedContextPackage === null ||
        personalizedContextPackage.context.ranking.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {personalizedContextPackage.context.ranking.map((item) => (
              <li
                key={`${item.priority}-${item.knowledgeEntryId}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  #{item.priority} · {item.knowledgeEntryId}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  w={item.weight} · {item.reason}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pr-priority-heading">
        <h3
          id="pr-priority-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Priority Projection
        </h3>
        {personalizedContextPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {personalizedContextPackage.context.priorityProfile.join(' > ')}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              decision:{' '}
              {personalizedContextPackage.context.metadata.decisionProfile}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="pr-behavior-heading">
        <h3
          id="pr-behavior-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Behavior Projection
        </h3>
        {personalizedContextPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {personalizedContextPackage.context.behaviorProfile.join(', ')}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="pr-confidence-heading">
        <h3
          id="pr-confidence-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Confidence
        </h3>
        {personalizedContextPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              Context confidence:{' '}
              {personalizedContextPackage.context.confidence}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="pr-index-heading">
        <h3
          id="pr-index-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Index
        </h3>
        <p className="mt-3 text-sm text-builder-muted">
          Indexed entries: {indexCount}
        </p>
      </section>

      <section aria-labelledby="pr-validation-heading">
        <h3
          id="pr-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {personalizedContextPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {personalizedContextPackage.validation.valid
                ? 'Valid'
                : 'Invalid'}
            </p>
            {personalizedContextPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {personalizedContextPackage.validation.issues.map((issue) => (
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

      <section aria-labelledby="pr-events-heading">
        <h3
          id="pr-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Runtime Events
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
