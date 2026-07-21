import type { Experience } from '@embed-engine/core/experience';

/**
 * Decision Report Preview — presentation projection from Experience only.
 */
export type DecisionReportPreviewViewModel = {
  readonly title: string;
  readonly summary: string;
  readonly priorities: readonly string[];
  readonly includedItems: readonly string[];
};

/**
 * Maps Experience to the lead-capture style report preview.
 * No mock property names or invented priorities.
 */
export function decisionReportPreviewFromExperience(
  experience: Experience,
): DecisionReportPreviewViewModel {
  return Object.freeze({
    title: experience.title,
    summary: experience.summary,
    priorities: Object.freeze([...experience.focus]),
    includedItems: Object.freeze([
      ...experience.evidence.map((item) => item.title),
      ...experience.concerns.map((item) => item.title),
      ...experience.actions.map((item) => item.label),
    ]),
  });
}
