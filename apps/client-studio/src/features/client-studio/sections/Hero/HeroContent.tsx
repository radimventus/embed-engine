import { colors } from '@embed-engine/design-tokens';

import {
  formatDecisionKeyCs,
  DECISION_TERMINAL_CHROME_CS,
} from '../../pilot/decisionTerminalLabels';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { HeroDecisionEntries } from './HeroDecisionEntries';

const HERO_CONTENT_BOTTOM_VEIL_STYLE = {
  backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${colors.border.default} 30%, #FFFFFF), #FFFFFF)`,
} as const;

/**
 * Hero — Object Discovery Decision Surface (CSCB-02 / Experience Integration Pack 1).
 * Reads Runtime Context only. Surfaces Focus already projected on `hero`.
 */
export function HeroContent() {
  const { experience } = useDecisionSessionRuntime();
  const object = experience.context.object;
  const hero = experience.context.hero;
  const location = `${object.city} – ${object.district}`;

  const focusReason = hero.primaryReason.trim();
  const nextStep = hero.recommendedAction.trim();
  const showFocus = focusReason.length > 0 || hero.focusRoomName !== null;

  return (
    <section
      aria-label="Hero Content"
      className="relative flex h-full min-h-0 w-full flex-col justify-center bg-white px-section py-section mobile:py-8"
      data-object-id={object.id}
      data-object-reference={object.reference}
      data-focus-room={hero.focusRoomName ?? undefined}
    >
      <div className="translate-x-[10px] mobile:translate-x-0">
        <p className="text-sm font-bold uppercase tracking-wide text-embed-brand-gold">
          {hero.eyebrow}
        </p>

        <h1 className="mt-3 font-sans text-[2.52rem] font-black leading-[1.15] tracking-tight text-embed-foreground-primary mobile:text-[2rem]">
          {hero.title}
        </h1>

        <p className="mt-2 text-sm font-medium text-embed-foreground-primary/80">
          {location}
        </p>

        <p className="mt-1 text-sm text-embed-foreground-primary/60">
          {object.construction}
          <span className="mx-2 text-embed-border-strong" aria-hidden="true">
            ·
          </span>
          Energetická třída {object.energyClass}
        </p>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-embed-foreground-primary/70">
          {hero.description}
        </p>

        {showFocus ? (
          <p
            className="mt-4 max-w-md text-sm leading-relaxed text-embed-foreground-primary"
            data-testid="hero-runtime-focus"
            aria-label="Začátek Decision Story"
          >
            {hero.focusRoomName !== null ? (
              <>
                <span className="font-medium text-embed-brand-gold">
                  {DECISION_TERMINAL_CHROME_CS.focus}: {hero.focusRoomName}
                </span>
                {focusReason.length > 0 ? (
                  <span className="text-embed-foreground-primary/70">
                    {' '}
                    · {formatDecisionKeyCs(focusReason)}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-embed-foreground-primary/70">
                {formatDecisionKeyCs(focusReason)}
              </span>
            )}
            {nextStep.length > 0 ? (
              <>
                <br />
                <span className="text-embed-foreground-primary/80">
                  {DECISION_TERMINAL_CHROME_CS.nextStep}:{' '}
                  {formatDecisionKeyCs(nextStep)}
                </span>
              </>
            ) : null}
          </p>
        ) : null}

        <dl className="mt-8 grid grid-cols-3 divide-x divide-embed-border-default mobile:grid-cols-1 mobile:gap-3 mobile:divide-x-0">
          {hero.metrics.map((feature) => (
            <div
              key={feature.label}
              className="flex flex-col px-3 first:pl-0 last:pr-0 mobile:px-0"
            >
              <dd className="order-1 text-base font-bold leading-tight text-embed-brand-gold">
                {feature.value}
              </dd>
              <dt className="order-2 mt-1 text-xs leading-snug text-embed-foreground-primary">
                {feature.label}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex -translate-x-[10px] translate-y-[50px] justify-center mobile:translate-x-0 mobile:translate-y-0 mobile:justify-start">
          <HeroDecisionEntries />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[33px] mobile:hidden"
        style={HERO_CONTENT_BOTTOM_VEIL_STYLE}
      />
    </section>
  );
}
