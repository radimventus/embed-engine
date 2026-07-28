import { PILOT_FLAGS, PILOT_SECTION_IDS } from '../pilot/pilotVocabulary';

export type DecisionJourneyScene = {
  readonly id: string;
  readonly label: string;
};

const BASE_DECISION_JOURNEY_SCENES: readonly DecisionJourneyScene[] = [
  { id: PILOT_SECTION_IDS.hero, label: 'Hero' },
  { id: PILOT_SECTION_IDS.walkthrough, label: 'Tour' },
  { id: PILOT_SECTION_IDS.priority, label: 'Priority' },
  { id: PILOT_SECTION_IDS.aiAdvisor, label: 'Racio' },
  { id: PILOT_SECTION_IDS.audit, label: 'Lead Capture' },
] as const;

/** Top-level onepage scenes — guided only by the Experience layer. */
export function decisionJourneyScenes(): readonly DecisionJourneyScene[] {
  return BASE_DECISION_JOURNEY_SCENES.filter(
    (scene) => scene.id !== PILOT_SECTION_IDS.aiAdvisor || PILOT_FLAGS.showAiAdvisor,
  );
}
