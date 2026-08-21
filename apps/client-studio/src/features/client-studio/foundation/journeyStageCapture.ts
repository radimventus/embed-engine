import { PILOT_SECTION_IDS } from '../pilot/pilotVocabulary';

export type ClientJourneyStageId = 'tour' | 'priority' | 'racio' | 'audit';

const SECTION_TO_STAGE: Readonly<Record<string, ClientJourneyStageId>> =
  Object.freeze({
    [PILOT_SECTION_IDS.walkthrough]: 'tour',
    [PILOT_SECTION_IDS.priority]: 'priority',
    [PILOT_SECTION_IDS.aiAdvisor]: 'racio',
    [PILOT_SECTION_IDS.audit]: 'audit',
  });

let recordStage: ((stageId: ClientJourneyStageId) => void) | null = null;

export function registerJourneyStageCapture(
  recorder: ((stageId: ClientJourneyStageId) => void) | null,
): void {
  recordStage = recorder;
}

/** Explicit navigation only — never IntersectionObserver / scroll noise. */
export function captureJourneyStageFromSection(sectionId: string): void {
  const stage = SECTION_TO_STAGE[sectionId];
  if (stage === undefined) {
    return;
  }
  recordStage?.(stage);
}
