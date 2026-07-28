import { useEffect } from 'react';

/**
 * Enables gentle CSS scroll snap on the actual scroll root:
 * overlay mount in Delivery, otherwise the document root in standalone mode.
 */
export function GuidedJourneyRoot() {
  useEffect(() => {
    const overlayMount = document.querySelector<HTMLElement>(
      '[data-embed-overlay-mount]',
    );
    const html = document.documentElement;
    const body = document.body;

    html.dataset.guidedJourneyRoot = 'true';
    body.dataset.guidedJourneyRoot = 'true';
    if (overlayMount !== null) {
      overlayMount.dataset.guidedJourneyRoot = 'true';
    }

    return () => {
      delete html.dataset.guidedJourneyRoot;
      delete body.dataset.guidedJourneyRoot;
      if (overlayMount !== null) {
        delete overlayMount.dataset.guidedJourneyRoot;
      }
    };
  }, []);

  return null;
}
