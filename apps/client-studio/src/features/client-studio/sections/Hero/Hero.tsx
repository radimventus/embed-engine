import { HeroContent } from './HeroContent';
import { HeroImage } from './HeroImage';
import { HeroSurface } from './HeroSurface';
import { SocialProof } from './SocialProof';
import { SECTION_SURFACE_CLASS } from '../../section-surface';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';

/**
 * Opening Decision Surface — Object Discovery (CSCB-02 / SR-002).
 * Hero Card = photo plane + Social Proof (Morning Baseline / PT-HERO-00A).
 *
 * Reference Implementation v1.0 — design frozen (PT-HERO-FREEZE-01).
 * SSOT: docs/architecture/HERO-V1-FREEZE.md
 */
export function Hero() {
  return (
    <section
      id={PILOT_SECTION_IDS.hero}
      tabIndex={-1}
      aria-label="Object Discovery"
      className={`scroll-mt-header ${SECTION_SURFACE_CLASS}`}
    >
      <HeroSurface>
        <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,2fr)] tabletMin:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)] tabletMax:grid-cols-[minmax(0,1fr)_minmax(0,1.85fr)] mobile:grid-cols-1 mobile:grid-rows-[auto_minmax(16rem,1fr)]">
          <HeroContent />
          <HeroImage />
        </div>
      </HeroSurface>
      <SocialProof />
    </section>
  );
}
