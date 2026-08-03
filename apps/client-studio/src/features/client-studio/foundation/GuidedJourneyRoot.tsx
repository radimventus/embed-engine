import { useEffect } from 'react';

import { createFrameScheduler } from './scheduleOnAnimationFrame';

type GuidedJourneyRootProps = {
  readonly snapEnabled: boolean;
};

/**
 * Enables gentle CSS scroll snap on the actual scroll root:
 * overlay mount in Delivery, otherwise the document root in standalone mode.
 * RCS-06 — resize handlers coalesce on rAF.
 */
export function GuidedJourneyRoot({ snapEnabled }: GuidedJourneyRootProps) {
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
    const frame = createFrameScheduler(applyHeaderOffset);
    window.addEventListener('resize', frame.schedule, { passive: true });

    return () => {
      window.removeEventListener('resize', frame.schedule);
      frame.cancel();
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

  useEffect(() => {
    const overlayMount = document.querySelector<HTMLElement>(
      '[data-embed-overlay-mount]',
    );
    const html = document.documentElement;
    const body = document.body;
    const roots = [html, body, overlayMount].filter(
      (root): root is HTMLElement => root !== null,
    );
    for (const root of roots) {
      root.dataset.guidedJourneySnap = snapEnabled ? 'on' : 'off';
    }
    return () => {
      for (const root of roots) {
        delete root.dataset.guidedJourneySnap;
      }
    };
  }, [snapEnabled]);

  return null;
}
