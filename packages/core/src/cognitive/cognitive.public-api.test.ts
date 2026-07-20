import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createInitialDecisionState,
  createInitialFocus,
  createSignal,
  reduce,
  SignalType,
  type DecisionState,
  type Focus,
  type Signal,
} from "@embed-engine/core/cognitive";

describe("cognitive public API", () => {
  it("exports DecisionState typing and createInitialDecisionState", () => {
    const state: DecisionState = createInitialDecisionState("public-api");

    assert.equal(typeof createInitialDecisionState, "function");
    assert.equal(state.objectId, "public-api");
  });

  it("exports Focus typing and createInitialFocus", () => {
    const focus: Focus = createInitialFocus();
    const state = createInitialDecisionState("with-focus");

    assert.equal(typeof createInitialFocus, "function");
    assert.deepEqual(focus, {});
    assert.deepEqual(state.focus, {});
  });

  it("exports Signal typing, SignalType, and createSignal", () => {
    const signal: Signal = createSignal({ type: SignalType.ROOM_VIEWED });

    assert.equal(typeof createSignal, "function");
    assert.equal(SignalType.ROOM_VIEWED, "ROOM_VIEWED");
    assert.equal(signal.type, SignalType.ROOM_VIEWED);
  });

  it("exports reduce", () => {
    const state = createInitialDecisionState("reduce-api");
    const next = reduce(
      state,
      createSignal({
        type: SignalType.FLOOR_CHANGED,
        payload: { floorId: "floor-0" },
      }),
    );

    assert.equal(typeof reduce, "function");
    assert.equal(next.focus.floorId, "floor-0");
  });
});
