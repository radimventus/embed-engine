export * from "./runtime/Command";
export * from "./runtime/CommandHandler";
export * from "./runtime/CommandResolver";
export * from "./runtime/MapCommandResolver";
export * from "./runtime/UnknownCommandError";

export * from "./runtime/CommandRuntime";
export * from "./runtime/Runtime";
export * from "./runtime/RuntimeState";
export * from "./runtime/createRuntime";
export * from "./runtime/Workflow";
export * from "./runtime/Interpreter";
export * from "./runtime/DefaultInterpreter";
export * from "./runtime/validate";
export * from "./customer-language/czechRealization";
export * from "./customer-language/houseIdentity";
export * from "./customer-language/priorityCorpusV1";
export * from "./social-proof/socialProofSignal";
export * from "./social-proof/socialProofPresentation";
export * from "./social-proof/socialProofCatalog";
export * from "./social-proof/resolveSocialProofFeed";
export * from "./social-proof/socialProofTicker";

export type {
  Experience,
  ExperienceAction,
  ExperienceConcern,
  ExperienceConfidence,
  ExperienceEvidence,
} from "./experience/Experience";
export type { ExperienceFragment } from "./experience/ExperienceFragment";
export type {
  PriorityId,
  PrioritySelection,
} from "./experience/PrioritySelection";
export { createEmptyPrioritySelection } from "./experience/PrioritySelection";
export {
  composeExperience,
  createExperienceComposer,
  createExperienceFromInterpretation,
  interpretAndCompose,
  type ExperienceComposer,
  type ExperienceComposeInput,
  type ExperienceObjectRef,
} from "./experience/composeExperience";
export * from "./experience/ExperienceSessionSnapshot";
export * from "./experience/createExperienceBinding";

export type {
  Interpretation,
  InterpretationConfidenceInput,
  InterpretationFactor,
  InterpretationRecommendedIntent,
  InterpretationTradeOff,
} from "./interpretation/Interpretation";
export {
  INTERPRETATION_FORBIDDEN_PRESENTATION_KEYS,
  createInterpretation,
} from "./interpretation/Interpretation";
export type {
  DecisionContext,
  DecisionContextPriorities,
  CreateDecisionContextInput,
} from "./interpretation/DecisionContext";
export { createDecisionContext } from "./interpretation/DecisionContext";
export type {
  InterpretationTrace,
  InterpretationTraceConclusionKind,
  InterpretationTraceContribution,
  InterpretationTraceMetadata,
} from "./interpretation/InterpretationTrace";
export {
  INTERPRETATION_TRACE_FORBIDDEN_PRESENTATION_KEYS,
  createInterpretationTrace,
} from "./interpretation/InterpretationTrace";
export type {
  SemanticRuleContract,
  SemanticRuleId,
} from "./interpretation/rules/SemanticRuleContract";
export {
  SEMANTIC_RULE_CATALOG,
  createSemanticRuleContract,
  getSemanticRuleById,
  getSemanticRuleByMeaning,
  listSemanticRuleIds,
  resolveSemanticRuleId,
} from "./interpretation/rules";
export {
  interpretObject,
  type InterpretObjectInput,
} from "./interpretation/interpretObject";
export {
  createInterpretationEngine,
  interpretationEngine,
  toInterpretInput,
  type InterpretationEngine,
  type InterpretationObjectRef,
  type InterpretInput,
} from "./interpretation/InterpretationEngine";

export * from "./runtime/ExecutionContext";
export * from "./runtime/SceneGraph";
export * from "./runtime/evaluate";

export type {
  DecisionMoveDefinition,
  DecisionMoveSlot,
  DecisionOutcome,
  DecisionOutcomeStatus,
  DecisionStory,
  DecisionStoryComposeInput,
  DecisionStoryPack,
  DecisionStoryComposer,
  MoveIntent,
  MoveSlotStatus,
} from "./decision-layer";
export {
  composeDecisionStory,
  createPackStoryComposer,
} from "./decision-layer";

/**
 * Priority Domain Model contracts (`@embed-engine/core/priority`).
 * Journey `PrioritySelection` (`selectedPriorityIds` + `dominantPriorityId`)
 * is distinct from experience composer `PrioritySelection` (`selected`).
 */
export type {
  ObjectRef,
  ConfirmationMicrocopy,
  PriorityDefinition,
  PriorityIntentContent,
  PriorityPossibleMeanings,
  PriorityStageMicrocopy,
  Confirmation,
  ConfirmationPresentationPayload,
  ConfirmedDecisionContext,
  JourneyStage,
  PriorityJourneyRun,
  ExperienceClaimRef,
  ObjectAnchor,
  ObjectAnchorKind,
  MappingEntry,
  HouseMappingSet,
  FollowUpHandoff,
  TransitionMessage,
  PriorityJourneyEvent,
  PriorityJourneyEventType,
} from "./priority";
export {
  JOURNEY_STAGES,
  OBJECT_ANCHOR_KINDS,
  PRIORITY_JOURNEY_EVENTS,
} from "./priority";
