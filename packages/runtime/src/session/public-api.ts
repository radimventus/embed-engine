/**
 * Canonical Decision Session public API (ED-DA-03).
 *
 * Experience / Studio modules MUST import from `@embed-engine/runtime`
 * (or `@embed-engine/runtime/session`) — this surface only.
 *
 * Pipeline composers (`compose*`, `evaluate*`, session interpret helpers, …)
 * live on `@embed-engine/runtime/testing` — not for presentation modules.
 *
 * @see OWNERSHIP.md
 */

export {
  createFixedClock,
  createSystemClock,
  type RuntimeClock,
} from "./clock";

export type {
  DecisionEvent,
  ObjectId,
  RoomId,
  Timestamp,
} from "./DecisionEvent";
export type { DecisionSession } from "./DecisionSession";
export type { SessionRuntimeState } from "./SessionRuntimeState";

export {
  DECISION_SESSION_FORMAT,
  DECISION_SESSION_SCHEMA_VERSION,
  cloneDecisionSession,
  restoreDecisionSession,
  restoreDecisionSessionFromJson,
  serializeDecisionSession,
  serializeDecisionSessionToJson,
  type RestoreSessionResult,
  type SerializeSessionResult,
  type SerializedDecisionSession,
} from "./serialize";

export {
  replayDecisionSession,
  type ReplaySessionResult,
} from "./replay";

export {
  projectExperienceContext,
  type ExperienceActiveRoomContext,
  type ExperienceContext,
  type ExperienceDecisionContext,
  type ExperienceNavigationContext,
  type ExperienceObjectContext,
} from "./ExperienceContext";

export type { SessionExperience } from "./projectDecisionSession";

export type {
  FocusRoom,
  RecommendedMediaRef,
  RecommendedMediaRole,
} from "./interpretation";

export type {
  PriorityId,
  PriorityProfile,
  PrioritySignal,
  PrioritySignalKind,
} from "./priority-signals";

export type { DecisionFocus } from "./decision-focus";

export {
  DECISION_STORY_SCHEMA_VERSION,
  type DecisionStory,
  type DecisionStoryChapter,
  type DecisionStoryChapterKind,
  type DecisionStoryContract,
  type DecisionStoryProvenance,
} from "./decision-story";

export {
  DECISION_MOVE_SCHEMA_VERSION,
  type DecisionMove,
  type DecisionMoveContract,
  type DecisionMoveSequence,
  type DecisionMoveStatus,
} from "./decision-moves";

export {
  DECISION_OUTCOME_SCHEMA_VERSION,
  type DecisionOutcome,
  type DecisionOutcomeContract,
  type DecisionOutcomeMoveRef,
  type DecisionOutcomeStatus,
} from "./decision-outcome";

export {
  DECISION_TERMINAL_SCHEMA_VERSION,
  type DecisionTerminal,
  type DecisionTerminalContract,
} from "./decision-terminal";

export {
  AI_CONTEXT_SCHEMA_VERSION,
  type AIContext,
  type AIContextContract,
} from "./ai-context";

export {
  DecisionSessionRuntime,
  createDecisionSessionRuntime,
  type DecisionSessionRuntimeOptions,
  type DispatchFailure,
  type DispatchResult,
  type DispatchSuccess,
  type PipelineError,
  type PipelineErrorCode,
  type RuntimeCommand,
  type SessionInterpretation,
  type ValidationResult,
} from "./pipeline";
