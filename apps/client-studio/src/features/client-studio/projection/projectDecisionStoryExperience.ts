import {
  projectPriorityPipelineStory,
  type PriorityId,
  type PriorityPipelineDecisionStory,
} from '@embed-engine/runtime';

import { PILOT_SECTION_IDS } from '../pilot/pilotVocabulary';
import { formatPriorityIdCs } from '../pilot/decisionTerminalLabels';

/**
 * PT-002 — Experience Projection from MVP Decision Story.
 *
 * Pure presentation mapping. Does not invent primary/secondary —
 * those come from Runtime Decision Story (order only).
 * Does not score, rank, or call AI.
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
  readonly primaryPriorityId: PriorityId | null;
  readonly relatedPriorityIds: readonly PriorityId[];
};

export type ExperienceProjection = {
  readonly story: PriorityPipelineDecisionStory;
  readonly interpretation: ExperienceInterpretation;
  readonly recommendedSectionOrder: readonly ExperienceSectionRef[];
  readonly highlight: ExperienceHighlight;
};

type PriorityPresentation = {
  readonly interpretationHeadline: string;
  readonly interpretationBody: string;
  readonly relatedPriorityIds: readonly PriorityId[];
  readonly recommendedSectionOrder: readonly ExperienceSectionRef[];
};

const SECTION_SPATIAL: ExperienceSectionRef = {
  id: 'spatial',
  href: `#${PILOT_SECTION_IDS.walkthrough}`,
  label: 'Prohlídka objektu',
};

const SECTION_AI: ExperienceSectionRef = {
  id: 'ai-advisor',
  href: `#${PILOT_SECTION_IDS.aiAdvisor}`,
  label: 'AI poradce',
};

const SECTION_AUDIT: ExperienceSectionRef = {
  id: 'audit',
  href: `#${PILOT_SECTION_IDS.audit}`,
  label: 'Audit / kontakt',
};

/** Presentation catalogue keyed by Runtime priority id — not business ranking. */
const PRIORITY_PRESENTATION: Readonly<Record<string, PriorityPresentation>> = {
  energy: {
    interpretationHeadline: 'Energie řídí Decision Story',
    interpretationBody:
      'Experience čte energetiku jako hlavní čočku: efektivita, provoz a technické řešení objektu.',
    relatedPriorityIds: ['operating-costs', 'maintenance'],
    recommendedSectionOrder: [
      { ...SECTION_AI, label: 'AI poradce — energie a provoz' },
      { ...SECTION_SPATIAL, label: 'Prohlídka — technické detaily' },
      { ...SECTION_AUDIT, label: 'Audit energetiky' },
    ],
  },
  'operating-costs': {
    interpretationHeadline: 'Provozní náklady řídí Decision Story',
    interpretationBody:
      'Experience zdůrazňuje dlouhodobé náklady bydlení a provozní dopady rozhodnutí.',
    relatedPriorityIds: ['energy', 'maintenance'],
    recommendedSectionOrder: [
      { ...SECTION_AI, label: 'AI poradce — provozní náklady' },
      { ...SECTION_AUDIT, label: 'Audit provozu' },
      SECTION_SPATIAL,
    ],
  },
  layout: {
    interpretationHeadline: 'Dispozice řídí Decision Story',
    interpretationBody:
      'Experience zvýrazňuje uspořádání místností, tok prostoru a každodenní použití domu.',
    relatedPriorityIds: ['privacy', 'flexibility'],
    recommendedSectionOrder: [
      { ...SECTION_SPATIAL, label: 'Prohlídka — dispozice a místnosti' },
      SECTION_AI,
      SECTION_AUDIT,
    ],
  },
  privacy: {
    interpretationHeadline: 'Soukromí řídí Decision Story',
    interpretationBody:
      'Experience čte dům přes klidové zóny, oddělení a ochranu před okolím.',
    relatedPriorityIds: ['layout', 'plot'],
    recommendedSectionOrder: [
      { ...SECTION_SPATIAL, label: 'Prohlídka — klidové zóny' },
      SECTION_AI,
      SECTION_AUDIT,
    ],
  },
  design: {
    interpretationHeadline: 'Design řídí Decision Story',
    interpretationBody:
      'Experience zvýrazňuje formu, materiály a vizuální charakter — estetika je primární čočkou.',
    relatedPriorityIds: ['quality', 'layout'],
    recommendedSectionOrder: [
      { ...SECTION_SPATIAL, label: 'Prohlídka — materiál a forma' },
      { ...SECTION_AI, label: 'AI poradce — design' },
      { ...SECTION_AUDIT, label: 'Konzultace designu' },
    ],
  },
  quality: {
    interpretationHeadline: 'Kvalita řídí Decision Story',
    interpretationBody:
      'Experience zdůrazňuje provedení, detaily a dlouhodobou hodnotu řešení.',
    relatedPriorityIds: ['design', 'maintenance'],
    recommendedSectionOrder: [SECTION_SPATIAL, SECTION_AUDIT, SECTION_AI],
  },
  plot: {
    interpretationHeadline: 'Pozemek řídí Decision Story',
    interpretationBody:
      'Experience čte vztah domu k pozemku, orientaci a okolí jako hlavní rámec.',
    relatedPriorityIds: ['privacy', 'layout'],
    recommendedSectionOrder: [
      { ...SECTION_SPATIAL, label: 'Prohlídka — vztah k pozemku' },
      SECTION_AUDIT,
      SECTION_AI,
    ],
  },
  investment: {
    interpretationHeadline: 'Investice řídí Decision Story',
    interpretationBody:
      'Experience zvýrazňuje kapitálový rámec, návratnost a obchodní dopady rozhodnutí.',
    relatedPriorityIds: ['operating-costs', 'quality'],
    recommendedSectionOrder: [
      { ...SECTION_AUDIT, label: 'Audit investice' },
      SECTION_AI,
      SECTION_SPATIAL,
    ],
  },
  maintenance: {
    interpretationHeadline: 'Údržba řídí Decision Story',
    interpretationBody:
      'Experience zdůrazňuje dlouhodobou správu, servisovatelnost a provozní zátěž.',
    relatedPriorityIds: ['energy', 'operating-costs'],
    recommendedSectionOrder: [SECTION_AI, SECTION_AUDIT, SECTION_SPATIAL],
  },
  flexibility: {
    interpretationHeadline: 'Flexibilita řídí Decision Story',
    interpretationBody:
      'Experience čte dům jako přizpůsobitelný rámec — změna použití v čase.',
    relatedPriorityIds: ['layout', 'design'],
    recommendedSectionOrder: [SECTION_SPATIAL, SECTION_AI, SECTION_AUDIT],
  },
};

const EMPTY_SECTIONS: readonly ExperienceSectionRef[] = Object.freeze([
  SECTION_SPATIAL,
  SECTION_AI,
  SECTION_AUDIT,
]);

function presentationFor(
  primaryPriority: PriorityId | null,
): PriorityPresentation | null {
  if (primaryPriority === null) {
    return null;
  }
  return PRIORITY_PRESENTATION[primaryPriority] ?? null;
}

/**
 * Project MVP Decision Story → Experience surfaces (PT-002).
 * Input is Runtime story only — UI must not recompute primary/secondary.
 */
export function projectDecisionStoryExperience(
  story: PriorityPipelineDecisionStory,
): ExperienceProjection {
  const presentation = presentationFor(story.primaryPriority);
  const primaryLabel =
    story.primaryPriority === null
      ? null
      : formatPriorityIdCs(story.primaryPriority);
  const secondaryLabel =
    story.secondaryPriority === null
      ? null
      : formatPriorityIdCs(story.secondaryPriority);

  const interpretation: ExperienceInterpretation = presentation
    ? {
        headline: presentation.interpretationHeadline,
        body: presentation.interpretationBody,
        primaryLabel,
        secondaryLabel,
      }
    : {
        headline: 'Decision Story ještě neurčuje čočku',
        body: 'Vyberte priority — Experience se přizpůsobí primární prioritě z Runtime.',
        primaryLabel: null,
        secondaryLabel: null,
      };

  const related =
    presentation?.relatedPriorityIds.filter(
      (id) => id !== story.primaryPriority,
    ) ?? [];

  return Object.freeze({
    story,
    interpretation: Object.freeze(interpretation),
    recommendedSectionOrder: Object.freeze([
      ...(presentation?.recommendedSectionOrder ?? EMPTY_SECTIONS),
    ]),
    highlight: Object.freeze({
      primaryPriorityId: story.primaryPriority,
      relatedPriorityIds: Object.freeze([...related]),
    }),
  });
}

/** Convenience: Experience Context priorityIds → full Experience Projection. */
export function projectExperienceFromPriorityIds(
  priorityIds: readonly PriorityId[],
  updatedAt = 0,
): ExperienceProjection {
  return projectDecisionStoryExperience(
    projectPriorityPipelineStory(priorityIds, updatedAt),
  );
}
