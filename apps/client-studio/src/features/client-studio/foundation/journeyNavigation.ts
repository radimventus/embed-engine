import { PILOT_SECTION_IDS } from "../pilot/pilotVocabulary";
import { captureJourneyStageFromSection } from "./journeyStageCapture";
import { scrollToSection } from "./scrollToSection";

export type JourneySectionNavigator = (sectionId: string) => void;

let sectionNavigator: JourneySectionNavigator | null = null;

/**
 * Registers the live Decision Journey reveal/scroll bridge (RCS-05).
 * ClientStudioPage owns scene reveal; shell nav only requests a section id.
 */
export function registerJourneySectionNavigator(
  navigator: JourneySectionNavigator | null,
): void {
  sectionNavigator = navigator;
}

/** Sections that live in the always-mounted orientation scene. */
export function isOrientationSection(sectionId: string): boolean {
  return (
    sectionId === PILOT_SECTION_IDS.hero ||
    sectionId === PILOT_SECTION_IDS.socialProof ||
    sectionId === PILOT_SECTION_IDS.walkthrough ||
    sectionId === PILOT_SECTION_IDS.floorPlan ||
    sectionId === PILOT_SECTION_IDS.propertyExplorer
  );
}

export function isPrioritySection(sectionId: string): boolean {
  return sectionId === PILOT_SECTION_IDS.priority;
}

export function isRacioSection(sectionId: string): boolean {
  return sectionId === PILOT_SECTION_IDS.aiAdvisor;
}

export function isDecisionSection(sectionId: string): boolean {
  return sectionId === PILOT_SECTION_IDS.audit;
}

/**
 * Reveal the hosting scene when needed, then scroll to the section anchor.
 * Same destinations as desktop sidebar — no new product routes.
 */
export function navigateToJourneySection(sectionId: string): void {
  captureJourneyStageFromSection(sectionId);
  if (sectionNavigator !== null) {
    sectionNavigator(sectionId);
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      scrollToSection(sectionId);
    });
  });
}
