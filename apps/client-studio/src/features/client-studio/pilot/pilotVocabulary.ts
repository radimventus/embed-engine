/**
 * Pilot decision vocabulary (S-005).
 * One term per concept across Client Studio presentation chrome.
 *
 * Locale note: Hero / Audit framing is CS; Cognitive chapter (Priority + Terminal
 * + Pack advisor copy) is EN until Pack localization. Do not invent synonyms.
 */
export const PILOT_TERMS = {
  priority: 'Priority',
  recommendation: 'Recommendation',
  decision: 'Decision',
  reason: 'Reason',
  nextStep: 'Next Step',
  outcome: 'Outcome',
  commitment: 'Commitment',
  audit: 'Audit',
  lead: 'Lead',
  decisionTerminal: 'Decision Terminal',
} as const;

/** Section / scroll anchors for the guided story. */
export const PILOT_SECTION_IDS = {
  walkthrough: 'walkthrough',
  priority: 'priority-experience',
  audit: 'audit-lead-capture',
} as const;
