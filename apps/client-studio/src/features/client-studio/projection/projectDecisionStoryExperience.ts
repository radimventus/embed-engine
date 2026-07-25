import {
  buildDecisionContext,
  projectPriorityPipelineStory,
  type DecisionContext,
} from '@embed-engine/runtime';

import { PILOT_SECTION_IDS } from '../pilot/pilotVocabulary';
import { formatPriorityIdCs } from '../pilot/decisionTerminalLabels';

/**
 * PT-002 / PT-003 — Experience view from Runtime Decision Context.
 *
 * Interpretation texts come only from DecisionContext (Runtime).
 * This module maps Context → UI view models (labels, anchors).
 * No priorityId → copy rules live here.
 */

export type ExperienceSectionRef = {
  readonly id: string;
  readonly href: string;
  readonly label: string;
};

export type ExperienceInterpretation = {
  readonly headline: string;
  readonly body: string;
  readonly primaryLabel: string | null;
  readonly secondaryLabel: string | null;
};

export type ExperienceHighlight = {
  readonly primaryPriorityId: string | null;
  readonly relatedPriorityIds: readonly string[];
};

export type ExperienceProjection = {
  readonly context: DecisionContext;
  readonly interpretation: ExperienceInterpretation;
  readonly recommendedSectionOrder: readonly ExperienceSectionRef[];
  readonly highlight: ExperienceHighlight;
};

/** Stable journey anchors — presentation only, not interpretive ranking. */
const JOURNEY_ANCHORS = [
  { id: 'ai-advisor', href: `#${PILOT_SECTION_IDS.aiAdvisor}` },
  { id: 'spatial', href: `#${PILOT_SECTION_IDS.walkthrough}` },
  { id: 'audit', href: `#${PILOT_SECTION_IDS.audit}` },
] as const;

/**
 * Project Runtime Decision Context → Experience surfaces.
 * Does not invent headline/summary/recommendations.
 */
export function projectExperienceFromDecisionContext(
  context: DecisionContext,
): ExperienceProjection {
  const interpretation: ExperienceInterpretation = {
    headline: context.headline,
    body: context.summary,
    primaryLabel:
      context.focusPriority === null
        ? null
        : formatPriorityIdCs(context.focusPriority),
    secondaryLabel:
      context.secondaryPriority === null
        ? null
        : formatPriorityIdCs(context.secondaryPriority),
  };

  const recommendedSectionOrder: ExperienceSectionRef[] =
    context.recommendations.length === 0
      ? JOURNEY_ANCHORS.map((anchor) => ({
          ...anchor,
          label: anchor.id,
        }))
      : context.recommendations.map((label, index) => {
          const anchor = JOURNEY_ANCHORS[index % JOURNEY_ANCHORS.length]!;
          return {
            id: `recommendation-${index}`,
            href: anchor.href,
            label,
          };
        });

  return Object.freeze({
    context,
    interpretation: Object.freeze(interpretation),
    recommendedSectionOrder: Object.freeze(recommendedSectionOrder),
    highlight: Object.freeze({
      primaryPriorityId: context.focusPriority,
      relatedPriorityIds: Object.freeze(
        context.selectedPriorities.filter((id) => id !== context.focusPriority),
      ),
    }),
  });
}

/** Live Experience: priorityIds (Runtime) → DecisionContext → projection. */
export function projectExperienceFromPriorityIds(
  priorityIds: readonly string[],
  updatedAt = 0,
): ExperienceProjection {
  const story = projectPriorityPipelineStory(priorityIds, updatedAt);
  return projectExperienceFromDecisionContext(buildDecisionContext(story));
}
