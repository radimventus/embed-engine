import { useEffect } from 'react';

/**
 * Publishes current header offset for smooth guided navigation.
 */
export function GuidedJourneyRoot() {
  useEffect(() => {
    const overlayMount = document.querySelector<HTMLElement>(
      '[data-embed-overlay-mount]',
    );
    const html = document.documentElement;
    const body = document.body;
    const roots = [html, body, overlayMount].filter(
      (root): root is HTMLElement => root !== null,
    );

    const applyHeaderOffset = () => {
      const header = document.querySelector<HTMLElement>('[data-experience-header]');
      const headerHeight = header?.getBoundingClientRect().height ?? 72;
      const offset = `${Math.ceil(headerHeight + 20)}px`;
      for (const root of roots) {
        root.style.setProperty('--guided-journey-header-offset', offset);
      }
    };

    html.dataset.guidedJourneyRoot = 'true';
    body.dataset.guidedJourneyRoot = 'true';
    if (overlayMount !== null) {
      overlayMount.dataset.guidedJourneyRoot = 'true';
    }
    applyHeaderOffset();
    window.addEventListener('resize', applyHeaderOffset);

    return () => {
      window.removeEventListener('resize', applyHeaderOffset);
      delete html.dataset.guidedJourneyRoot;
      delete body.dataset.guidedJourneyRoot;
      if (overlayMount !== null) {
        delete overlayMount.dataset.guidedJourneyRoot;
      }
      for (const root of roots) {
        root.style.removeProperty('--guided-journey-header-offset');
      }
    };
  }, []);

  return null;
}
