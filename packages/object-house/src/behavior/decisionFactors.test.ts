import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getDecisionFactors, storyConsideredStairs } from "./decision-factors";
import { STAIRS_WARN_MOVE_ID } from "./splice-stairs-warn";

describe("decision factors (Slice D)", () => {
  it("returns support and attention factors for a family profile", () => {
    const factors = getDecisionFactors("family", { stairsConsidered: false });
    assert.ok(factors.some((factor) => factor.tone === "support"));
    assert.ok(factors.some((factor) => factor.tone === "attention"));
    assert.ok(factors.some((factor) => /Dětský/.test(factor.label)));
  });

  it("marks stairs attention when stairs warn was considered", () => {
    const factors = getDecisionFactors("couple", { stairsConsidered: true });
    const stairs = factors.find((factor) => factor.id === "stairs");
    assert.equal(stairs?.tone, "attention");
    assert.match(stairs?.label ?? "", /dlouhodobý komfort/);
  });

  it("detects stairs consideration from story slots", () => {
    assert.equal(
      storyConsideredStairs([
        { moveId: STAIRS_WARN_MOVE_ID, status: "completed" },
      ]),
      true,
    );
    assert.equal(
      storyConsideredStairs([{ moveId: "layout.discover-day-zone", status: "active" }]),
      false,
    );
  });
});
