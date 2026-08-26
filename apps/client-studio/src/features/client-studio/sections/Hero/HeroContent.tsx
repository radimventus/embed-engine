import { useEffect, useState } from 'react';

import {
  CUSTOMER_FACING_EXPLICIT_PRODUCT_NAME,
  realizeCustomerFacingHouseIdentityText,
} from '@embed-engine/core';
import { colors } from '@embed-engine/design-tokens';
import {
  loadPlatformSession,
  projectPartnerBrand,
  type StudioBrandProjection,
} from '@embed-engine/platform-access';

import { HeroCTA } from './HeroCTA';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';

const DEFAULT_HERO_COPY = {
  eyebrow: CUSTOMER_FACING_EXPLICIT_PRODUCT_NAME,
  headline: 'Rodinný dům, kde to dýchá štěstím',
  metrics: [
    { value: '124 m2', label: 'Užitná plocha' },
    { value: 'A ++', label: 'Energetická třída' },
    { value: 'Dřevostavba', label: 'Difuzně otevřená' },
  ],
} as const;

/** Same veil as former Social Proof divider — anchored to gold line, fading upward. */
const HERO_CONTENT_BOTTOM_VEIL_STYLE = {
  backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${colors.border.default} 30%, #FFFFFF), #FFFFFF)`,
} as const;

/**
 * Reference Hero Content — Morning Baseline presentation (PT-HERO-00).
 * PE-02 — partner Hero strip from Brand Projection (presentation only; no Runtime).
 */
export function HeroContent() {
  const [brand, setBrand] = useState<StudioBrandProjection | null>(null);
  const { experience } = useDecisionSessionRuntime();
  const heroCopy = experience.context.hero.copy ?? DEFAULT_HERO_COPY;
  const heroEyebrow = realizeCustomerFacingHouseIdentityText(
    heroCopy.eyebrow,
  );

  useEffect(() => {
    const session = loadPlatformSession();
    const projected = projectPartnerBrand({
      companyId: session?.companyId ?? null,
    });
    setBrand(projected.personalized ? projected : null);
  }, []);

  return (
    <section
      aria-label="Hero Content"
      className="relative flex h-full min-h-0 w-full flex-col justify-center bg-white px-section py-section mobile:py-8 min-w-0"
    >
      <div className="translate-x-[10px] mobile:translate-x-0">
        {brand !== null ? (
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/55"
            data-testid="client-partner-hero"
          >
            {brand.logoLabel} · {brand.companyName} · {brand.heroLabel}
          </p>
        ) : null}
        <p className="text-sm font-bold uppercase tracking-wide text-[#D4AF37]">
          {heroEyebrow}
        </p>

        <h1 className="mt-3 font-sans text-[2.52rem] font-black leading-[1.15] tracking-tight text-embed-foreground-primary mobile:text-[2rem]">
          {heroCopy.headline}
        </h1>

        <dl className="mt-8 grid grid-cols-3 divide-x divide-embed-border-default mobile:grid-cols-1 mobile:gap-3 mobile:divide-x-0">
          {heroCopy.metrics.map((feature, index) => (
            <div
              key={`${feature.label}-${index}`}
              className="flex flex-col px-3 first:pl-0 last:pr-0 mobile:px-0"
            >
              <dd className="order-1 text-base font-bold leading-tight text-[#D4AF37]">
                {feature.value}
              </dd>
              <dt className="order-2 mt-1 text-xs leading-snug text-embed-foreground-primary">
                {feature.label}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex -translate-x-[10px] translate-y-[50px] justify-center mobile:translate-x-0 mobile:translate-y-0 mobile:justify-start">
          <HeroCTA />
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
