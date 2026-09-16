import { PrimaryLink } from "@embed-engine/ui";
import type { MouseEvent } from "react";

import { useOptionalDecisionAnalytics } from "../../analytics";
import { navigateToJourneySection } from "../../foundation";
import { PILOT_SECTION_IDS } from "../../pilot/pilotVocabulary";

/**
 * Primary Hero CTA — Morning Baseline reference (PT-HERO-00).
 * Lands on Social Proof so Header + full Social Proof + Tour start stay visible.
 *
 * Uses the canonical journey navigator so CTA and pinned TOUR positioning share
 * one target resolver and one programmatic animation authority.
 */
export function HeroCTA() {
  const analytics = useOptionalDecisionAnalytics();

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    navigateToJourneySection(PILOT_SECTION_IDS.walkthrough);

    analytics?.experienceEvent({
      experienceEventType: "hero.video.opened",
      surfaceId: "hero",
    });
    window.history.pushState(null, "", `#${PILOT_SECTION_IDS.socialProof}`);
  };

  return (
    <PrimaryLink
      href={`#${PILOT_SECTION_IDS.socialProof}`}
      data-embed-hero-cta=""
      onClick={handleNavigate}
    >
      Podívat se dovnitř – video →
    </PrimaryLink>
  );
}
