/**
 * Priority Domain Model §2.16 — PriorityJourneyEvent.
 *
 * Domain vocabulary of Journey events (Runtime Contract §5).
 * Not a Cognitive Signal enum.
 *
 * Open Question DM-OQ-08 (Needs ADR): mapping of these events to Cognitive
 * Signals vs Experience-local events when writing DecisionState.
 */

export const PRIORITY_JOURNEY_EVENTS = [
  "priority.selection.changed",
  "priority.confirmation.accepted",
  "priority.confirmation.edit",
  "priority.transition.completed",
  "priority.interpretation.ready",
  "priority.mapping.ready",
  "priority.followup.selected",
  "priority.context.invalidated",
] as const;

export type PriorityJourneyEventType = (typeof PRIORITY_JOURNEY_EVENTS)[number];

/**
 * Journey event envelope — semantics and ordering only.
 * Payload shapes for Runtime wiring remain outside this contract set.
 */
export type PriorityJourneyEvent = {
  readonly type: PriorityJourneyEventType;
};
