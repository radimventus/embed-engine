import type { MouseEvent } from 'react';

import { CHAPTER_CTA_CLASS, CHAPTER_CTA_FOCUS_CLASS } from '../../chapter-layout';

export function HeroCTA() {
  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const target = document.getElementById('walkthrough');
    if (target === null) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
    window.history.pushState(null, '', '#walkthrough');
  };

  return (
    <a
      href="#walkthrough"
      onClick={handleNavigate}
      className={`${CHAPTER_CTA_CLASS} ${CHAPTER_CTA_FOCUS_CLASS}`}
    >
      Podívat se dovnitř – video
    </a>
  );
}
