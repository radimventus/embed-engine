/**
 * EPIC-BX-22 — Commercial Platform projection vocabulary (Manager).
 */

export const COMMERCIAL_SECTION_IDS = {
  executive: 'cm-executive',
  dashboard: 'cm-dashboard',
  licenses: 'cm-licenses',
  entitlements: 'cm-entitlements',
  upgrades: 'cm-upgrades',
} as const;

export type CommercialSectionId =
  (typeof COMMERCIAL_SECTION_IDS)[keyof typeof COMMERCIAL_SECTION_IDS];

export const COMMERCIAL_SECTION_NAV = [
  { id: COMMERCIAL_SECTION_IDS.executive, label: 'Shrnutí', short: 'S' },
  { id: COMMERCIAL_SECTION_IDS.dashboard, label: 'Přehled', short: 'P' },
  {
    id: COMMERCIAL_SECTION_IDS.licenses,
    label: 'Předplatná',
    short: 'R',
  },
  {
    id: COMMERCIAL_SECTION_IDS.entitlements,
    label: 'Oprávnění',
    short: 'O',
  },
  { id: COMMERCIAL_SECTION_IDS.upgrades, label: 'Navýšení', short: 'N' },
] as const;
