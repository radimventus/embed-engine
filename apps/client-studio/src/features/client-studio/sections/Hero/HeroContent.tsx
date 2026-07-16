import { HeroCTA } from './HeroCTA';

export function HeroContent() {
  return (
    <section
      aria-label="Hero Content"
      className="absolute inset-x-0 bottom-0 z-10 grid h-hero-overlay grid-cols-[minmax(0,50%)_minmax(120px,15%)_minmax(0,35%)] items-center bg-[linear-gradient(90deg,rgba(255,255,255,0.70)_0%,rgba(255,255,255,0.55)_45%,rgba(255,255,255,0.40)_75%,rgba(255,255,255,0.30)_100%)] px-section mobile:static mobile:grid mobile:h-auto mobile:grid-cols-1 mobile:gap-4 mobile:py-4"
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
