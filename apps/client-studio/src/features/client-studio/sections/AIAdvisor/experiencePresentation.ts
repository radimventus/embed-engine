import type { AIContextContract } from '@embed-engine/runtime';

import { formatDecisionKeyCs } from '../../pilot/decisionTerminalLabels';
import { formatOutcomeStatusCs } from '../../pilot/pilotVocabulary';
import { projectAiAdvisorPresentation } from '../../runtime/projectTerminalPresentation';
import { DECISION_CATEGORIES } from '../PriorityEngine/decision-cards.constants';

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
 * Presentation reorder — surface topics related to selected priorities first.
 * Does not change Runtime FAQ content.
 */
export function orderFaqItemsForPriorities(
  items: readonly ExperienceFaqItem[],
  priorityIds: readonly string[],
): readonly ExperienceFaqItem[] {
  if (priorityIds.length === 0 || items.length <= 1) {
    return items;
  }

  const titles = priorityIds.map(
    (id) =>
      DECISION_CATEGORIES.find((category) => category.id === id)?.title ?? id,
  );
  const score = (item: ExperienceFaqItem): number => {
    const haystack = `${item.question} ${item.id}`.toLowerCase();
    let points = 0;
    priorityIds.forEach((id, index) => {
      const title = titles[index]?.toLowerCase() ?? '';
      if (haystack.includes(id.toLowerCase()) || (title && haystack.includes(title))) {
        points += priorityIds.length - index;
      }
    });
    return points;
  };

  return [...items].sort((left, right) => score(right) - score(left));
}

/**
 * Opening assistant line from AIContext recommendation key (Czech).
 */
export function advisorIntroFromAiContext(ai: AIContextContract): string {
  return formatDecisionKeyCs(projectAiAdvisorPresentation(ai).intro);
}
