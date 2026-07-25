/**
 * @embed-engine/runtime — public Runtime API (ED-DA-03).
 *
 * Decision Session (canonical):
 * - Façade: `createDecisionSessionRuntime`, `DecisionSessionRuntime`, `dispatch`
 * - Contracts: Story / Moves / Outcome / Terminal / AIContext / ExperienceContext
 * - Session serialize / restore / replay
 *
 * Experience modules MUST NOT import `@embed-engine/runtime/testing`
 * (pipeline compose / evaluate / low-level session helpers).
 *
 * @see session/OWNERSHIP.md
 */

export {
  applyPriorityEvent,
  createInitialPriorityRuntimeState,
  createPriorityRuntimeEngine,
  hasConfirmedSelection,
  hasExperience,
  hasHouseMapping,
  isPriorityJourneyComplete,
  isSelectionNonEmpty,
  resetPriorityRuntimeState,
  type ApplyPriorityEventFailure,
  type ApplyPriorityEventResult,
  type ApplyPriorityEventSuccess,
  type PriorityEngineEvent,
  type PriorityEngineEventType,
  type PriorityRuntimeEngine,
  type PriorityRuntimeState,
  type PriorityTransitionError,
  type PriorityTransitionErrorCode,
} from "./priority";

/** Embed fixture helpers — intentional public Priority Journey surface. */
export {
  createGardenEngineEvents,
  createGardenJourneyRun,
} from "./priority/mock";

export {
  renderPriorityJourney,
  type PriorityRenderModel,
} from "./priority/html-renderer";

export {
  AI_CONTEXT_SCHEMA_VERSION,
  DECISION_MOVE_SCHEMA_VERSION,
  DECISION_OUTCOME_SCHEMA_VERSION,
  DECISION_SESSION_FORMAT,
  DECISION_SESSION_SCHEMA_VERSION,
  DECISION_STORY_SCHEMA_VERSION,
  DECISION_TERMINAL_SCHEMA_VERSION,
  DecisionSessionRuntime,
  cloneDecisionSession,
  createDecisionSessionRuntime,
  createFixedClock,
  createSystemClock,
  projectExperienceContext,
  projectPriorityPipelineStory,
  buildDecisionContext,
  replayDecisionSession,
  restoreDecisionSession,
  restoreDecisionSessionFromJson,
  serializeDecisionSession,
  serializeDecisionSessionToJson,
  type AIContext,
  type AIContextContract,
  type DecisionEvent,
  type DecisionFocus,
  type DecisionMove,
  type DecisionMoveContract,
  type DecisionMoveSequence,
  type DecisionMoveStatus,
  type DecisionOutcome,
  type DecisionOutcomeContract,
  type DecisionOutcomeMoveRef,
  type DecisionOutcomeStatus,
  type DecisionSession,
  type DecisionSessionRuntimeOptions,
  type DecisionStory,
  type DecisionStoryChapter,
  type DecisionStoryChapterKind,
  type DecisionStoryContract,
  type DecisionStoryProvenance,
  type DecisionTerminal,
  type DecisionTerminalContract,
  type DispatchFailure,
  type DispatchResult,
  type DispatchSuccess,
  type ExperienceActiveRoomContext,
  type ExperienceContext,
  type ExperienceDecisionContext,
  type ExperienceNavigationContext,
  type ExperienceObjectContext,
  type FocusRoom,
  type ObjectId,
  type PipelineError,
  type PipelineErrorCode,
  type PriorityPipelineDecisionStory,
  type DecisionContext,
  type PriorityId,
  type PriorityProfile,
  type PrioritySignal,
  type PrioritySignalKind,
  type RecommendedMediaRef,
  type RecommendedMediaRole,
  type ReplaySessionResult,
  type RestoreSessionResult,
  type RoomId,
  type RuntimeClock,
  type RuntimeCommand,
  type SerializeSessionResult,
  type SerializedDecisionSession,
  type SessionExperience,
  type SessionInterpretation,
  type SessionRuntimeState,
  type Timestamp,
  type ValidationResult,
} from "./session/public-api";
