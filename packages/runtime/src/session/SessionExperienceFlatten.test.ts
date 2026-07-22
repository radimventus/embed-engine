import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import { createDecisionSessionRuntime } from "../testing";

/**
 * ED-DA-05 — SessionExperience is { house, context } only.
 */
describe("SessionExperience flatten (ED-DA-05)", () => {
  it("SessionExperience exposes only house + context keys", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["space"] }, 3);

    const experience = runtime.getExperience()!;
    assert.deepEqual(Object.keys(experience).sort(), ["context", "house"]);
    assert.equal(experience.house.id, REFERENCE_HOUSE_PACKAGE.identity.id);
    assert.ok(experience.context.decision.story);
    assert.ok(experience.context.decision.moves);
    assert.ok(experience.context.decision.outcome);
    assert.ok(experience.context.decision.terminal);
    assert.ok(experience.context.decision.ai);
  });

  it("does not retain flat decisionStory / priorityIds duplicates", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    const experience = runtime.getExperience()! as Record<string, unknown>;

    for (const forbidden of [
      "decisionStory",
      "decisionMoves",
      "decisionOutcome",
      "decisionTerminal",
      "aiContext",
      "decisionFocus",
      "priorityIds",
      "prioritySignals",
      "primaryReason",
      "highlights",
      "recommendedMedia",
      "activeRoomId",
      "activeRoom",
      "focusRoom",
      "interpretationSummary",
      "rulesetId",
      "appliedRuleIds",
    ]) {
      assert.equal(
        Object.prototype.hasOwnProperty.call(experience, forbidden),
        false,
        `must not expose flat field ${forbidden}`,
      );
    }
  });
});
