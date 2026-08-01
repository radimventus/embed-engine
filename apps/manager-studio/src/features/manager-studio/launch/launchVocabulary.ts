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
  { id: LAUNCH_SECTION_IDS.executive, label: 'Executive', short: 'E' },
  { id: LAUNCH_SECTION_IDS.dashboard, label: 'Dashboard', short: 'D' },
  { id: LAUNCH_SECTION_IDS.checklist, label: 'Checklist', short: 'C' },
  { id: LAUNCH_SECTION_IDS.timeline, label: 'Timeline', short: 'T' },
  { id: LAUNCH_SECTION_IDS.gates, label: 'Gates', short: 'G' },
] as const;
