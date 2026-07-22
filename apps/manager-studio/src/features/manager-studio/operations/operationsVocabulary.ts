/**
 * Operations Terminal vocabulary + navigation (MSCB-01).
 * IA follows docs/platform/OPERATIONS_TERMINAL_v1.0.md — presentation labels only.
 */

export const MANAGER_STUDIO_RELEASE = {
  product: 'Manager Studio',
  version:
    typeof __MANAGER_STUDIO_VERSION__ !== 'undefined'
      ? __MANAGER_STUDIO_VERSION__
      : '0.1.0',
  generation: '1',
} as const;

export const OPERATIONS_SECTION_IDS = {
  overview: 'live-overview',
  timeline: 'timeline',
  journeys: 'active-journeys',
  attention: 'attention-queue',
  insights: 'operational-insights',
  actions: 'actions',
} as const;

export type OperationsSectionId =
  (typeof OPERATIONS_SECTION_IDS)[keyof typeof OPERATIONS_SECTION_IDS];

export const OPERATIONS_SECTION_NAV = [
  { id: OPERATIONS_SECTION_IDS.overview, label: 'Přehled', short: 'P' },
  { id: OPERATIONS_SECTION_IDS.timeline, label: 'Časová osa', short: 'Č' },
  { id: OPERATIONS_SECTION_IDS.journeys, label: 'Aktivní cesty', short: 'A' },
  { id: OPERATIONS_SECTION_IDS.attention, label: 'Pozornost', short: 'O' },
  { id: OPERATIONS_SECTION_IDS.insights, label: 'Poznatky', short: 'Z' },
  { id: OPERATIONS_SECTION_IDS.actions, label: 'Akce', short: 'K' },
] as const;
