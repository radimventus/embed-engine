import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DecisionState } from "./DecisionState";
import { createInitialDecisionState } from "./createInitialDecisionState";

describe("DecisionState", () => {
  it("exposes a stable data-only shape", () => {
    const state: DecisionState = createInitialDecisionState("object-1");

    assert.equal(typeof state.objectId, "string");
    assert.equal(typeof state.environment, "object");
    assert.equal(typeof state.focus, "object");
    assert.ok(Array.isArray(state.signals));
    assert.ok(Array.isArray(state.priorities));
    assert.ok(Array.isArray(state.facts));
    assert.ok(Array.isArray(state.conflicts));
    assert.equal(typeof state.interpretationVersion, "number");
    assert.equal(typeof state.metadata, "object");
  });

  it("contains no methods on the state object", () => {
    const state = createInitialDecisionState("object-1");
    const values = Object.values(state);

    for (const value of values) {
      assert.notEqual(typeof value, "function");
    }
  });
});
