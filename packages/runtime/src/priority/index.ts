/**
 * Priority Experience Runtime state engine.
 *
 * State, events, guards, transitions, Journey completion.
 * No Renderer / React / Content Composer / AI / House Mapping logic / Analytics.
 */

export type { PriorityRuntimeState } from "./PriorityRuntimeState";
export type {
  PriorityEngineEvent,
  PriorityEngineEventType,
} from "./PriorityEngineEvent";
export type {
  PriorityTransitionError,
  PriorityTransitionErrorCode,
} from "./PriorityTransitionError";
export {
  createInitialPriorityRuntimeState,
  isPriorityJourneyComplete,
  resetPriorityRuntimeState,
} from "./createInitialPriorityRuntimeState";
export {
  hasConfirmedSelection,
  hasExperience,
  hasHouseMapping,
  isSelectionNonEmpty,
} from "./guards";
export {
  applyPriorityEvent,
  createPriorityRuntimeEngine,
  type ApplyPriorityEventFailure,
  type ApplyPriorityEventResult,
  type ApplyPriorityEventSuccess,
  type PriorityRuntimeEngine,
} from "./applyPriorityEvent";

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
} from "./mock";
