import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDispositionLayoutComposer } from "./index";
import { STAIRS_WARN_MOVE_ID } from "./splice-stairs-warn";
import { HOUSEHOLD_PROFILE_FACT_KEY } from "./household-outcome";

const compose = createDispositionLayoutComposer();

function startStory() {
  return compose({
    interpretationActiveTopic: "Layout",
    signalType: "QUESTION_OPENED",
    signalPayload: { questionId: "layout" },
    previous: null,
  });
}

describe("reactive stairs splice (Slice C)", () => {
  it("inserts stairs warn once on FLOOR_CHANGED during active story", () => {
    const afterStart = startStory();
    assert.equal(afterStart?.activeMoveId, "layout.discover-day-zone");

    const spliced = compose({
      interpretationActiveTopic: "Layout",
      signalType: "FLOOR_CHANGED",
      signalPayload: { floorId: "upper-floor" },
      previous: afterStart,
    });

    assert.equal(spliced?.activeMoveId, STAIRS_WARN_MOVE_ID);
    assert.equal(
      spliced?.slots.filter((slot) => slot.moveId === STAIRS_WARN_MOVE_ID).length,
      1,
    );
    assert.equal(
      spliced?.slots.find((slot) => slot.moveId === "layout.discover-day-zone")
        ?.status,
      "pending",
    );
  });

  it("is idempotent — second FLOOR_CHANGED does not insert again", () => {
    const afterStart = startStory();
    const first = compose({
      interpretationActiveTopic: "Layout",
      signalType: "FLOOR_CHANGED",
      signalPayload: { floorId: "upper-floor" },
      previous: afterStart,
    });
    const second = compose({
      interpretationActiveTopic: "Layout",
      signalType: "FLOOR_CHANGED",
      signalPayload: { floorId: "ground-floor" },
      previous: first,
    });

    assert.equal(second?.activeMoveId, STAIRS_WARN_MOVE_ID);
    assert.equal(
      second?.slots.filter((slot) => slot.moveId === STAIRS_WARN_MOVE_ID).length,
      1,
    );
  });

  it("skips splice after household has started", () => {
    let story = startStory();
    story = compose({
      interpretationActiveTopic: "Layout",
      signalType: "ROOM_VIEWED",
      signalPayload: { roomId: "living-room" },
      previous: story,
    });
    story = compose({
      interpretationActiveTopic: "Layout",
      signalType: "ROOM_VIEWED",
      signalPayload: { roomId: "bedroom" },
      previous: story,
    });

    for (const moveId of [
      "layout.interpret-day-night-split",
      "layout.compare-living-kitchen",
      "layout.compare-indoor-garden",
      "layout.warn-bath-contention",
    ] as const) {
      story = compose({
        interpretationActiveTopic: "Layout",
        signalType: "QUESTION_OPENED",
        signalPayload: { questionId: moveId },
        previous: story,
      });
    }

    assert.equal(story?.activeMoveId, "layout.ask-household-shape");

    const afterFloor = compose({
      interpretationActiveTopic: "Layout",
      signalType: "FLOOR_CHANGED",
      signalPayload: { floorId: "upper-floor" },
      previous: story,
    });

    assert.equal(afterFloor?.activeMoveId, "layout.ask-household-shape");
    assert.equal(
      afterFloor?.slots.some((slot) => slot.moveId === STAIRS_WARN_MOVE_ID),
      false,
    );
  });

  it("resumes interrupted move after stairs acknowledge, then reaches household", () => {
    let story = startStory();
    story = compose({
      interpretationActiveTopic: "Layout",
      signalType: "FLOOR_CHANGED",
      signalPayload: { floorId: "upper-floor" },
      previous: story,
    });
    assert.equal(story?.activeMoveId, STAIRS_WARN_MOVE_ID);

    story = compose({
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: { questionId: STAIRS_WARN_MOVE_ID },
      previous: story,
    });
    assert.equal(story?.activeMoveId, "layout.discover-day-zone");

    story = compose({
      interpretationActiveTopic: "Layout",
      signalType: "ROOM_VIEWED",
      signalPayload: { roomId: "living-room" },
      previous: story,
    });
    story = compose({
      interpretationActiveTopic: "Layout",
      signalType: "ROOM_VIEWED",
      signalPayload: { roomId: "bedroom" },
      previous: story,
    });

    for (const moveId of [
      "layout.interpret-day-night-split",
      "layout.compare-living-kitchen",
      "layout.compare-indoor-garden",
      "layout.warn-bath-contention",
    ] as const) {
      story = compose({
        interpretationActiveTopic: "Layout",
        signalType: "QUESTION_OPENED",
        signalPayload: { questionId: moveId },
        previous: story,
      });
    }

    assert.equal(story?.activeMoveId, "layout.ask-household-shape");

    story = compose({
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: {
        questionId: "layout.ask-household-shape",
        householdProfile: "family",
      },
      facts: { [HOUSEHOLD_PROFILE_FACT_KEY]: "family" },
      previous: story,
    });
    story = compose({
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: { questionId: "layout.recommend-disposition-fit" },
      facts: { [HOUSEHOLD_PROFILE_FACT_KEY]: "family" },
      previous: story,
    });

    assert.equal(story?.outcome?.status, "conditional-fit");
  });

  it("without FLOOR_CHANGED keeps Slice B path unchanged", () => {
    let story = startStory();
    story = compose({
      interpretationActiveTopic: "Layout",
      signalType: "ROOM_VIEWED",
      signalPayload: { roomId: "living-room" },
      previous: story,
    });
    story = compose({
      interpretationActiveTopic: "Layout",
      signalType: "ROOM_VIEWED",
      signalPayload: { roomId: "bedroom" },
      previous: story,
    });
    assert.equal(story?.activeMoveId, "layout.interpret-day-night-split");
    assert.equal(
      story?.slots.some((slot) => slot.moveId === STAIRS_WARN_MOVE_ID),
      false,
    );
  });
});
