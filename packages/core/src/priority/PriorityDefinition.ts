/**
 * Priority Domain Model §2.2 — PriorityDefinition.
 *
 * Catalog definition of one priority lens.
 *
 * Open Question DM-OQ-01 (Needs ADR): machine-loadable Priority content package
 * schema (locale, versioning beyond authoring markdown) is not part of this contract.
 */

/**
 * Intent content bound to a PriorityDefinition (Content Model §2.2).
 */
export type PriorityIntentContent = {
  readonly userIntentPhrases: readonly string[];
  readonly intentSummary: string;
};

/**
 * Possible meanings — authoring-only in MVP (Content Model OQ-C01 Resolved).
 * Must not be treated as user diagnosis in UI unless product SSOT changes.
 */
export type PriorityPossibleMeanings = readonly string[];

/**
 * Confirmation stage microcopy units (Content Model §2.4 / Blueprint §3.2).
 */
export type ConfirmationMicrocopy = {
  readonly title: string;
  readonly body: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
};

/**
 * Stage microcopy binding for a PriorityDefinition (Journey chrome — not Experience).
 */
export type PriorityStageMicrocopy = {
  readonly selectionPrompt: string;
  readonly confirmation: ConfirmationMicrocopy;
  /** Transition bridge — 1–2 sentences; no new meaning. */
  readonly transition: string;
};

/**
 * Catalog entry for one priority lens.
 *
 * Identity: `priorityId`.
 */
export type PriorityDefinition = {
  readonly priorityId: string;
  readonly priorityLabel: string;
  readonly priorityMeaning: string;
  readonly priorityNot: string;
  readonly intent: PriorityIntentContent;
  readonly possibleMeanings: PriorityPossibleMeanings;
  readonly stageMicrocopy: PriorityStageMicrocopy;
};
