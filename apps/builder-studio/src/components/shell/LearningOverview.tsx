import type {
  LearningEvent,
  LearningOriginDefinition,
  LearningPackage,
} from '../../model';
import { LEARNING_REGISTRY } from '../../services/learning/learning-registry';

type LearningOverviewProps = {
  readonly learningPackage: LearningPackage;
  readonly origins: readonly LearningOriginDefinition[];
  readonly events: readonly LearningEvent[];
  readonly onSave: () => void;
  readonly onAddObservation: () => void;
  readonly onAddPattern: () => void;
  readonly onAddHeuristic: () => void;
};

/**
 * Learning Overview (EPIC-BLD-15).
 * Authoring overview — no ML, AI, sync, or company data sharing.
 */
export function LearningOverview({
  learningPackage,
  origins,
  events,
  onSave,
  onAddObservation,
  onAddPattern,
  onAddHeuristic,
}: LearningOverviewProps) {
  return (
    <div className="space-y-8" data-testid="learning-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Cross-Project Learning
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {learningPackage.metadata.title}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {learningPackage.id} · v{learningPackage.version} ·{' '}
            {learningPackage.metadata.status}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Platforma se učí pouze z anonymizovaných poznatků — ne z dokumentů
            zákazníků.
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
        >
          Uložit Learning
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile
          label={LEARNING_REGISTRY.observations.label}
          value={`${learningPackage.observations.length}`}
        />
        <SummaryTile
          label={LEARNING_REGISTRY.patterns.label}
          value={`${learningPackage.patterns.length}`}
        />
        <SummaryTile
          label={LEARNING_REGISTRY.heuristics.label}
          value={`${learningPackage.heuristics.length}`}
        />
      </div>

      <section aria-labelledby="origins-heading">
        <h3
          id="origins-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Learning Origins
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Původ poznatku — není Knowledge Layer.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {origins.map((origin) => (
            <li
              key={origin.id}
              className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
            >
              <p className="text-sm font-semibold text-builder-ink">
                {origin.label}
              </p>
              <p className="mt-1 text-[12px] text-builder-muted">
                {origin.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="observations-heading">
        <div className="flex items-center justify-between gap-3">
          <h3
            id="observations-heading"
            className="text-base font-semibold text-builder-ink"
          >
            Observations
          </h3>
          <button
            type="button"
            onClick={onAddObservation}
            className="rounded-[8px] border border-[#DDE5EF] px-3 py-1.5 text-[12px] font-medium"
          >
            + Observation
          </button>
        </div>
        <p className="mt-1 text-[13px] text-builder-muted">
          {LEARNING_REGISTRY.observations.description}
        </p>
        <ul className="mt-3 space-y-2">
          {learningPackage.observations.map((observation) => (
            <li
              key={observation.id}
              className="rounded-[12px] border border-[#DDE5EF] px-4 py-3 text-sm"
            >
              <p className="font-semibold text-builder-ink">
                {observation.category}
              </p>
              <p className="mt-1 text-[12px] text-builder-muted">
                origin {observation.origin} · confidence {observation.confidence}{' '}
                · anonymized
              </p>
              <p className="mt-1 text-builder-muted">
                {observation.metadata.notes || '—'}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="patterns-heading">
        <div className="flex items-center justify-between gap-3">
          <h3
            id="patterns-heading"
            className="text-base font-semibold text-builder-ink"
          >
            Patterns
          </h3>
          <button
            type="button"
            onClick={onAddPattern}
            className="rounded-[8px] border border-[#DDE5EF] px-3 py-1.5 text-[12px] font-medium"
          >
            + Pattern
          </button>
        </div>
        <p className="mt-1 text-[13px] text-builder-muted">
          {LEARNING_REGISTRY.patterns.description}
        </p>
        <ul className="mt-3 space-y-2">
          {learningPackage.patterns.map((pattern) => (
            <li
              key={pattern.id}
              className="rounded-[12px] border border-[#DDE5EF] px-4 py-3 text-sm"
            >
              <p className="font-semibold text-builder-ink">
                {pattern.description}
              </p>
              <p className="mt-1 text-[12px] text-builder-muted">
                {pattern.status} · confidence {pattern.confidence} · obs{' '}
                {pattern.observations.length}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="heuristics-heading">
        <div className="flex items-center justify-between gap-3">
          <h3
            id="heuristics-heading"
            className="text-base font-semibold text-builder-ink"
          >
            Heuristics
          </h3>
          <button
            type="button"
            onClick={onAddHeuristic}
            className="rounded-[8px] border border-[#DDE5EF] px-3 py-1.5 text-[12px] font-medium"
          >
            + Heuristic
          </button>
        </div>
        <p className="mt-1 text-[13px] text-builder-muted">
          {LEARNING_REGISTRY.heuristics.description}
        </p>
        <ul className="mt-3 space-y-2">
          {learningPackage.heuristics.map((heuristic) => (
            <li
              key={heuristic.id}
              className="rounded-[12px] border border-[#DDE5EF] px-4 py-3 text-sm"
            >
              <p className="font-semibold text-builder-ink">{heuristic.title}</p>
              <p className="mt-1 text-builder-muted">{heuristic.description}</p>
              <p className="mt-1 text-[12px] text-builder-muted">
                scope {heuristic.scope} · weight {heuristic.weight}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="learning-history-heading">
        <h3
          id="learning-history-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Historie relace
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Session only — bez persistence a bez sdílení mezi firmami.
        </p>
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
