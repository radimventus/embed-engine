import { HeroCTA } from './HeroCTA';

export function HeroContent() {
  return (
    <section
      aria-label="Hero Content"
      className="grid h-hero-content grid-cols-[minmax(0,50%)_minmax(120px,15%)_minmax(0,35%)] items-center bg-[linear-gradient(to_right,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.7)_50%,rgba(255,255,255,0.3)_100%)] px-section mobile:grid-cols-1 mobile:gap-4 mobile:py-4"
    >
      <div className="min-w-0 mobile:col-span-1">
        <h1 className="font-sans text-3xl font-black leading-tight tracking-tight text-embed-brand-navy">
          Rodinný dům, kde to dýchá
        </h1>
        <p className="mt-1.5 font-sans text-base font-black leading-snug text-embed-brand-navy">
          MODERN A01 – 4+kk – Energetická třída A – od 7,94 mil. Kč
        </p>
      </div>
      <div aria-hidden="true" className="mobile:hidden" />
      <div className="flex justify-center mobile:justify-start">
        <HeroCTA />
      </div>
    </section>
  );
}
