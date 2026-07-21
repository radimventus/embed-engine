import type { ReactExperienceModel } from '@embed-engine/model';

import { SECTION_SURFACE_CLASS } from '../section-surface';

type HouseDecisionExperienceProps = {
  experience: ReactExperienceModel;
  onSelectChoice: (decisionId: string, choiceId: string) => void;
  onContinue: () => void;
};

/**
 * Passive House Experience renderer.
 *
 * LEGACY — consumes CommandRuntime `ReactExperienceModel` only.
 * Isolated from Cognitive Session / Interpretation (EX-01 quarantine).
 * No Object Package, no DecisionState, no Cognitive Signals.
 */
export function HouseDecisionExperience({
  experience,
  onSelectChoice,
  onContinue,
}: HouseDecisionExperienceProps) {
  const house = experience.house;
  const current = experience.currentDecision;
  const highlighted = new Set(
    experience.highlights.map((highlight) => highlight.target),
  );

  return (
    <section
      aria-label="House Decision Experience"
      className={`${SECTION_SURFACE_CLASS} px-section pb-section`}
    >
      <h2 className="text-base font-bold tracking-wide text-embed-foreground-primary">
        House Experience
      </h2>
      <p className="mt-2 text-sm text-embed-foreground-primary/70">
        House → Highlights → Recommended Order → Summary
      </p>

      {house ? (
        <div className="mt-section grid gap-section tablet:grid-cols-2">
          <div className="space-y-section">
            <article className="rounded-md border border-embed-border-default bg-embed-background-primary p-section">
              <h3 className="text-sm font-semibold tracking-wide text-embed-foreground-primary">
                House
              </h3>
              <p className="mt-2 text-lg font-bold text-embed-foreground-primary">
                {house.title}
              </p>
              <p className="mt-1 text-xs text-embed-foreground-primary/45">
                {house.reference} · {house.city}, {house.district}
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <div
                  className={
                    highlighted.has('price')
                      ? 'rounded-md bg-embed-brand-gold/15 px-2 py-1.5'
                      : ''
                  }
                >
                  <dt className="text-embed-foreground-primary/45">Cena</dt>
                  <dd className="font-medium text-embed-foreground-primary">
                    {house.price.toLocaleString('cs-CZ')} Kč
                  </dd>
                </div>
                <div
                  className={
                    highlighted.has('layout')
                      ? 'rounded-md bg-embed-brand-gold/15 px-2 py-1.5'
                      : ''
                  }
                >
                  <dt className="text-embed-foreground-primary/45">Dispozice</dt>
                  <dd className="font-medium text-embed-foreground-primary">
                    {house.roomCount} pokojů · {house.usableArea} m²
                  </dd>
                </div>
                <div
                  className={
                    highlighted.has('garden')
                      ? 'rounded-md bg-embed-brand-gold/15 px-2 py-1.5'
                      : ''
                  }
                >
                  <dt className="text-embed-foreground-primary/45">Zahrada</dt>
                  <dd className="font-medium text-embed-foreground-primary">
                    {house.hasGarden ? 'Ano' : 'Ne'} · pozemek{' '}
                    {house.landArea} m²
                  </dd>
                </div>
                <div>
                  <dt className="text-embed-foreground-primary/45">
                    Stavba / energie
                  </dt>
                  <dd className="font-medium text-embed-foreground-primary">
                    {house.construction} · třída {house.energyClass}
                  </dd>
                </div>
              </dl>
            </article>

            {experience.highlights.length > 0 ? (
              <article className="rounded-md border border-embed-border-default bg-embed-background-primary p-section">
                <h3 className="text-sm font-semibold tracking-wide text-embed-foreground-primary">
                  Highlights
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-embed-foreground-primary">
                  {experience.highlights.map((highlight) => (
                    <li key={highlight.target}>
                      <span className="font-medium text-embed-brand-gold">
                        {highlight.label}
                      </span>
                      <span className="text-embed-foreground-primary/70">
                        {' '}
                        — {highlight.reason}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}

            {experience.recommendedRooms.length > 0 ? (
              <article className="rounded-md border border-embed-border-default bg-embed-background-primary p-section">
                <h3 className="text-sm font-semibold tracking-wide text-embed-foreground-primary">
                  Recommended Order
                </h3>
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-embed-foreground-primary">
                  {experience.recommendedRooms.map((room) => (
                    <li key={room.id}>
                      <span className="font-medium">{room.name}</span>
                      <span className="text-embed-foreground-primary/70">
                        {' '}
                        — {room.area} m² · patro {room.floor}
                      </span>
                    </li>
                  ))}
                </ol>
              </article>
            ) : null}
          </div>

          <div className="rounded-md border border-embed-border-default bg-embed-background-primary p-section">
            {experience.summaryReady ? (
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-embed-foreground-primary">
                  Summary
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-embed-foreground-primary">
                  {experience.highlights.map((highlight) => (
                    <li key={highlight.target}>
                      <span className="font-medium text-embed-brand-gold">
                        {highlight.label}
                      </span>
                      <span className="text-embed-foreground-primary/70">
                        {' '}
                        — {highlight.reason}
                      </span>
                    </li>
                  ))}
                </ul>
                {experience.recommendedRooms.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
                      Doporučené pořadí místností
                    </p>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                      {experience.recommendedRooms.map((room) => (
                        <li key={room.id}>{room.name}</li>
                      ))}
                    </ol>
                  </div>
                ) : null}
                {experience.highlights.length === 0 ? (
                  <p className="mt-4 text-sm text-embed-foreground-primary/70">
                    Zatím žádné zvýrazněné preference.
                  </p>
                ) : null}
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-embed-foreground-primary">
                  {current?.title ?? 'Decision'}
                </h3>
                {current?.choices && current.choices.length > 0 ? (
                  <div className="mt-4 flex flex-col gap-2">
                    {current.choices.map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => onSelectChoice(current.id, choice.id)}
                        className="rounded-md border border-embed-border-default px-4 py-3 text-left text-sm font-medium text-embed-foreground-primary transition-colors duration-150 ease-out hover:border-embed-brand-gold hover:bg-embed-brand-gold/10"
                      >
                        {choice.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onContinue}
                    className="mt-4 rounded-md bg-embed-brand-navy px-4 py-3 text-sm font-medium text-embed-background-primary transition-opacity duration-150 ease-out hover:opacity-90"
                  >
                    Pokračovat
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
