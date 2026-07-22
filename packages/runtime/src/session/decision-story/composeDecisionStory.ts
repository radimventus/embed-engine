import type { DecisionFocus } from "../decision-focus";
import type {
  InterpretedSemantics,
  RecommendedMediaRef,
} from "../interpretation";
import type { PrioritySignal } from "../priority-signals";
import {
  DECISION_STORY_SCHEMA_VERSION,
  type DecisionStory,
  type DecisionStoryChapter,
  type DecisionStoryProvenance,
} from "./DecisionStory";

export type ComposeDecisionStoryInput = {
  readonly objectId: string;
  readonly prioritySignals: readonly PrioritySignal[];
  readonly semantics: InterpretedSemantics;
  readonly decisionFocus: DecisionFocus;
  readonly highlights: readonly string[];
  readonly recommendedMedia: readonly RecommendedMediaRef[];
  readonly rulesetId: string;
  readonly rulesetVersion: number;
};

function freezeChapters(
  chapters: readonly DecisionStoryChapter[],
): readonly DecisionStoryChapter[] {
  return Object.freeze(chapters.map((chapter) => Object.freeze({ ...chapter })));
}

function buildStoryId(provenance: DecisionStoryProvenance, primary: string, next: string): string {
  return [
    "story",
    provenance.objectId,
    provenance.focusRoomId ?? "none",
    provenance.focusPriorityId ?? "none",
    provenance.signalKinds.join("+") || "none",
    primary,
    next,
    `r${provenance.rulesetId}@${provenance.rulesetVersion}`,
  ].join(":");
}

function buildChapters(input: {
  readonly primaryExplanation: string;
  readonly supportingArguments: readonly string[];
  readonly recommendationSequence: readonly string[];
  readonly semanticTransitions: readonly string[];
  readonly nextDecisionStep: string;
}): readonly DecisionStoryChapter[] {
  const chapters: DecisionStoryChapter[] = [];
  let order = 1;

  chapters.push({
    id: `chapter-primary-${order}`,
    kind: "primary-explanation",
    key: input.primaryExplanation,
    order: order++,
  });

  for (const argument of input.supportingArguments) {
    chapters.push({
      id: `chapter-argument-${order}`,
      kind: "supporting-argument",
      key: argument,
      order: order++,
    });
  }

  for (const recommendation of input.recommendationSequence) {
    chapters.push({
      id: `chapter-recommendation-${order}`,
      kind: "recommendation",
      key: recommendation,
      order: order++,
    });
  }

  for (const transition of input.semanticTransitions) {
    chapters.push({
      id: `chapter-transition-${order}`,
      kind: "semantic-transition",
      key: transition,
      order: order++,
    });
  }

  chapters.push({
    id: `chapter-next-${order}`,
    kind: "next-decision-step",
    key: input.nextDecisionStep,
    order,
  });

  return freezeChapters(chapters);
}

/**
 * Decision Story Composer (CAP-DST-001).
 * Object + Signals + Interpretation + Focus → deterministic DecisionStory.
 * Pure function — no side effects, no presentation knowledge.
 */
export function composeDecisionStory(
  input: ComposeDecisionStoryInput,
): DecisionStory {
  const { decisionFocus, semantics, prioritySignals } = input;

  const primaryExplanation = semantics.primaryReason;
  const supportingArguments = Object.freeze([...input.highlights]);
  const recommendationSequence = Object.freeze([
    decisionFocus.recommendedAction,
    ...input.recommendedMedia.map((item) => `media:${item.role}`),
  ]);

  const semanticTransitions: string[] = [];
  if (decisionFocus.focusRoomId !== null) {
    semanticTransitions.push(`focus-room:${decisionFocus.focusRoomId}`);
  }
  if (decisionFocus.focusSignalKind !== null) {
    semanticTransitions.push(`focus-signal:${decisionFocus.focusSignalKind}`);
  }
  if (
    semantics.focusRoom !== null &&
    decisionFocus.focusRoomId !== null &&
    semantics.focusRoom.id !== decisionFocus.focusRoomId
  ) {
    semanticTransitions.push(
      `transition:${semantics.focusRoom.id}->${decisionFocus.focusRoomId}`,
    );
  }

  const nextDecisionStep = decisionFocus.recommendedAction;

  const provenance: DecisionStoryProvenance = Object.freeze({
    objectId: input.objectId,
    rulesetId: input.rulesetId,
    rulesetVersion: input.rulesetVersion,
    appliedRuleIds: Object.freeze([...semantics.appliedRuleIds]),
    signalKinds: Object.freeze(prioritySignals.map((signal) => signal.kind)),
    focusRoomId: decisionFocus.focusRoomId,
    focusPriorityId: decisionFocus.focusPriorityId,
    focusAction: decisionFocus.recommendedAction,
  });

  const chapters = buildChapters({
    primaryExplanation,
    supportingArguments,
    recommendationSequence,
    semanticTransitions: Object.freeze(semanticTransitions),
    nextDecisionStep,
  });

  return Object.freeze({
    id: buildStoryId(provenance, primaryExplanation, nextDecisionStep),
    schemaVersion: DECISION_STORY_SCHEMA_VERSION,
    primaryExplanation,
    supportingArguments,
    recommendationSequence,
    semanticTransitions: Object.freeze(semanticTransitions),
    nextDecisionStep,
    chapters,
    confidence: decisionFocus.confidence,
    provenance,
  });
}
