import { resolvePublicAssetUrl } from '../../runtime/presentationAssetBase';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';

/**
 * Right two-thirds — photography plane (Morning Baseline reference).
 * Soft edge: white veils on the photo’s left edge.
 * Image source: Builder Package Hero Registry via Experience Context (CAP-BP-01).
 */
export function HeroImage() {
  const { experience } = useDecisionSessionRuntime();
  const heroSrc = resolvePublicAssetUrl(
    experience.context.hero.primaryMediaUrl ?? experience.context.hero.heroMedia?.url ?? '',
  );

  return (
    <section
      role="img"
      aria-label="Rodinný dům MODERN A01"
      className="relative h-full min-h-0 w-full bg-cover bg-[center_42%] bg-no-repeat"
      style={heroSrc ? { backgroundImage: `url('${heroSrc}')` } : undefined}
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
