import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSignal } from "../cognitive/signals/createSignal";
import { SignalType } from "../cognitive/signals/SignalType";
import { createRuntime } from "./createRuntime";

describe("Runtime cognitive orchestration", () => {
  it("loads DecisionState and Interpretation", async () => {
    const runtime = createRuntime();
    await runtime.load({ objectId: "house-modern-01" });

    const state = runtime.getState();
    assert.equal(state.status, "ready");
    assert.equal(state.decisionState?.objectId, "house-modern-01");
    assert.ok(state.interpretation);
    assert.equal(state.interpretation?.priorities.length, 10);
  });

  it("applySignal runs reduce → project and notifies listeners", async () => {
    const runtime = createRuntime();
    await runtime.load({ objectId: "house-1" });

    let notified = 0;
    runtime.subscribe(() => {
      notified += 1;
    });

    runtime.applySignal(
      createSignal({
        type: SignalType.QUESTION_OPENED,
        payload: { questionId: "energy" },
      }),
    );

    const energy = runtime
      .getState()
      .interpretation?.priorities.find((item) => item.id === "energy");

    assert.equal(energy?.weight, 1);
    assert.equal(runtime.getState().decisionState?.focus.questionId, "energy");
    assert.ok(notified >= 1);
  });
});
