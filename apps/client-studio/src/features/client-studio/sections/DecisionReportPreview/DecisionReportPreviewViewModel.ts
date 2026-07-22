import type { DecisionTerminalContract } from '@embed-engine/runtime';

import { formatDecisionKeyCs } from '../../pilot/decisionTerminalLabels';
import { formatOutcomeStatusCs } from '../../pilot/pilotVocabulary';
import { projectTerminalPresentation } from '../../runtime/projectTerminalPresentation';

/**
 * Decision Report Preview — presentation projection from Terminal only.
 */
export type DecisionReportPreviewViewModel = {
  readonly title: string;
  readonly summary: string;
  readonly priorities: readonly string[];
  readonly includedItems: readonly string[];
};

/**
 * Maps Terminal to the lead-capture style report preview (Czech labels).
 */
export function decisionReportPreviewFromTerminal(
  terminal: DecisionTerminalContract,
): DecisionReportPreviewViewModel {
  const view = projectTerminalPresentation(terminal);

  return Object.freeze({
    title: formatDecisionKeyCs(view.recommendation),
    summary: formatOutcomeStatusCs(view.status),
    priorities: Object.freeze(
      view.completedMoveIds.map((id) => formatDecisionKeyCs(id)),
    ),
    includedItems: Object.freeze([
      ...view.rationale.map((key) => formatDecisionKeyCs(key)),
      ...view.unresolvedQuestions.map((key) => formatDecisionKeyCs(key)),
      formatDecisionKeyCs(view.recommendedNextAction),
    ]),
  });
}
