import { PrimaryLink } from '@embed-engine/ui';
import type { MouseEvent } from 'react';

import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';

/**
 * Primary Hero CTA — Morning Baseline reference (PT-HERO-00).
 * Opens Spatial Terminal / walkthrough.
 */
export function HeroCTA() {
  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const target = document.getElementById(PILOT_SECTION_IDS.walkthrough);
    if (target === null) {
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    target.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    target.focus({ preventScroll: true });
    window.history.pushState(null, '', `#${PILOT_SECTION_IDS.walkthrough}`);
  };

  return (
    <PrimaryLink
      href={`#${PILOT_SECTION_IDS.walkthrough}`}
      data-embed-hero-cta=""
      onClick={handleNavigate}
    >
      Podívat se dovnitř – video →
    </PrimaryLink>
  );
}
