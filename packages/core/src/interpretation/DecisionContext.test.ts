import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createDecisionContext,
  type DecisionContext,
} from "./DecisionContext";

describe("DecisionContext", () => {
  it("can be constructed from PrioritySelection inputs", () => {
    const context = createDecisionContext({
      priorities: { selected: ["layout", "design"] },
    });

    assert.deepEqual(context.priorities.selected, ["layout", "design"]);
  });

  it("is frozen and does not share mutable arrays", () => {
    const selected = ["investment"];
    const context = createDecisionContext({
      priorities: { selected },
    });

    assert.ok(Object.isFrozen(context));
    assert.ok(Object.isFrozen(context.priorities));
    assert.ok(Object.isFrozen(context.priorities.selected));

    selected.push("layout");
    assert.deepEqual(context.priorities.selected, ["investment"]);
  });

  it("contains only MVP context fields", () => {
    const context: DecisionContext = createDecisionContext({
      priorities: { selected: [] },
    });
    assert.deepEqual(Object.keys(context), ["priorities"]);
    assert.deepEqual(Object.keys(context.priorities), ["selected"]);
  });
});
