/**
 * EPIC-BX-23 — Launch Center projection vocabulary (Manager).
 */

export const LAUNCH_SECTION_IDS = {
  executive: 'lc-executive',
  dashboard: 'lc-dashboard',
  checklist: 'lc-checklist',
  timeline: 'lc-timeline',
  gates: 'lc-gates',
} as const;

export type LaunchSectionId =
  (typeof LAUNCH_SECTION_IDS)[keyof typeof LAUNCH_SECTION_IDS];

export const LAUNCH_SECTION_NAV = [
  { id: LAUNCH_SECTION_IDS.executive, label: 'Shrnutí', short: 'S' },
  { id: LAUNCH_SECTION_IDS.dashboard, label: 'Přehled', short: 'P' },
  { id: LAUNCH_SECTION_IDS.checklist, label: 'Kontrolní seznam', short: 'K' },
  { id: LAUNCH_SECTION_IDS.timeline, label: 'Časová osa', short: 'Č' },
  { id: LAUNCH_SECTION_IDS.gates, label: 'Brány připravenosti', short: 'B' },
] as const;
