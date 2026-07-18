import { HeroContent } from './HeroContent';
import { HeroImage } from './HeroImage';
import { HeroSurface } from './HeroSurface';
import { SocialProof } from './SocialProof';
import { SECTION_SURFACE_CLASS } from '../../section-surface';

export function Hero() {
  return (
    <section aria-label="Opening" className={SECTION_SURFACE_CLASS}>
      <HeroSurface>
        <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,2fr)] mobile:grid-cols-1 mobile:grid-rows-[auto_minmax(16rem,1fr)]">
          <HeroContent />
          <HeroImage />
        </div>
      </HeroSurface>
      <SocialProof />
    </section>
  );
}
