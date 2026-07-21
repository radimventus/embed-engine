/**
 * Priority Runtime state — PriorityJourneyRun plus Journey completion flag.
 *
 * Experience-local Journey state (Integration Model OQ-04 MVP).
 * TODO (ADR / DM-OQ-08): do not write DecisionState / Cognitive Signals here.
 */

import type { PriorityJourneyRun } from "@embed-engine/core/priority";

export type PriorityRuntimeState = PriorityJourneyRun & {
  /**
   * True after a Follow-up handoff was selected (Journey reading finished).
   * Follow-up stage itself is optional handoff UI; completion is explicit.
   */
  readonly completed: boolean;
};
