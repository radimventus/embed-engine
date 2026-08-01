/**
 * EPIC-BX-20 — Product Learning projection vocabulary (Manager).
 */

export const PRODUCT_LEARNING_SECTION_IDS = {
  executive: 'pl-executive',
  insights: 'pl-insights',
  recommendations: 'pl-recommendations',
  roadmap: 'pl-roadmap',
  registry: 'pl-registry',
} as const;

export type ProductLearningSectionId =
  (typeof PRODUCT_LEARNING_SECTION_IDS)[keyof typeof PRODUCT_LEARNING_SECTION_IDS];

export const PRODUCT_LEARNING_SECTION_NAV = [
  { id: PRODUCT_LEARNING_SECTION_IDS.executive, label: 'Executive', short: 'E' },
  { id: PRODUCT_LEARNING_SECTION_IDS.insights, label: 'Insights', short: 'I' },
  {
    id: PRODUCT_LEARNING_SECTION_IDS.recommendations,
    label: 'Themes',
    short: 'T',
  },
  { id: PRODUCT_LEARNING_SECTION_IDS.roadmap, label: 'Roadmap', short: 'R' },
  { id: PRODUCT_LEARNING_SECTION_IDS.registry, label: 'Feedback', short: 'F' },
] as const;
