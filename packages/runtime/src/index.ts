/**
 * @embed-engine/runtime — Runtime packages (Priority Journey + Decision Session).
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

export {
  GARDEN_OBJECT_ID,
  GARDEN_PRIORITY_ID,
  GARDEN_PRIMARY_FOLLOWUP_TARGET_ID,
  createGardenEngineEvents,
  createGardenJourneyRun,
  gardenContentPackage,
  gardenExperience,
  gardenFollowUps,
  gardenHouseMapping,
  gardenInterpretation,
  gardenPrioritySelection,
  gardenTransitionMessage,
} from "./priority/mock";

export {
  renderPriorityJourney,
  type PriorityRenderModel,
} from "./priority/html-renderer";

export {
  DECISION_SESSION_FORMAT,
  DECISION_SESSION_SCHEMA_VERSION,
  cloneDecisionSession,
  createDecisionSession,
  createInitialSessionRuntimeState,
  freezeDecisionSession,
  projectDecisionSession,
  replayDecisionSession,
  restoreDecisionSession,
  restoreDecisionSessionFromJson,
  selectRoom,
  serializeDecisionSession,
  serializeDecisionSessionToJson,
  type CreateDecisionSessionInput,
  type DecisionEvent,
  type DecisionEventType,
  type DecisionSession,
  type ObjectId,
  type ProjectSessionResult,
  type ReplaySessionResult,
  type RestoreSessionResult,
  type RoomId,
  type SelectRoomFailure,
  type SelectRoomInput,
  type SelectRoomResult,
  type SelectRoomSuccess,
  type SerializeSessionResult,
  type SerializedDecisionSession,
  type SessionExperience,
  type SessionRuntimeState,
  type Timestamp,
} from "./session";
