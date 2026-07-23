import { resolvePublicAssetUrl } from '../../runtime/presentationAssetBase';

/** Morning Baseline opening hero photograph (PT-HERO-00 / 5176 reference). */
const REFERENCE_HERO_SRC = '/media/house-modern-01/exterior.webp';

/**
 * Right two-thirds — photography plane (Morning Baseline reference).
 * Soft edge: white veils on the photo’s left edge.
 */
export function HeroImage() {
  const heroSrc = resolvePublicAssetUrl(REFERENCE_HERO_SRC);

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
