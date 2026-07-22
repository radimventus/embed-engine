import type { HousePackage } from "@embed-engine/object-house";

import type { DecisionSession } from "../DecisionSession";
import {
  createInterpretationContext,
  DEFAULT_HOUSE_INTERPRETATION_RULES,
  evaluateInterpretationRules,
  type FocusRoom,
  type InterpretationRuleset,
  type InterpretedSemantics,
  type RecommendedMediaRef,
} from "../interpretation";
import {
  evaluatePrioritySignalsFromIds,
  type PrioritySignal,
} from "../priority-signals";

/**
 * Session Interpretation — meaning derived from
 * Object Package + Runtime State + Priority Signals + Interpretation Rules.
 * Never validates commands. Never projects UI.
 */
export type SessionInterpretation = {
  readonly objectId: string;
  readonly activeRoomId: string | null;
  readonly activeRoomName: string | null;
  readonly priorityIds: readonly string[];
  /** Active Priority Signals feeding Interpretation Rules (CAP-PRI-001). */
  readonly prioritySignals: readonly PrioritySignal[];
  readonly variantId: string | null;
  readonly scenarioId: string | null;
  readonly runtimeVersion: number;
  /** Deterministic meaning summary for reproducibility checks. */
  readonly summary: string;
  /** Ruleset identity that produced this interpretation. */
  readonly rulesetId: string;
  readonly rulesetVersion: number;
  /** Semantic outputs from the Interpretation Rules Engine. */
  readonly focusRoom: FocusRoom | null;
  readonly primaryReason: string;
  readonly highlights: readonly string[];
  readonly recommendedMedia: readonly RecommendedMediaRef[];
  readonly roomImportanceRank: readonly string[];
  readonly appliedRuleIds: readonly string[];
};

export type InterpretDecisionSessionOptions = {
  readonly rules?: InterpretationRuleset;
};

function buildSummary(
  session: DecisionSession,
  semantics: InterpretedSemantics,
  rules: InterpretationRuleset,
  signals: readonly PrioritySignal[],
): string {
  return [
    `object:${session.objectId}`,
    `room:${session.runtimeState.activeRoomId ?? "none"}`,
    `focus:${semantics.focusRoom?.id ?? "none"}`,
    `reason:${semantics.primaryReason}`,
    `highlights:${semantics.highlights.join(",") || "none"}`,
    `media:${semantics.recommendedMedia.map((item) => item.role).join(",") || "none"}`,
    `priorities:${session.runtimeState.priorityIds.join(",") || "none"}`,
    `signals:${signals.map((signal) => `${signal.kind}:${signal.strength}`).join(",") || "none"}`,
    `variant:${session.runtimeState.variantId ?? "none"}`,
    `scenario:${session.runtimeState.scenarioId ?? "none"}`,
    `rules:${rules.id}@${rules.version}`,
    `applied:${semantics.appliedRuleIds.join(",") || "none"}`,
    `v:${session.runtimeState.version}`,
  ].join("|");
}

export function interpretDecisionSession(
  session: DecisionSession,
  housePackage: HousePackage,
  options?: InterpretDecisionSessionOptions,
): SessionInterpretation {
  const rules = options?.rules ?? DEFAULT_HOUSE_INTERPRETATION_RULES;
  const prioritySignals = evaluatePrioritySignalsFromIds(
    session.runtimeState.priorityIds,
  );
  const context = createInterpretationContext({
    housePackage,
    runtimeState: session.runtimeState,
    rules,
    prioritySignals,
  });
  const semantics = evaluateInterpretationRules(context);

  const activeRoomId = session.runtimeState.activeRoomId;
  const activeRoomName =
    activeRoomId === null
      ? null
      : (housePackage.rooms.find((room) => room.id === activeRoomId)?.name ??
        null);

  return Object.freeze({
    objectId: session.objectId,
    activeRoomId,
    activeRoomName,
    priorityIds: Object.freeze([...session.runtimeState.priorityIds]),
    prioritySignals,
    variantId: session.runtimeState.variantId,
    scenarioId: session.runtimeState.scenarioId,
    runtimeVersion: session.runtimeState.version,
    summary: buildSummary(session, semantics, rules, prioritySignals),
    rulesetId: rules.id,
    rulesetVersion: rules.version,
    focusRoom: semantics.focusRoom,
    primaryReason: semantics.primaryReason,
    highlights: semantics.highlights,
    recommendedMedia: semantics.recommendedMedia,
    roomImportanceRank: semantics.roomImportanceRank,
    appliedRuleIds: semantics.appliedRuleIds,
  });
}
