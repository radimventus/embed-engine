import type { DecisionMoveSequence } from "../decision-moves";
import {
  DECISION_OUTCOME_SCHEMA_VERSION,
  type DecisionOutcome,
  type DecisionOutcomeStatus,
} from "./DecisionOutcome";

function roundConfidence(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100) / 100;
}

function resolveStatus(
  moveCount: number,
  completedCount: number,
  unresolvedCount: number,
): DecisionOutcomeStatus {
  if (moveCount === 0) {
    return "weak-fit";
  }
  if (completedCount === moveCount) {
    return "strong-fit";
  }
  if (completedCount === 0) {
    return "in-progress";
  }
  if (unresolvedCount > 0) {
    return "conditional-fit";
  }
  return "in-progress";
}

function buildOutcomeId(moves: DecisionMoveSequence, recommendation: string): string {
  return [
    "outcome",
    moves.storyId,
    moves.activeMoveId ?? "none",
    String(moves.moves.length),
    moves.moves.map((move) => `${move.order}:${move.status}`).join("+") || "empty",
    recommendation,
  ].join(":");
}

/**
 * Decision Outcome Composer (CAP-OUT-001).
 *
 * Sole input: DecisionMoveSequence.
 * Forbidden: Interpretation, Decision Story, Presentation as direct inputs.
 *
 * Moves → Outcome. Never Story → Outcome. Never Interpretation → Outcome.
 */
export function composeDecisionOutcome(
  moves: DecisionMoveSequence,
): DecisionOutcome {
  const completed = moves.moves.filter((move) => move.status === "completed");
  const unresolved = moves.moves.filter(
    (move) =>
      move.status === "pending" ||
      move.status === "active" ||
      move.status === "deferred",
  );

  const nextStepMove =
    moves.moves.find((move) => move.chapterKind === "next-decision-step") ??
    null;
  const activeMove =
    moves.moves.find((move) => move.id === moves.activeMoveId) ??
    moves.moves[0] ??
    null;
  const lastMove = moves.moves[moves.moves.length - 1] ?? null;

  const recommendation =
    nextStepMove?.recommendedAction ??
    activeMove?.recommendedAction ??
    lastMove?.recommendedAction ??
    "continue-decision";

  const recommendedNextAction =
    activeMove?.recommendedAction ??
    nextStepMove?.recommendedAction ??
    recommendation;

  const rationale = Object.freeze(
    moves.moves.map((move) => move.objective),
  );

  const unresolvedQuestions = Object.freeze(
    unresolved.map((move) => move.objective),
  );

  const completedMoveIds = Object.freeze(completed.map((move) => move.id));
  const unresolvedMoveIds = Object.freeze(unresolved.map((move) => move.id));

  const progressRatio =
    moves.moves.length === 0
      ? 0
      : completed.length / moves.moves.length +
        (activeMove !== null ? 0.15 / moves.moves.length : 0);

  const confidence = roundConfidence(
    moves.moves.length === 0 ? 0 : Math.min(1, 0.35 + progressRatio * 0.65),
  );

  const status = resolveStatus(
    moves.moves.length,
    completed.length,
    unresolved.length,
  );

  const moveIds = Object.freeze(moves.moves.map((move) => move.id));

  return Object.freeze({
    id: buildOutcomeId(moves, recommendation),
    schemaVersion: DECISION_OUTCOME_SCHEMA_VERSION,
    storyId: moves.storyId,
    moveRef: Object.freeze({
      storyId: moves.storyId,
      activeMoveId: moves.activeMoveId,
      moveIds,
      moveCount: moves.moves.length,
    }),
    status,
    recommendation,
    confidence,
    rationale,
    completedMoveIds,
    unresolvedMoveIds,
    unresolvedQuestions,
    recommendedNextAction,
  });
}
