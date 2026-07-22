import type { AIContextContract } from '@embed-engine/runtime';

import { formatDecisionKeyCs } from '../../pilot/decisionTerminalLabels';
import { formatOutcomeStatusCs } from '../../pilot/pilotVocabulary';
import { projectAiAdvisorPresentation } from '../../runtime/projectTerminalPresentation';

export type ExperienceFaqItem = {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
};

/**
 * FAQ topics from AIContext — Czech presentation of Runtime keys only.
 */
export function faqItemsFromAiContext(
  ai: AIContextContract,
): readonly ExperienceFaqItem[] {
  return projectAiAdvisorPresentation(ai).faqItems.map((item) =>
    Object.freeze({
      id: item.id,
      question: formatDecisionKeyCs(item.question),
      answer: formatOutcomeStatusCs(item.answer),
    }),
  );
}

/**
 * Opening assistant line from AIContext recommendation key (Czech).
 */
export function advisorIntroFromAiContext(ai: AIContextContract): string {
  return formatDecisionKeyCs(projectAiAdvisorPresentation(ai).intro);
}
