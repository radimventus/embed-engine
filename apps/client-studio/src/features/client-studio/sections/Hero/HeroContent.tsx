import { colors } from '@embed-engine/design-tokens';

import { HeroCTA } from './HeroCTA';

const HERO_FEATURES = [
  { value: '124 m2', label: 'Užitná plocha' },
  { value: 'A ++', label: 'Energetická třída' },
  { value: 'Dřevostavba', label: 'Difuzně otevřená' },
] as const;

/** Same veil as former Social Proof divider — anchored to gold line, fading upward. */
const HERO_CONTENT_BOTTOM_VEIL_STYLE = {
  backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${colors.border.default} 30%, #FFFFFF), #FFFFFF)`,
} as const;

/** Left third — solid white information block with copy + CTA. */
export function HeroContent() {
  return (
    <section
      aria-label="Hero Content"
      className="relative flex h-full min-h-0 w-full flex-col justify-center bg-white px-section py-section mobile:py-8"
    >
      <div className="translate-x-[10px]">
        <p className="text-sm font-bold uppercase tracking-wide text-[#D4AF37]">
          MODERN A01 – 4+kk
        </p>

        <h1 className="mt-3 font-sans text-[2.52rem] font-black leading-[1.15] tracking-tight text-embed-foreground-primary">
          Rodinný dům, kde to dýchá štěstím
        </h1>

        <dl className="mt-8 grid grid-cols-3 divide-x divide-embed-border-default">
          {HERO_FEATURES.map((feature) => (
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
