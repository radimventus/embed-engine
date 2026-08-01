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
  { id: PLATFORM_OPS_SECTION_IDS.overview, label: 'Přehled', short: 'P' },
  { id: PLATFORM_OPS_SECTION_IDS.timeline, label: 'Časová osa', short: 'Č' },
  { id: PLATFORM_OPS_SECTION_IDS.alerts, label: 'Upozornění', short: 'U' },
  { id: PLATFORM_OPS_SECTION_IDS.metrics, label: 'Metriky', short: 'M' },
  { id: PLATFORM_OPS_SECTION_IDS.executive, label: 'Shrnutí', short: 'S' },
] as const;
