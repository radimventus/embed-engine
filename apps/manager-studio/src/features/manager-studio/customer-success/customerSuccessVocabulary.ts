/**
 * EPIC-BX-17 — Customer Success projection vocabulary (Manager).
 */

export const CUSTOMER_SUCCESS_SECTION_IDS = {
  adoption: 'cs-adoption',
  health: 'cs-health',
  onboarding: 'cs-onboarding',
  timeline: 'cs-timeline',
  recommendations: 'cs-recommendations',
} as const;

export type CustomerSuccessSectionId =
  (typeof CUSTOMER_SUCCESS_SECTION_IDS)[keyof typeof CUSTOMER_SUCCESS_SECTION_IDS];

export const CUSTOMER_SUCCESS_SECTION_NAV = [
  {
    id: CUSTOMER_SUCCESS_SECTION_IDS.adoption,
    label: 'Adopce',
    short: 'A',
  },
  {
    id: CUSTOMER_SUCCESS_SECTION_IDS.health,
    label: 'Zdraví',
    short: 'Z',
  },
  {
    id: CUSTOMER_SUCCESS_SECTION_IDS.onboarding,
    label: 'Onboarding',
    short: 'O',
  },
  {
    id: CUSTOMER_SUCCESS_SECTION_IDS.timeline,
    label: 'Úspěch',
    short: 'U',
  },
  {
    id: CUSTOMER_SUCCESS_SECTION_IDS.recommendations,
    label: 'Doporučení',
    short: 'D',
  },
] as const;
