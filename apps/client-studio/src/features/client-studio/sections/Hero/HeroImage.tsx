import { HOUSE_PACKAGE } from '../../../walkthrough';

/**
 * Right two-thirds — photography plane.
 * Soft edge: two 1/12-section white veils on the photo’s left edge
 * (photo is 8/12 of section → each veil is 12.5% of this column).
 */
export function HeroImage() {
  const heroSrc = HOUSE_PACKAGE.openingHeroSrc;

  return (
    <section
      role="img"
      aria-label="Rodinný dům MODERN A01"
      className="relative h-full min-h-0 w-full bg-cover bg-[center_42%] bg-no-repeat"
      style={{ backgroundImage: `url('${heroSrc}')` }}
    >
      <div
        aria-hidden="true"
        className="animate-hero-photo-veil pointer-events-none absolute inset-y-0 left-0 z-10 w-1/4 mobile:hidden"
      >
        <div className="absolute inset-y-0 left-0 w-1/2 bg-white/65" />
        <div className="absolute inset-y-0 left-1/2 w-1/2 bg-white/45" />
      </div>
    </section>
  );
}
