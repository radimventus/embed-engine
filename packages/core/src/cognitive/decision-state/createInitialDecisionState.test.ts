import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createInitialDecisionState,
} from "./createInitialDecisionState";
import * as decisionStateApi from "./index";

describe("createInitialDecisionState", () => {
  it("creates a default empty decision state for an object", () => {
    const state = createInitialDecisionState("house-modern-01");

    assert.deepEqual(state, {
      objectId: "house-modern-01",
      environment: {},
      signals: [],
      priorities: [],
      facts: [],
      conflicts: [],
      interpretationVersion: 0,
      metadata: {},
    });
  });

  it("returns an immutable root object", () => {
    const state = createInitialDecisionState("object-1");

    assert.ok(Object.isFrozen(state));
    assert.ok(Object.isFrozen(state.environment));
    assert.ok(Object.isFrozen(state.signals));
    assert.ok(Object.isFrozen(state.priorities));
    assert.ok(Object.isFrozen(state.facts));
    assert.ok(Object.isFrozen(state.conflicts));
    assert.ok(Object.isFrozen(state.metadata));

    assert.throws(() => {
      (state as { objectId: string }).objectId = "mutated";
    }, TypeError);
  });

  it("does not share mutable collections across factory calls", () => {
    const first = createInitialDecisionState("a");
    const second = createInitialDecisionState("b");

    assert.notEqual(first.signals, second.signals);
    assert.notEqual(first.priorities, second.priorities);
    assert.notEqual(first.facts, second.facts);
    assert.notEqual(first.conflicts, second.conflicts);
    assert.notEqual(first.environment, second.environment);
    assert.notEqual(first.metadata, second.metadata);
  });
  it("keeps a stable public decision-state API", () => {
    assert.equal(typeof decisionStateApi.createInitialDecisionState, "function");
    assert.equal(
      decisionStateApi.createInitialDecisionState,
      createInitialDecisionState,
    );
  });
});
