import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createInitialDecisionState,
  createSignal,
  SignalType,
  type DecisionState,
  type Signal,
} from "@embed-engine/core/cognitive";

describe("cognitive public API", () => {
  it("exports DecisionState typing and createInitialDecisionState", () => {
    const state: DecisionState = createInitialDecisionState("public-api");

    assert.equal(typeof createInitialDecisionState, "function");
    assert.equal(state.objectId, "public-api");
  });

  it("exports Signal typing, SignalType, and createSignal", () => {
    const signal: Signal = createSignal({ type: SignalType.ROOM_VIEWED });

    assert.equal(typeof createSignal, "function");
    assert.equal(SignalType.ROOM_VIEWED, "ROOM_VIEWED");
    assert.equal(signal.type, SignalType.ROOM_VIEWED);
  });
});
