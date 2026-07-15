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
    <a
      href="#walkthrough"
      onClick={handleNavigate}
      className="rounded-xl bg-embed-brand-navy px-8 py-4 text-center font-sans text-base font-medium text-embed-white shadow-sm transition-[box-shadow,opacity] duration-150 ease-out hover:opacity-90 hover:shadow-md active:opacity-95 active:shadow-sm"
    >
      Podívat se dovnitř – video
    </a>
  );
}
