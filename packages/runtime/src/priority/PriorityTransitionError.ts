/**
 * Transition / guard failure — no business interpretation, only stage rules.
 */

import type { JourneyStage } from "@embed-engine/core/priority";
import type { PriorityEngineEventType } from "./PriorityEngineEvent";

export type PriorityTransitionErrorCode =
  | "INVALID_TRANSITION"
  | "GUARD_FAILED"
  | "JOURNEY_ALREADY_COMPLETED";

export type PriorityTransitionError = {
  readonly code: PriorityTransitionErrorCode;
  readonly message: string;
  readonly stage: JourneyStage;
  readonly event: PriorityEngineEventType;
};
