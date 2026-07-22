import type { DecisionStory } from "../decision-story";
import {
  DECISION_MOVE_SCHEMA_VERSION,
  type DecisionMove,
  type DecisionMoveSequence,
} from "./DecisionMove";

function buildMoveId(storyId: string, order: number, chapterKey: string): string {
  return `move:${storyId}:${order}:${chapterKey}`;
}

function objectiveForChapter(kind: string, key: string): string {
  switch (kind) {
    case "primary-explanation":
      return `explain:${key}`;
    case "supporting-argument":
      return `support:${key}`;
    case "recommendation":
      return `recommend:${key}`;
    case "semantic-transition":
      return `transition:${key}`;
    case "next-decision-step":
      return `advance:${key}`;
    default:
      return `progress:${key}`;
  }
}

function recommendedActionForChapter(
  kind: string,
  key: string,
  story: DecisionStory,
): string {
  if (kind === "next-decision-step") {
    return story.nextDecisionStep;
  }
  if (kind === "recommendation" && !key.startsWith("media:")) {
    return key;
  }
  if (kind === "primary-explanation") {
    return `acknowledge:${key}`;
  }
  if (kind === "supporting-argument") {
    return `consider:${key}`;
  }
  if (kind === "semantic-transition") {
    return `follow:${key}`;
  }
  return `inspect:${key}`;
}

function completionCriteriaForChapter(kind: string, key: string): string {
  return `completed:${kind}:${key}`;
}

function requiredContextForChapter(
  kind: string,
  key: string,
  story: DecisionStory,
): readonly string[] {
  const context: string[] = [`story:${story.id}`, `chapter:${kind}:${key}`];
  if (story.provenance.focusRoomId !== null) {
    context.push(`focus-room:${story.provenance.focusRoomId}`);
  }
  if (story.provenance.focusPriorityId !== null) {
    context.push(`focus-priority:${story.provenance.focusPriorityId}`);
  }
  return Object.freeze(context);
}

/**
 * Decision Move Composer (CAP-DST-002).
 *
 * Sole input: DecisionStory.
 * Forbidden: Interpretation, Priority Signals, Decision Focus as direct inputs.
 *
 * Story → Moves. Never Interpretation → Moves.
 */
export function composeDecisionMoves(story: DecisionStory): DecisionMoveSequence {
  const drafts: Array<Omit<DecisionMove, "successorMoveId" | "status">> = [];

  for (const chapter of story.chapters) {
    drafts.push({
      id: buildMoveId(story.id, chapter.order, chapter.key),
      storyId: story.id,
      order: chapter.order,
      objective: objectiveForChapter(chapter.kind, chapter.key),
      requiredContext: requiredContextForChapter(chapter.kind, chapter.key, story),
      recommendedAction: recommendedActionForChapter(
        chapter.kind,
        chapter.key,
        story,
      ),
      completionCriteria: completionCriteriaForChapter(chapter.kind, chapter.key),
      chapterKind: chapter.kind,
      chapterKey: chapter.key,
    });
  }

  const moves: DecisionMove[] = drafts.map((draft, index) => {
    const successor = drafts[index + 1];
    const status = index === 0 ? "active" : "pending";
    return Object.freeze({
      ...draft,
      successorMoveId: successor?.id ?? null,
      status,
    });
  });

  return Object.freeze({
    schemaVersion: DECISION_MOVE_SCHEMA_VERSION,
    storyId: story.id,
    moves: Object.freeze(moves),
    activeMoveId: moves[0]?.id ?? null,
  });
}
