/**
 * Pilot commercial flags + Czech vocabulary (S-006A).
 * One term per concept. Customer-facing locale: Czech.
 */
export const PILOT_FLAGS = {
  /**
   * AI free-form replies are placeholder — hide from default pilot.
   * Set true only for internal FAQ experiments.
   */
  showAiAdvisor: false,
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

/** Section / scroll anchors for the guided story. */
export const PILOT_SECTION_IDS = {
  walkthrough: 'walkthrough',
  priority: 'priority-experience',
  audit: 'audit-lead-capture',
} as const;

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
