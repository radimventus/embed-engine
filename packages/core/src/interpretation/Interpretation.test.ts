import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  INTERPRETATION_FORBIDDEN_PRESENTATION_KEYS,
  createInterpretation,
  type Interpretation,
} from "./Interpretation";

function sampleInterpretation(): Interpretation {
  return createInterpretation({
    id: "interpretation.house-modern-01.layout",
    objectId: "house-modern-01",
    priorityIds: ["layout"],
    strengths: [
      Object.freeze({ id: "s1", code: "layout.day-night-zones", weight: 0.9 }),
    ],
    frictions: [
      Object.freeze({ id: "f1", code: "layout.upper-floor-stairs", weight: 0.4 }),
    ],
    opportunities: [
      Object.freeze({ id: "o1", code: "layout.household-fit", weight: 0.7 }),
    ],
    tradeOffs: [
      Object.freeze({
        id: "t1",
        code: "layout.privacy-vs-openness",
        favors: "privacy",
        against: "open-plan",
      }),
    ],
    confidenceInputs: [
      Object.freeze({
        id: "c1",
        code: "priority.coverage",
        contribution: 0.8,
      }),
    ],
    matchScore: 92,
    recommendedIntent: "explore-layout",
  });
}

describe("Interpretation domain (ADR-012)", () => {
  it("can be instantiated independently", () => {
    const interpretation = sampleInterpretation();

    assert.equal(interpretation.id, "interpretation.house-modern-01.layout");
    assert.equal(interpretation.objectId, "house-modern-01");
    assert.deepEqual(interpretation.priorityIds, ["layout"]);
    assert.equal(interpretation.strengths.length, 1);
    assert.equal(interpretation.frictions.length, 1);
    assert.equal(interpretation.opportunities.length, 1);
    assert.equal(interpretation.tradeOffs.length, 1);
    assert.equal(interpretation.confidenceInputs.length, 1);
    assert.equal(interpretation.matchScore, 92);
    assert.equal(interpretation.recommendedIntent, "explore-layout");
  });

  it("has no presentation fields", () => {
    const interpretation = sampleInterpretation();
    const keys = Object.keys(interpretation);

    for (const forbidden of INTERPRETATION_FORBIDDEN_PRESENTATION_KEYS) {
      assert.equal(
        keys.includes(forbidden),
        false,
        `Interpretation must not expose presentation field "${forbidden}"`,
      );
    }

    assert.ok(keys.includes("strengths"));
    assert.ok(keys.includes("frictions"));
    assert.ok(keys.includes("opportunities"));
    assert.ok(keys.includes("tradeOffs"));
    assert.ok(keys.includes("confidenceInputs"));
    assert.ok(keys.includes("matchScore"));
    assert.ok(keys.includes("recommendedIntent"));
  });

  it("is frozen after createInterpretation", () => {
    const interpretation = sampleInterpretation();
    assert.ok(Object.isFrozen(interpretation));
    assert.ok(Object.isFrozen(interpretation.strengths));
    assert.ok(Object.isFrozen(interpretation.strengths[0]));
  });
});
