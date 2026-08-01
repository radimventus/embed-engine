/**
 * EPIC-BX-21 — Commercial Platform projection vocabulary (Manager).
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
  { id: COMMERCIAL_SECTION_IDS.executive, label: 'Executive', short: 'E' },
  { id: COMMERCIAL_SECTION_IDS.dashboard, label: 'Dashboard', short: 'D' },
  { id: COMMERCIAL_SECTION_IDS.licenses, label: 'Licenses', short: 'L' },
  {
    id: COMMERCIAL_SECTION_IDS.entitlements,
    label: 'Entitlements',
    short: 'N',
  },
  { id: COMMERCIAL_SECTION_IDS.upgrades, label: 'Upgrades', short: 'U' },
] as const;
