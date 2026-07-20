import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { composeDecisionStory } from "@embed-engine/core/decision-layer";

import { DISPOSITION_LAYOUT_PACK } from "./disposition-layout-pack";

function startStory() {
  return composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
    interpretationActiveTopic: "Layout",
    signalType: "QUESTION_OPENED",
    signalPayload: { questionId: "layout" },
    previous: null,
  });
}

describe("disposition layout composer", () => {
  it("runs Priority layout click through to day-zone move", () => {
    const story = startStory();
    assert.ok(story);
    assert.equal(story!.packId, "disposition-layout-v1");
    assert.equal(story!.slots[0]?.status, "completed");
    assert.equal(story!.activeMoveId, "layout.discover-day-zone");
  });

  it("completes day discover with Client Studio living-room id", () => {
    const afterDay = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
      interpretationActiveTopic: "Layout",
      signalType: "ROOM_VIEWED",
      signalPayload: { roomId: "living-room" },
      previous: startStory(),
    });
    assert.equal(afterDay?.activeMoveId, "layout.discover-night-zone");
  });

  it("completes night discover with bedroom id and reaches outcome via CTAs", () => {
    let story = startStory();
    story = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
      interpretationActiveTopic: "Layout",
      signalType: "ROOM_VIEWED",
      signalPayload: { roomId: "living-room" },
      previous: story,
    });
    story = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
      interpretationActiveTopic: "Layout",
      signalType: "ROOM_VIEWED",
      signalPayload: { roomId: "bedroom" },
      previous: story,
    });
    assert.equal(story?.activeMoveId, "layout.interpret-day-night-split");

    const acknowledgeSpine = [
      "layout.interpret-day-night-split",
      "layout.compare-living-kitchen",
      "layout.compare-indoor-garden",
      "layout.warn-bath-contention",
      "layout.ask-household-shape",
      "layout.recommend-disposition-fit",
    ] as const;

    for (const moveId of acknowledgeSpine) {
      assert.equal(story?.activeMoveId, moveId);
      story = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
        interpretationActiveTopic: "Layout",
        signalType: "QUESTION_OPENED",
        signalPayload: { questionId: moveId },
        previous: story,
      });
    }

    assert.equal(story?.outcome?.status, "conditional-fit");
    assert.equal(story?.activeMoveId, null);
  });

  it("allows acknowledge escape on discover so Terminal never dead-ends", () => {
    const afterEscape = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: { questionId: "layout.discover-day-zone" },
      previous: startStory(),
    });
    assert.equal(afterEscape?.activeMoveId, "layout.discover-night-zone");
  });

  it("ignores unrelated signals without stalling the active move", () => {
    const afterMedia = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
      interpretationActiveTopic: "Layout",
      signalType: "MEDIA_OPENED",
      signalPayload: { mediaId: "mode-photo" },
      previous: startStory(),
    });
    assert.equal(afterMedia?.activeMoveId, "layout.discover-day-zone");
    assert.equal(afterMedia?.outcome, null);
  });
});
