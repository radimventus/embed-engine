import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  INTERPRETATION_FORBIDDEN_PRESENTATION_KEYS,
} from "./Interpretation";
import { createDecisionContext } from "./DecisionContext";
import {
  createInterpretationEngine,
  interpretationEngine,
  toInterpretInput,
} from "./InterpretationEngine";

describe("InterpretationEngine", () => {
  it("consumes Object + DecisionContext", () => {
    const interpretation = interpretationEngine.interpret({
      object: { id: "house-modern-01" },
      context: createDecisionContext({
        priorities: { selected: ["layout"] },
      }),
    });

    assert.equal(interpretation.objectId, "house-modern-01");
    assert.ok(interpretation.id.startsWith("interpretation."));
    assert.equal(interpretation.matchScore, 92);
    assert.ok(interpretation.strengths.length > 0);
    assert.equal(typeof interpretation.recommendedIntent, "string");
  });

  it("is the canonical producer — createInterpretationEngine yields equivalent results", () => {
    const engine = createInterpretationEngine();
    const input = {
      object: { id: "house-modern-01" },
      context: createDecisionContext({
        priorities: { selected: ["investment"] },
      }),
    };
    const a = engine.interpret(input);
    const b = interpretationEngine.interpret(input);
    assert.deepEqual(a, b);
    assert.equal(a.matchScore, 76);
  });

  it("preserves identical outputs via legacy InterpretObjectInput adapter", () => {
    const viaContext = interpretationEngine.interpret({
      object: { id: "house-modern-01" },
      context: createDecisionContext({
        priorities: { selected: ["design"] },
      }),
    });
    const viaLegacy = interpretationEngine.interpret(
      toInterpretInput({
        objectId: "house-modern-01",
        priorityIds: ["design"],
      }),
    );
    assert.deepEqual(viaContext, viaLegacy);
  });

  it("does not expose presentation fields", () => {
    const interpretation = interpretationEngine.interpret({
      object: { id: "house-modern-01" },
      context: createDecisionContext({
        priorities: { selected: ["design"] },
      }),
    });
    const keys = Object.keys(interpretation);
    for (const forbidden of INTERPRETATION_FORBIDDEN_PRESENTATION_KEYS) {
      assert.equal(keys.includes(forbidden), false);
    }
  });

  it("attaches InterpretationTrace without changing semantic conclusions", () => {
    const interpretation = interpretationEngine.interpret({
      object: { id: "house-modern-01" },
      context: createDecisionContext({
        priorities: { selected: ["layout"] },
      }),
    });

    assert.ok(interpretation.trace);
    assert.equal(interpretation.matchScore, 92);
    assert.equal(interpretation.recommendedIntent, "explore-layout");
    assert.equal(interpretation.strengths[0]?.code, "family.bedrooms");
    assert.equal(interpretation.trace?.contributions[0]?.kind, "lens");
  });
});
