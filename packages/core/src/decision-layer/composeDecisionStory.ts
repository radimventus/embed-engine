import type {
  DecisionMoveSlot,
  DecisionStory,
  DecisionStoryComposeInput,
} from "./DecisionStory";
import type { DecisionStoryPack } from "./DecisionStoryPack";

function readString(
  payload: Readonly<Record<string, unknown>>,
  key: string,
): string | undefined {
  const value = payload[key];
  return typeof value === "string" ? value : undefined;
}

function createInitialStory(pack: DecisionStoryPack): DecisionStory {
  const slots: DecisionMoveSlot[] = pack.spine.map((moveId, index) =>
    Object.freeze({
      moveId,
      status: index === 0 ? ("active" as const) : ("pending" as const),
    }),
  );

  return Object.freeze({
    id: pack.storyId,
    packId: pack.id,
    slots: Object.freeze(slots),
    activeMoveId: pack.spine[0] ?? null,
    outcome: null,
  });
}

function shouldStartStory(
  pack: DecisionStoryPack,
  input: DecisionStoryComposeInput,
): boolean {
  if (input.signalType !== "QUESTION_OPENED") {
    return false;
  }

  const questionId = readString(input.signalPayload, "questionId");
  return (
    questionId !== undefined && pack.startQuestionIds.includes(questionId)
  );
}

/**
 * Pure Decision Strategy for one Behavior Pack spine.
 * Single responsibility: compose the active Decision Story.
 */
export function composeDecisionStory(
  pack: DecisionStoryPack,
  input: DecisionStoryComposeInput,
  depth = 0,
): DecisionStory | null {
  if (depth > pack.spine.length + 5) {
    return input.previous;
  }

  let story = input.previous;

  // Fresh start, or restart after outcome (demo re-runs / Priority layout again).
  if (story === null || story.outcome !== null) {
    if (!shouldStartStory(pack, input)) {
      return story;
    }
    story = createInitialStory(pack);
  }

  const slots = story.slots.map((slot) => ({ ...slot }));
  const activeIndex = slots.findIndex((slot) => slot.status === "active");

  if (activeIndex >= 0) {
    const active = slots[activeIndex];
    if (
      active !== undefined &&
      pack.isMoveComplete(active.moveId, input)
    ) {
      slots[activeIndex] = { moveId: active.moveId, status: "completed" };

      const nextIndex = activeIndex + 1;
      if (nextIndex >= slots.length) {
        const outcome = pack.resolveOutcome(input);
        return Object.freeze({
          ...story,
          slots: Object.freeze(slots),
          activeMoveId: null,
          outcome: Object.freeze(outcome),
        });
      }

      const next = slots[nextIndex];
      if (next !== undefined) {
        slots[nextIndex] = { moveId: next.moveId, status: "active" };
      }

      return composeDecisionStory(
        pack,
        {
          ...input,
          previous: Object.freeze({
            ...story,
            slots: Object.freeze(slots),
            activeMoveId: slots[nextIndex]?.moveId ?? null,
            outcome: null,
          }),
        },
        depth + 1,
      );
    }
  }

  const activeMoveId =
    slots.find((slot) => slot.status === "active")?.moveId ?? null;

  return Object.freeze({
    ...story,
    slots: Object.freeze(slots),
    activeMoveId,
    outcome: null,
  });
}

export type DecisionStoryComposer = (
  input: DecisionStoryComposeInput,
) => DecisionStory | null;

export function createPackStoryComposer(
  pack: DecisionStoryPack,
): DecisionStoryComposer {
  return (input) => composeDecisionStory(pack, input);
}
