import type { DecisionTerminalContract } from '@embed-engine/runtime';

import {
  formatDecisionKeyCs,
} from '../../pilot/decisionTerminalLabels';
import { formatOutcomeStatusCs } from '../../pilot/pilotVocabulary';
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
 * Czech labels only — does not invent meaning beyond Runtime keys.
 */
export function recommendationViewFromTerminal(
  terminal: DecisionTerminalContract,
): RecommendationViewModel {
  const view = projectTerminalPresentation(terminal);
  const nextStep = formatDecisionKeyCs(view.recommendedNextAction);

  return Object.freeze({
    title: formatDecisionKeyCs(view.recommendation),
    matchLabel: formatOutcomeStatusCs(view.status),
    matchScore: Math.round(view.confidence * 100),
    matchExplanation: formatOutcomeStatusCs(view.status),
    strengths: Object.freeze(
      view.rationale.map((key) => formatDecisionKeyCs(key)),
    ),
    considerations: Object.freeze(
      view.unresolvedQuestions.map((key) => formatDecisionKeyCs(key)),
    ),
    nextStep,
    primaryActionLabel: nextStep.length > 0 ? nextStep : null,
  });
}
