import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDecisionContext } from "../DecisionContext";
import { interpretationEngine } from "../InterpretationEngine";
import { resolveStrengths } from "../modules/strengths";
import { evaluateLayout001 } from "./evaluateLayout001";
import { getSemanticRuleById } from "./semanticRuleCatalog";

describe("evaluateLayout001 (LAYOUT_001)", () => {
  it("produces the identical strength factor for the layout lens", () => {
    const evaluation = evaluateLayout001({ lens: "layout" });
    assert.ok(evaluation);
    assert.equal(evaluation?.ruleId, "LAYOUT_001");
    assert.deepEqual(evaluation?.factor, {
      id: "s.bedrooms",
      code: "family.bedrooms",
      weight: 0.9,
    });
    assert.equal(
      evaluation?.factor.code,
      getSemanticRuleById("LAYOUT_001")?.meaning,
    );
  });

  it("does not fire outside the layout lens", () => {
    assert.equal(evaluateLayout001({ lens: "design" }), null);
    assert.equal(evaluateLayout001({ lens: "investment" }), null);
    assert.equal(evaluateLayout001({ lens: "energy" }), null);
    assert.equal(evaluateLayout001({ lens: null }), null);
  });

  it("is orchestrated by resolveStrengths without changing order or payload", () => {
    const strengths = resolveStrengths("layout");
    assert.deepEqual(strengths[0], {
      id: "s.bedrooms",
      code: "family.bedrooms",
      weight: 0.9,
    });
    assert.equal(strengths[1]?.code, "family.garden");
    assert.equal(strengths[2]?.code, "family.bathrooms");
  });

  it("keeps Interpretation + Trace ruleId identical for layout", () => {
    const interpretation = interpretationEngine.interpret({
      object: { id: "house-modern-01" },
      context: createDecisionContext({
        priorities: { selected: ["layout"] },
      }),
    });

    assert.equal(interpretation.strengths[0]?.code, "family.bedrooms");
    assert.equal(interpretation.strengths[0]?.weight, 0.9);
    const traced = interpretation.trace?.contributions.find(
      (item) => item.id === "s.bedrooms",
    );
    assert.equal(traced?.ruleId, "LAYOUT_001");
  });
});
