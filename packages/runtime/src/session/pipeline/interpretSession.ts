import type { HousePackage } from "@embed-engine/object-house";

import type { DecisionFocus } from "../decision-focus";
import {
  evaluateDecisionFocus,
  orderHighlightsByDecisionFocus,
  orderMediaByDecisionFocus,
} from "../decision-focus";
import type { DecisionStory } from "../decision-story";
import { composeDecisionStory } from "../decision-story";
import type { DecisionMoveSequence } from "../decision-moves";
import { composeDecisionMoves } from "../decision-moves";
import type { DecisionOutcome } from "../decision-outcome";
import { composeDecisionOutcome } from "../decision-outcome";
import type { DecisionTerminal } from "../decision-terminal";
import { composeDecisionTerminal } from "../decision-terminal";
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
 * Object Package + Runtime State + Priority Signals + Interpretation Rules
 * + Decision Focus (CAP-PRI-002) + Decision Story (CAP-DST-001)
 * + Decision Moves (CAP-DST-002) + Decision Outcome (CAP-OUT-001)
 * + Decision Terminal (CAP-DTR-001).
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
  /** Canonical decision attention entry point (CAP-PRI-002). */
  readonly decisionFocus: DecisionFocus;
  /** Canonical semantic narrative (CAP-DST-001 / PT-004). */
  readonly decisionStory: DecisionStory;
  /** Ordered Moves derived solely from Decision Story (CAP-DST-002 / PT-005). */
  readonly decisionMoves: DecisionMoveSequence;
  /** Canonical Outcome derived solely from Decision Moves (CAP-OUT-001 / PT-008). */
  readonly decisionOutcome: DecisionOutcome;
  /** Completion surface wrapping Outcome (CAP-DTR-001 / PT-007). */
  readonly decisionTerminal: DecisionTerminal;
};

export type InterpretDecisionSessionOptions = {
  readonly rules?: InterpretationRuleset;
};

function buildSummary(
  session: DecisionSession,
  semantics: InterpretedSemantics,
  rules: InterpretationRuleset,
  signals: readonly PrioritySignal[],
  decisionFocus: DecisionFocus,
  decisionStory: DecisionStory,
  decisionMoves: DecisionMoveSequence,
  decisionOutcome: DecisionOutcome,
  decisionTerminal: DecisionTerminal,
): string {
  return [
    `object:${session.objectId}`,
    `room:${session.runtimeState.activeRoomId ?? "none"}`,
    `focus:${semantics.focusRoom?.id ?? "none"}`,
    `decisionFocus:${decisionFocus.focusRoomId ?? "none"}:${decisionFocus.focusReason}:${decisionFocus.confidence}`,
    `action:${decisionFocus.recommendedAction}`,
    `story:${decisionStory.id}`,
    `moves:${decisionMoves.activeMoveId ?? "none"}:${decisionMoves.moves.length}`,
    `outcome:${decisionOutcome.id}`,
    `terminal:${decisionTerminal.id}`,
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
  const decisionFocus = evaluateDecisionFocus({
    housePackage,
    activeRoomId: session.runtimeState.activeRoomId,
    prioritySignals,
    semantics,
  });

  const highlights = orderHighlightsByDecisionFocus(
    semantics.highlights,
    decisionFocus,
  );
  const recommendedMedia = orderMediaByDecisionFocus(
    semantics.recommendedMedia,
    decisionFocus,
  );

  const decisionStory = composeDecisionStory({
    objectId: session.objectId,
    prioritySignals,
    semantics: { ...semantics, highlights, recommendedMedia },
    decisionFocus,
    highlights,
    recommendedMedia,
    rulesetId: rules.id,
    rulesetVersion: rules.version,
  });

  // CAP-DST-002: Moves derive only from Story — never from Interpretation directly.
  const decisionMoves = composeDecisionMoves(decisionStory);

  // CAP-OUT-001: Outcome derives only from Moves — never from Story or Interpretation.
  const decisionOutcome = composeDecisionOutcome(decisionMoves);

  // CAP-DTR-001: Terminal wraps Outcome only — no semantic enrichment.
  const decisionTerminal = composeDecisionTerminal(decisionOutcome);

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
    summary: buildSummary(
      session,
      { ...semantics, highlights, recommendedMedia },
      rules,
      prioritySignals,
      decisionFocus,
      decisionStory,
      decisionMoves,
      decisionOutcome,
      decisionTerminal,
    ),
    rulesetId: rules.id,
    rulesetVersion: rules.version,
    focusRoom: semantics.focusRoom,
    primaryReason: semantics.primaryReason,
    highlights,
    recommendedMedia,
    roomImportanceRank: semantics.roomImportanceRank,
    appliedRuleIds: semantics.appliedRuleIds,
    decisionFocus,
    decisionStory,
    decisionMoves,
    decisionOutcome,
    decisionTerminal,
  });
}
