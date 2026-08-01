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
  { id: PRODUCT_LEARNING_SECTION_IDS.executive, label: 'Shrnutí', short: 'S' },
  { id: PRODUCT_LEARNING_SECTION_IDS.insights, label: 'Poznatky', short: 'P' },
  {
    id: PRODUCT_LEARNING_SECTION_IDS.recommendations,
    label: 'Témata',
    short: 'T',
  },
  { id: PRODUCT_LEARNING_SECTION_IDS.roadmap, label: 'Roadmapa', short: 'R' },
  {
    id: PRODUCT_LEARNING_SECTION_IDS.registry,
    label: 'Zpětná vazba',
    short: 'Z',
  },
] as const;
