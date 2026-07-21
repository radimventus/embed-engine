import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { composeDecisionStory } from "@embed-engine/core/decision-layer";

import { DISPOSITION_LAYOUT_PACK } from "./disposition-layout-pack";
import { HOUSEHOLD_PROFILE_FACT_KEY } from "./household-outcome";

function startStory() {
  return composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
    interpretationActiveTopic: "Layout",
    signalType: "QUESTION_OPENED",
    signalPayload: { questionId: "layout" },
    previous: null,
  });
}

function advanceToHousehold() {
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

  for (const moveId of [
    "layout.interpret-day-night-split",
    "layout.compare-living-kitchen",
    "layout.compare-indoor-garden",
    "layout.warn-bath-contention",
  ] as const) {
    story = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: { questionId: moveId },
      previous: story,
    });
  }

  return story;
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

  it("personalizes outcome from household profile", () => {
    let story = advanceToHousehold();
    assert.equal(story?.activeMoveId, "layout.ask-household-shape");

    story = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: {
        questionId: "layout.ask-household-shape",
        householdProfile: "family-wfh",
      },
      facts: { [HOUSEHOLD_PROFILE_FACT_KEY]: "family-wfh" },
      previous: story,
    });
    assert.equal(story?.activeMoveId, "layout.recommend-disposition-fit");

    story = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: { questionId: "layout.recommend-disposition-fit" },
      facts: { [HOUSEHOLD_PROFILE_FACT_KEY]: "family-wfh" },
      previous: story,
    });

    assert.equal(story?.outcome?.status, "weak-fit");
    assert.match(story?.outcome?.summary ?? "", /Proč to sedí na vaši domácnost/);
  });

  it("returns strong-fit for couple household", () => {
    let story = advanceToHousehold();
    story = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: {
        questionId: "layout.ask-household-shape",
        householdProfile: "couple",
      },
      facts: { [HOUSEHOLD_PROFILE_FACT_KEY]: "couple" },
      previous: story,
    });
    story = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: { questionId: "layout.recommend-disposition-fit" },
      facts: { [HOUSEHOLD_PROFILE_FACT_KEY]: "couple" },
      previous: story,
    });
    assert.equal(story?.outcome?.status, "strong-fit");
    assert.match(story?.outcome?.summary ?? "", /Proč vám to sedí/);
  });

  it("does not complete household step without a profile", () => {
    const stuck = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: { questionId: "layout.ask-household-shape" },
      previous: advanceToHousehold(),
    });
    assert.equal(stuck?.activeMoveId, "layout.ask-household-shape");
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
