import type { Experience } from '@embed-engine/core/experience';

/**
 * Pure presentation projection from Experience — no semantic invention in UI.
 */
export type RecommendationViewModel = {
  readonly title: string;
  readonly matchLabel: string;
  readonly matchScore: number;
  readonly matchExplanation: string;
  readonly strengths: readonly string[];
  readonly considerations: readonly string[];
  readonly nextStep: string;
  readonly primaryActionLabel: string | null;
};

const LEVEL_CS = {
  low: 'nízká',
  medium: 'střední',
  high: 'vysoká',
} as const;

/**
 * Maps Experience fields to Recommendation panel presentation.
 * Does not reorder priorities or invent meaning.
 */
export function recommendationViewFromExperience(
  experience: Experience,
): RecommendationViewModel {
  const primary = experience.actions.find((action) => action.type === 'primary');

  return Object.freeze({
    title: experience.title,
    matchLabel: LEVEL_CS[experience.confidence.level],
    matchScore: experience.confidence.score,
    matchExplanation: experience.confidence.explanation,
    strengths: Object.freeze(
      experience.evidence.map((item) => item.title),
    ),
    considerations: Object.freeze(
      experience.concerns.map((item) => item.title),
    ),
    nextStep:
      experience.recommendations[0] ??
      primary?.label ??
      experience.summary,
    primaryActionLabel: primary?.label ?? null,
  });
}
