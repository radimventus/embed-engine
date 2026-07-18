import { PrimaryLink } from '@embed-engine/ui';
import type { MouseEvent } from 'react';

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
    <PrimaryLink href="#walkthrough" onClick={handleNavigate}>
      Podívat se dovnitř – video →
    </PrimaryLink>
  );
}
