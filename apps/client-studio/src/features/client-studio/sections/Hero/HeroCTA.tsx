import { PrimaryLink } from '@embed-engine/ui';
import type { MouseEvent } from 'react';

import { useOptionalDecisionAnalytics } from '../../analytics';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';
import { scrollToSection } from '../../foundation/scrollToSection';

/**
 * Primary Hero CTA — Morning Baseline reference (PT-HERO-00).
 * Opens Spatial Terminal / walkthrough.
 */
export function HeroCTA() {
  const analytics = useOptionalDecisionAnalytics();

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const target = document.getElementById(PILOT_SECTION_IDS.socialProof);
    if (target === null) {
      return;
    }

    scrollToSection(PILOT_SECTION_IDS.socialProof);
    analytics?.experienceEvent({
      experienceEventType: 'hero.video.opened',
      surfaceId: 'hero',
    });
    target.focus({ preventScroll: true });
    window.history.pushState(null, '', `#${PILOT_SECTION_IDS.socialProof}`);
  };

  return (
    <PrimaryLink
      href={`#${PILOT_SECTION_IDS.socialProof}`}
      data-embed-hero-cta=""
      onClick={handleNavigate}
    >
      Podívat se dovnitř – video →
    </PrimaryLink>
  );
}
