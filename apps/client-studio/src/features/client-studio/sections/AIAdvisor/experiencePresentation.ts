import type { AIContextContract } from '@embed-engine/runtime';

import { projectAiAdvisorPresentation } from '../../runtime/projectTerminalPresentation';

export type ExperienceFaqItem = {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
};

/**
 * FAQ topics projected from AIContext rationale keys — no invented Q&A copy.
 */
export function faqItemsFromAiContext(
  ai: AIContextContract,
): readonly ExperienceFaqItem[] {
  return projectAiAdvisorPresentation(ai).faqItems;
}

/**
 * Opening assistant line from AIContext recommendation key.
 */
export function advisorIntroFromAiContext(ai: AIContextContract): string {
  return projectAiAdvisorPresentation(ai).intro;
}
