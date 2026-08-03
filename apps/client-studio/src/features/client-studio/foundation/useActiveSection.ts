import { useEffect, useState } from 'react';

import { createFrameScheduler } from './scheduleOnAnimationFrame';
import { VIEWPORT_BREAKPOINTS } from './responsiveLayout';

/**
 * Tracks which journey section is in view for shell navigation active state.
 * RCS-05 — mobile rootMargin clears sticky header + bottom nav reading frame.
 * RCS-06 — matchMedia + rAF coalescing; skip redundant activeId updates.
 */
export function useActiveSection(
  sectionIds: readonly string[],
): string | null {
  const [activeId, setActiveId] = useState<string | null>(
    sectionIds[0] ?? null,
  );

  useEffect(() => {
    if (sectionIds.length === 0 || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      return;
    }

    const visibility = new Map<string, number>();

    const overlayMount = document.querySelector<HTMLElement>(
      '[data-embed-overlay-mount]',
    );

    const resolveRootMargin = () => {
      const isCompact =
        window.matchMedia(
          `(max-width: ${VIEWPORT_BREAKPOINTS.desktopMinPx - 1}px)`,
        ).matches;
      // Compact: keep the active band between header and bottom nav.
      return isCompact ? '-18% 0px -42% 0px' : '-20% 0px -55% 0px';
    };

    const publishBest = () => {
      let bestId: string | null = null;
      let bestRatio = 0;
      for (const id of sectionIds) {
        const ratio = visibility.get(id) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      }
      if (bestId === null) {
        return;
      }
      setActiveId((previous) => (previous === bestId ? previous : bestId));
    };

    const onIntersect: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        visibility.set(entry.target.id, entry.intersectionRatio);
      }
      publishBest();
    };

    let observer = new IntersectionObserver(onIntersect, {
      root: overlayMount,
      rootMargin: resolveRootMargin(),
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    for (const element of elements) {
      observer.observe(element);
    }

    const rebuildObserver = () => {
      observer.disconnect();
      observer = new IntersectionObserver(onIntersect, {
        root: overlayMount,
        rootMargin: resolveRootMargin(),
        threshold: [0, 0.25, 0.5, 0.75, 1],
      });
      for (const element of elements) {
        observer.observe(element);
      }
    };

    const compactQuery = window.matchMedia(
      `(max-width: ${VIEWPORT_BREAKPOINTS.desktopMinPx - 1}px)`,
    );
    const frame = createFrameScheduler(rebuildObserver);
    const onBandChange = () => {
      frame.schedule();
    };
    compactQuery.addEventListener('change', onBandChange);

    return () => {
      compactQuery.removeEventListener('change', onBandChange);
      frame.cancel();
      observer.disconnect();
    };
  }, [sectionIds]);

  return activeId;
}
