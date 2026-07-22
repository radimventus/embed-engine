/**
 * Pilot commercial flags + Czech vocabulary (S-006A).
 * One term per concept. Customer-facing locale: Czech.
 */
export const PILOT_FLAGS = {
  /**
   * FAQ + AI Chat section visibility (approved Client Studio baseline).
   */
  showAiAdvisor: true,
  /**
   * Lead backend is not wired. Use mailto handoff (operational) instead of
   * fake success that pretends a server received the request.
   */
  leadCaptureMode: 'mailto' as const,
} as const;

export const PILOT_LEAD_MAILTO = 'kontakt@astav.cz';

export const PILOT_TERMS = {
  priority: 'Priorita',
  recommendation: 'Doporučení',
  decision: 'Rozhodnutí',
  reason: 'Důvod',
  nextStep: 'Další krok',
  outcome: 'Výsledek',
  commitment: 'Závazek',
  audit: 'Audit',
  lead: 'Poptávka',
  decisionTerminal: 'Rozhodovací terminál',
} as const;

/** Section / scroll anchors for the guided Decision Journey (CSCB-01). */
export const PILOT_SECTION_IDS = {
  hero: 'hero',
  propertyExplorer: 'property-explorer',
  walkthrough: 'walkthrough',
  floorPlan: 'floor-plan',
  priority: 'priority-experience',
  aiAdvisor: 'ai-advisor',
  audit: 'audit-lead-capture',
} as const;

export type PilotSectionId =
  (typeof PILOT_SECTION_IDS)[keyof typeof PILOT_SECTION_IDS];

/** Ordered shell navigation — labels are Czech, customer-facing. */
export const PILOT_SECTION_NAV = [
  { id: PILOT_SECTION_IDS.hero, label: 'Úvod', short: 'Ú' },
  { id: PILOT_SECTION_IDS.propertyExplorer, label: 'Objekt', short: 'O' },
  { id: PILOT_SECTION_IDS.walkthrough, label: 'Prohlídka', short: 'D' },
  { id: PILOT_SECTION_IDS.priority, label: 'Priority', short: 'P' },
  { id: PILOT_SECTION_IDS.aiAdvisor, label: 'AI poradce', short: 'A' },
  { id: PILOT_SECTION_IDS.audit, label: 'Kontakt', short: 'K' },
] as const;

export function formatOutcomeStatusCs(status: string): string {
  switch (status) {
    case 'strong-fit':
      return 'Silná shoda';
    case 'conditional-fit':
      return 'Podmíněná shoda';
    case 'weak-fit':
      return 'Slabá shoda';
    case 'in-progress':
      return 'Probíhá';
    default:
      return status.replace(/-/g, ' ');
  }
}
