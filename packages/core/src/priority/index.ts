/**
 * Priority Experience domain contracts (Priority Domain Model v1.0).
 *
 * Type-only surface for Runtime and Renderer foundations.
 * No factories, validators, or journey logic.
 *
 * Distinct from `@embed-engine/core` experience `PrioritySelection`
 * (`selected`) — domain Journey selection uses `selectedPriorityIds` +
 * `dominantPriorityId` per Domain Model §2.3.
 */

export type { ObjectRef } from "./ObjectRef";

export type {
  ConfirmationMicrocopy,
  PriorityDefinition,
  PriorityIntentContent,
  PriorityPossibleMeanings,
  PriorityStageMicrocopy,
} from "./PriorityDefinition";

export type { PrioritySelection } from "./PrioritySelection";

export type {
  Confirmation,
  ConfirmationPresentationPayload,
} from "./Confirmation";

export type { ConfirmedDecisionContext } from "./ConfirmedDecisionContext";

export { JOURNEY_STAGES } from "./JourneyStage";
export type { JourneyStage } from "./JourneyStage";

export type { PriorityJourneyRun } from "./PriorityJourneyRun";

export type {
  Interpretation,
  InterpretationConfidenceInput,
  InterpretationFactor,
  InterpretationRecommendedIntent,
  InterpretationTradeOff,
} from "./Interpretation";

export type {
  Experience,
  ExperienceAction,
  ExperienceConcern,
  ExperienceConfidence,
  ExperienceEvidence,
} from "./Experience";

export type { ExperienceClaimRef } from "./ExperienceClaimRef";

export { OBJECT_ANCHOR_KINDS } from "./ObjectAnchor";
export type { ObjectAnchor, ObjectAnchorKind } from "./ObjectAnchor";

export type { MappingEntry } from "./MappingEntry";

export type { HouseMappingSet } from "./HouseMappingSet";

export type { FollowUpHandoff } from "./FollowUpHandoff";

export type { TransitionMessage } from "./TransitionMessage";

export { PRIORITY_JOURNEY_EVENTS } from "./PriorityJourneyEvent";
export type {
  PriorityJourneyEvent,
  PriorityJourneyEventType,
} from "./PriorityJourneyEvent";
