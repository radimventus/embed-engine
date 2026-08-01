/**
 * EPIC-BX-19 — Platform Operations Center projection vocabulary (Manager).
 * Distinct from MSCB Operations Terminal (partner cases).
 */

export const PLATFORM_OPS_SECTION_IDS = {
  overview: 'poc-overview',
  timeline: 'poc-timeline',
  alerts: 'poc-alerts',
  metrics: 'poc-metrics',
  executive: 'poc-executive',
} as const;

export type PlatformOpsSectionId =
  (typeof PLATFORM_OPS_SECTION_IDS)[keyof typeof PLATFORM_OPS_SECTION_IDS];

export const PLATFORM_OPS_SECTION_NAV = [
  { id: PLATFORM_OPS_SECTION_IDS.overview, label: 'Overview', short: 'P' },
  { id: PLATFORM_OPS_SECTION_IDS.timeline, label: 'Timeline', short: 'T' },
  { id: PLATFORM_OPS_SECTION_IDS.alerts, label: 'Alerts', short: 'A' },
  { id: PLATFORM_OPS_SECTION_IDS.metrics, label: 'Metrics', short: 'M' },
  { id: PLATFORM_OPS_SECTION_IDS.executive, label: 'Executive', short: 'E' },
] as const;
