/**
 * Decision Session testing / advanced pipeline surface (ED-DA-03).
 *
 * For Runtime package tests and intentional pipeline integrations only.
 * Experience modules MUST NOT import this entry — use the public façade
 * (`createDecisionSessionRuntime` + `experience.context`) instead.
 *
 * @see OWNERSHIP.md
 * @see public-api.ts
 */

export {
  freezeDecisionSession,
} from "./DecisionSession";
export { createInitialSessionRuntimeState } from "./SessionRuntimeState";
export {
  createDecisionSession,
  type CreateDecisionSessionInput,
} from "./createDecisionSession";
export {
  selectRoom,
  type SelectRoomFailure,
  type SelectRoomInput,
  type SelectRoomResult,
  type SelectRoomSuccess,
} from "./selectRoom";
export {
  projectDecisionSession,
  projectFromInterpretation,
  type ProjectSessionResult,
} from "./projectDecisionSession";
export {
  createInterpretationContext,
  createInterpretationRuleset,
  DEFAULT_HOUSE_INTERPRETATION_RULES,
  evaluateInterpretationRules,
  type ContextualMessagingConfig,
  type HeroEmphasisConfig,
  type InterpretationContext,
  type InterpretationRule,
  type InterpretationRuleConfig,
  type InterpretationRuleId,
  type InterpretationRuleKind,
  type InterpretationRuleset,
  type InterpretedSemantics,
  type MediaPrioritizationConfig,
  type RecommendationOrderingConfig,
  type RoomImportanceConfig,
} from "./interpretation";
export {
  createPriorityProfile,
  evaluatePrioritySignals,
  evaluatePrioritySignalsFromIds,
  PRIORITY_SIGNAL_KIND_BY_ID,
  resolvePrioritySignalKind,
  type PriorityProfileEntry,
} from "./priority-signals";
export {
  evaluateDecisionFocus,
  orderHighlightsByDecisionFocus,
  orderMediaByDecisionFocus,
  type EvaluateDecisionFocusInput,
} from "./decision-focus";
export {
  composeDecisionStory,
  type ComposeDecisionStoryInput,
} from "./decision-story";
export { composeDecisionMoves } from "./decision-moves";
export { composeDecisionOutcome } from "./decision-outcome";
export { composeDecisionTerminal } from "./decision-terminal";
export { composeAIContext } from "./ai-context";
export {
  applyDecisionEvent,
  commandToEvent,
  dispatchCommand,
  interpretDecisionSession,
  validateCommand,
  type CommandContext,
  type DispatchCommandInput,
  type RuntimeCommandType,
} from "./pipeline";

/** Re-export public surface so tests can import one entry when needed. */
export * from "./public-api";
