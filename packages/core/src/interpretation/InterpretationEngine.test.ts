import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  INTERPRETATION_FORBIDDEN_PRESENTATION_KEYS,
} from "./Interpretation";
import {
  createInterpretationEngine,
  interpretationEngine,
} from "./InterpretationEngine";

describe("InterpretationEngine", () => {
  it("produces a valid Interpretation", () => {
    const interpretation = interpretationEngine.interpret({
      objectId: "house-modern-01",
      priorityIds: ["layout"],
    });

    assert.equal(interpretation.objectId, "house-modern-01");
    assert.ok(interpretation.id.startsWith("interpretation."));
    assert.equal(interpretation.matchScore, 92);
    assert.ok(interpretation.strengths.length > 0);
    assert.equal(typeof interpretation.recommendedIntent, "string");
  });

  it("is the canonical producer — createInterpretationEngine yields equivalent results", () => {
    const engine = createInterpretationEngine();
    const a = engine.interpret({
      objectId: "house-modern-01",
      priorityIds: ["investment"],
    });
    const b = interpretationEngine.interpret({
      objectId: "house-modern-01",
      priorityIds: ["investment"],
    });
    assert.deepEqual(a, b);
    assert.equal(a.matchScore, 76);
  });

  it("does not expose presentation fields", () => {
    const interpretation = interpretationEngine.interpret({
      objectId: "house-modern-01",
      priorityIds: ["design"],
    });
    const keys = Object.keys(interpretation);
    for (const forbidden of INTERPRETATION_FORBIDDEN_PRESENTATION_KEYS) {
      assert.equal(keys.includes(forbidden), false);
    }
  });
});
