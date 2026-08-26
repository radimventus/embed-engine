import { useEffect } from 'react';

import { createFrameScheduler } from './scheduleOnAnimationFrame';
import {
  VIEWPORT_BREAKPOINTS,
  matchViewportBand,
  usesGuidedScrollSnap,
} from './responsiveLayout';

type GuidedJourneyRootProps = {
  readonly snapEnabled: boolean;
};

/**
 * Enables gentle CSS scroll snap on the actual scroll root:
 * overlay mount in Delivery, otherwise the document root in standalone mode.
 * Mobile disables snap for freer phone scrolling (RCS-01).
 * RCS-06 — resize handlers coalesce on rAF; snap band uses matchMedia.
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

    const applyShellOffsets = () => {
      const header = document.querySelector<HTMLElement>('[data-experience-header]');
      const headerHeight = header?.getBoundingClientRect().height ?? 72;
      const headerOffset = `${Math.ceil(headerHeight + 20)}px`;
      for (const root of roots) {
        root.style.setProperty('--experience-header-height', `${Math.ceil(headerHeight)}px`);
        root.style.setProperty('--guided-journey-header-offset', headerOffset);
        root.style.setProperty(
          '--guided-journey-bottom-nav-offset',
          '0px',
        );
      }
    };

    html.dataset.guidedJourneyRoot = 'true';
    body.dataset.guidedJourneyRoot = 'true';
    if (overlayMount !== null) {
      overlayMount.dataset.guidedJourneyRoot = 'true';
    }
    applyShellOffsets();
    const frame = createFrameScheduler(applyShellOffsets);
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
        root.style.removeProperty('--experience-header-height');
        root.style.removeProperty('--guided-journey-header-offset');
        root.style.removeProperty('--guided-journey-bottom-nav-offset');
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

    const applySnap = () => {
      const band = matchViewportBand(window.innerWidth);
      const enabled =
        snapEnabled && usesGuidedScrollSnap(band);
      for (const root of roots) {
        root.dataset.guidedJourneySnap = enabled ? 'on' : 'off';
      }
    };

    applySnap();

    const mobileQuery = window.matchMedia(
      `(max-width: ${VIEWPORT_BREAKPOINTS.mobileMaxPx}px)`,
    );
    mobileQuery.addEventListener('change', applySnap);

    return () => {
      mobileQuery.removeEventListener('change', applySnap);
      for (const root of roots) {
        delete root.dataset.guidedJourneySnap;
      }
    };
  }, [snapEnabled]);

  return null;
}
