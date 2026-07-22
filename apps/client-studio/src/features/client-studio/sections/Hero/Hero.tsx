import { HeroContent } from './HeroContent';
import { HeroImage } from './HeroImage';
import { HeroSurface } from './HeroSurface';
import { SECTION_SURFACE_CLASS } from '../../section-surface';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';

/**
 * Opening Decision Surface — Object Discovery (CSCB-02 / SR-002).
 * Answers: what am I viewing, why care, how to start exploring.
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
        <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,2fr)] tablet:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] mobile:grid-cols-1 mobile:grid-rows-[auto_minmax(16rem,1fr)]">
          <HeroContent />
          <HeroImage />
        </div>
      </HeroSurface>
    </section>
  );
}
