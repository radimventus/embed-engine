import type { DecisionTerminalContract } from '@embed-engine/runtime';

import { projectTerminalPresentation } from '../../runtime/projectTerminalPresentation';

/**
 * Pure presentation projection from Decision Terminal — no semantic invention in UI.
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

/**
 * Maps Terminal Outcome fields to Recommendation panel presentation.
 * Does not invent meaning beyond Runtime keys.
 */
export function recommendationViewFromTerminal(
  terminal: DecisionTerminalContract,
): RecommendationViewModel {
  const view = projectTerminalPresentation(terminal);

  return Object.freeze({
    title: view.recommendation,
    matchLabel: view.status,
    matchScore: view.confidence,
    matchExplanation: view.status,
    strengths: Object.freeze([...view.rationale]),
    considerations: Object.freeze([...view.unresolvedQuestions]),
    nextStep: view.recommendedNextAction,
    primaryActionLabel: view.recommendedNextAction,
  });
}
