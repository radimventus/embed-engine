import { useEffect } from 'react';

import { PILOT_SECTION_IDS } from '../pilot/pilotVocabulary';
import { useDecisionAnalytics } from './DecisionAnalyticsProvider';
import type { JourneySurfaceId } from './types';

const SURFACE_IDS: readonly JourneySurfaceId[] = [
  PILOT_SECTION_IDS.hero,
  PILOT_SECTION_IDS.walkthrough,
  PILOT_SECTION_IDS.priority,
  PILOT_SECTION_IDS.aiAdvisor,
  PILOT_SECTION_IDS.audit,
] as const;

/**
 * Observes journey surface enter/exit via IntersectionObserver (CSCB-08).
 * Passive — no Runtime interaction.
 */
export function JourneySurfaceObserver() {
  const analytics = useDecisionAnalytics();

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const visible = new Set<JourneySurfaceId>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as JourneySurfaceId;
          if (!SURFACE_IDS.includes(id)) {
            continue;
          }
          if (entry.isIntersecting) {
            if (!visible.has(id)) {
              visible.add(id);
              analytics.setActiveSurface(id);
              analytics.enterSurface(id);
              if (id === PILOT_SECTION_IDS.walkthrough) {
                analytics.experienceEvent({
                  experienceEventType: 'tour.started',
                  surfaceId: id,
                });
              }
              if (id === PILOT_SECTION_IDS.priority) {
                // Decision Terminal is hosted inside Priority Experience.
                analytics.enterSurface('decision-terminal');
              }
            }
          } else if (visible.has(id)) {
            visible.delete(id);
            if (id === PILOT_SECTION_IDS.priority) {
              analytics.exitSurface('decision-terminal');
            }
            if (id === PILOT_SECTION_IDS.walkthrough) {
              analytics.experienceEvent({
                experienceEventType: 'tour.completed',
                surfaceId: id,
              });
            }
            analytics.exitSurface(id);
            analytics.setActiveSurface(null);
          }
        }
      },
      { threshold: 0.35 },
    );

    for (const surfaceId of SURFACE_IDS) {
      const element = document.getElementById(surfaceId);
      if (element !== null) {
        observer.observe(element);
      }
    }

    return () => {
      observer.disconnect();
      for (const surfaceId of [...visible]) {
        analytics.exitSurface(surfaceId);
      }
    };
  }, [analytics]);

  return null;
}
