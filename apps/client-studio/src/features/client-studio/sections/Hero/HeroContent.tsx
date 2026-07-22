import { colors } from '@embed-engine/design-tokens';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { HeroCTA } from './HeroCTA';

/** Same veil as former Social Proof divider — anchored to gold line, fading upward. */
const HERO_CONTENT_BOTTOM_VEIL_STYLE = {
  backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${colors.border.default} 30%, #FFFFFF), #FFFFFF)`,
} as const;

/** Left third — Object facts from projected Experience (CAP-HP-003.1). */
export function HeroContent() {
  const { experience } = useDecisionSessionRuntime();
  const { house } = experience;

  const features = [
    { value: `${house.usableArea} m2`, label: 'Užitná plocha' },
    { value: house.energyClass, label: 'Energetická třída' },
    { value: house.construction, label: 'Konstrukce' },
  ] as const;

  return (
    <section
      aria-label="Hero Content"
      className="relative flex h-full min-h-0 w-full flex-col justify-center bg-white px-section py-section mobile:py-8"
    >
      <div className="translate-x-[10px]">
        <p className="text-sm font-bold uppercase tracking-wide text-[#D4AF37]">
          {house.reference} – {house.title}
        </p>

        <h1 className="mt-3 font-sans text-[2.52rem] font-black leading-[1.15] tracking-tight text-embed-foreground-primary">
          {house.city}, {house.district}
        </h1>

        <dl className="mt-8 grid grid-cols-3 divide-x divide-embed-border-default">
          {features.map((feature) => (
            <div key={feature.label} className="flex flex-col px-3 first:pl-0 last:pr-0">
              <dd className="order-1 text-base font-bold leading-tight text-[#D4AF37]">
                {feature.value}
              </dd>
              <dt className="order-2 mt-1 text-xs leading-snug text-embed-foreground-primary">
                {feature.label}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex -translate-x-[10px] translate-y-[50px] justify-center">
          <HeroCTA />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[33px]"
        style={HERO_CONTENT_BOTTOM_VEIL_STYLE}
      />
    </section>
  );
}
