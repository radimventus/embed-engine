import type { AIContextContract } from '@embed-engine/runtime';

import { formatDecisionKeyCs } from '../../pilot/decisionTerminalLabels';
import { formatOutcomeStatusCs } from '../../pilot/pilotVocabulary';
import { projectAiAdvisorPresentation } from '../../runtime/projectTerminalPresentation';
import { DECISION_CATEGORIES } from '../PriorityEngine/decision-cards.constants';
import {
  coachFaqItemsFromPriorities,
} from '../PriorityEngine/priorityCoachingDialogue';

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
 * Coaching FAQ from selected priorities — dialogue continuation (presentation).
 * Falls back to Runtime FAQ projection when no priorities are selected.
 */
export function faqItemsForExperience(input: {
  readonly ai: AIContextContract;
  readonly priorityIds: readonly string[];
}): readonly ExperienceFaqItem[] {
  if (input.priorityIds.length > 0) {
    return coachFaqItemsFromPriorities(input.priorityIds);
  }
  return orderFaqItemsForPriorities(
    faqItemsFromAiContext(input.ai),
    input.priorityIds,
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

/**
 * Chat opening — general invitation into the discussion (CAP UX 56).
 * Priority-aware coaching copy belongs after priorities are set, not as the seed.
 */
export const ADVISOR_DISCUSSION_OPENING = [
  'Jsem tu s vámi i pro volnou diskusi o domě.',
  '',
  'Zeptejte se na cokoli — nebo vyberte otázku vlevo, která navazuje na náš rozhovor.',
].join('\n');

/**
 * Chat opening for the Racio Experience — always a general discussion intro.
 */
export function advisorOpeningForExperience(_input: {
  readonly ai: AIContextContract;
  readonly priorityIds: readonly string[];
}): string {
  return ADVISOR_DISCUSSION_OPENING;
}
