import { useEffect, useState } from 'react';

/**
 * Tracks which operations section is in view for shell navigation active state.
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

    const visibility = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.intersectionRatio);
        }
        let bestId: string | null = null;
        let bestRatio = 0;
        for (const id of sectionIds) {
          const ratio = visibility.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestId !== null) {
          setActiveId(bestId);
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    const observedIds = new Set<string>();
    const observeSections = () => {
      for (const id of sectionIds) {
        if (observedIds.has(id)) continue;
        const element = document.getElementById(id);
        if (element === null) continue;
        observer.observe(element);
        observedIds.add(id);
      }
    };

    observeSections();
    const mutationObserver = new MutationObserver(observeSections);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [sectionIds]);

  return activeId;
}
