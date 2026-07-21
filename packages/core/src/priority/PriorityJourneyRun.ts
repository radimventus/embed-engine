/**
 * Priority Domain Model §2.7 — PriorityJourneyRun.
 *
 * One execution of Priority Decision Journey for an object + selection context.
 * Tracks stage, Selection, Confirmation, produced outputs, and invalidation boundary.
 *
 * MVP persistence: active Experience only (ADR-007) — no cross-visit promise.
 * Not a second cognitive aggregate (ADR-002 — DecisionState remains sole).
 */

import type { Confirmation } from "./Confirmation";
import type { Experience } from "./Experience";
import type { FollowUpHandoff } from "./FollowUpHandoff";
import type { HouseMappingSet } from "./HouseMappingSet";
import type { Interpretation } from "./Interpretation";
import type { JourneyStage } from "./JourneyStage";
import type { ObjectRef } from "./ObjectRef";
import type { PrioritySelection } from "./PrioritySelection";
import type { TransitionMessage } from "./TransitionMessage";

export type PriorityJourneyRun = {
  readonly object: ObjectRef;
  readonly stage: JourneyStage;
  readonly selection: PrioritySelection;
  readonly confirmation: Confirmation | null;
  readonly transitionMessage: TransitionMessage | null;
  readonly interpretation: Interpretation | null;
  readonly experience: Experience | null;
  readonly houseMapping: HouseMappingSet | null;
  readonly followUps: readonly FollowUpHandoff[] | null;
};
