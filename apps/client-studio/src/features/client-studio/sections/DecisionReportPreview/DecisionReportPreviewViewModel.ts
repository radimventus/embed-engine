import type { DecisionTerminalContract } from '@embed-engine/runtime';

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
 * Maps Terminal to the lead-capture style report preview.
 * No mock property names or invented priorities.
 */
export function decisionReportPreviewFromTerminal(
  terminal: DecisionTerminalContract,
): DecisionReportPreviewViewModel {
  const view = projectTerminalPresentation(terminal);

  return Object.freeze({
    title: view.recommendation,
    summary: view.status,
    priorities: Object.freeze([...view.completedMoveIds]),
    includedItems: Object.freeze([
      ...view.rationale,
      ...view.unresolvedQuestions,
      view.recommendedNextAction,
    ]),
  });
}
