import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { composeDecisionStory } from "@embed-engine/core/decision-layer";

import { DISPOSITION_LAYOUT_PACK } from "./disposition-layout-pack";

describe("disposition layout composer", () => {
  it("runs Priority layout click through to day-zone move", () => {
    const story = composeDecisionStory(DISPOSITION_LAYOUT_PACK, {
      interpretationActiveTopic: "Layout",
      signalType: "QUESTION_OPENED",
      signalPayload: { questionId: "layout" },
      previous: null,
    });
    assert.ok(story);
    assert.equal(story!.packId, "disposition-layout-v1");
    assert.equal(story!.slots[0]?.status, "completed");
    assert.equal(story!.activeMoveId, "layout.discover-day-zone");
  });
});
