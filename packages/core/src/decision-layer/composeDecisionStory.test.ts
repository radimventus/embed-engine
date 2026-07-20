import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { composeDecisionStory } from "./composeDecisionStory";
import type { DecisionStoryPack } from "./DecisionStoryPack";

const pack: DecisionStoryPack = {
  id: "test-pack",
  storyId: "story.test",
  startQuestionIds: ["layout"],
  spine: ["m1", "m2", "m3"],
  moves: [
    {
      id: "m1",
      intent: "confirm",
      purpose: "p1",
      advisorPrompt: "a1",
    },
    {
      id: "m2",
      intent: "discover",
      purpose: "p2",
      advisorPrompt: "a2",
    },
    {
      id: "m3",
      intent: "recommend",
      purpose: "p3",
      advisorPrompt: "a3",
    },
  ],
  isMoveComplete(moveId, input) {
    if (moveId === "m1") {
      return (
        input.signalType === "QUESTION_OPENED" &&
        input.signalPayload.questionId === "layout"
      );
    }
    if (moveId === "m2") {
      return (
        input.signalType === "ROOM_VIEWED" &&
        input.signalPayload.roomId === "room-living"
      );
    }
    return (
      input.signalType === "QUESTION_OPENED" &&
      input.signalPayload.questionId === "m3"
    );
  },
  resolveOutcome() {
    return { status: "conditional-fit", summary: "done" };
  },
};

describe("composeDecisionStory", () => {
  it("returns null until layout priority starts the story", () => {
    const story = composeDecisionStory(pack, {
      interpretationActiveTopic: "Layout",
      signalType: "ROOM_VIEWED",
      signalPayload: { roomId: "room-living" },
      previous: null,
    });
    assert.equal(story, null);
  });

  it("starts story and completes confirm on layout click", () => {
    const story = composeDecisionStory(pack, {
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: { questionId: "layout" },
      previous: null,
    });
    assert.ok(story);
    assert.equal(story.slots[0]?.status, "completed");
    assert.equal(story.activeMoveId, "m2");
  });

  it("advances on room evidence then reaches outcome", () => {
    const afterStart = composeDecisionStory(pack, {
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: { questionId: "layout" },
      previous: null,
    });
    assert.ok(afterStart);

    const afterRoom = composeDecisionStory(pack, {
      interpretationActiveTopic: "Layout",
      signalType: "ROOM_VIEWED",
      signalPayload: { roomId: "room-living" },
      previous: afterStart,
    });
    assert.ok(afterRoom);
    assert.equal(afterRoom.activeMoveId, "m3");

    const done = composeDecisionStory(pack, {
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: { questionId: "m3" },
      previous: afterRoom,
    });
    assert.ok(done);
    assert.equal(done.outcome?.status, "conditional-fit");
    assert.equal(done.activeMoveId, null);
  });
});
