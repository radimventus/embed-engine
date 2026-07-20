import type {
  DecisionStory,
  DecisionStoryComposeInput,
} from "@embed-engine/core/decision-layer";

export const STAIRS_WARN_MOVE_ID = "layout.warn-stairs-mobility";

const PAST_INSERTION_MOVE_IDS = new Set([
  "layout.ask-household-shape",
  "layout.recommend-disposition-fit",
]);

/**
 * FP-01 Slice C — one reactive splice only.
 * On FLOOR_CHANGED, insert stairs warn once before Household/Recommend.
 */
export function spliceStairsWarnIfNeeded(
  story: DecisionStory | null,
  input: DecisionStoryComposeInput,
): DecisionStory | null {
  if (story === null || story.outcome !== null) {
    return story;
  }

  if (input.signalType !== "FLOOR_CHANGED") {
    return story;
  }

  if (story.slots.some((slot) => slot.moveId === STAIRS_WARN_MOVE_ID)) {
    return story;
  }

  if (isPastInsertionPoint(story)) {
    return story;
  }

  const activeIndex = story.slots.findIndex((slot) => slot.status === "active");
  if (activeIndex < 0) {
    return story;
  }

  const active = story.slots[activeIndex];
  if (active === undefined) {
    return story;
  }

  const slots = story.slots.map((slot) => ({ ...slot }));
  slots[activeIndex] = { moveId: active.moveId, status: "pending" };
  slots.splice(activeIndex, 0, {
    moveId: STAIRS_WARN_MOVE_ID,
    status: "active",
  });

  return Object.freeze({
    ...story,
    slots: Object.freeze(
      slots.map((slot) =>
        Object.freeze({
          moveId: slot.moveId,
          status: slot.status,
        }),
      ),
    ),
    activeMoveId: STAIRS_WARN_MOVE_ID,
    outcome: null,
  });
}

function isPastInsertionPoint(story: DecisionStory): boolean {
  if (
    story.activeMoveId !== null &&
    PAST_INSERTION_MOVE_IDS.has(story.activeMoveId)
  ) {
    return true;
  }

  return story.slots.some(
    (slot) =>
      PAST_INSERTION_MOVE_IDS.has(slot.moveId) &&
      (slot.status === "completed" || slot.status === "active"),
  );
}
