import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSignal } from "../cognitive/signals/createSignal";
import { SignalType } from "../cognitive/signals/SignalType";
import { createRuntime } from "../runtime/createRuntime";
import { createExperienceBinding } from "./createExperienceBinding";

describe("createExperienceBinding", () => {
  it("projects Session snapshot without DecisionState", async () => {
    const runtime = createRuntime();
    await runtime.load({ objectId: "house-modern-01" });

    const binding = createExperienceBinding(runtime);
    const snapshot = binding.getSessionSnapshot();

    assert.equal(snapshot.status, "ready");
    assert.ok(snapshot.interpretation);
    assert.equal(snapshot.decisionStory, null);
    assert.deepEqual(snapshot.facts, {});
    assert.equal(
      Object.prototype.hasOwnProperty.call(snapshot, "decisionState"),
      false,
    );
  });

  it("forwards Signals through Runtime and notifies Session subscribers", async () => {
    const runtime = createRuntime();
    await runtime.load({ objectId: "house-1" });
    const binding = createExperienceBinding(runtime);

    const versions: number[] = [];
    binding.subscribeSession((snapshot) => {
      versions.push(snapshot.version);
    });

    binding.applySignal(
      createSignal({
        type: SignalType.QUESTION_OPENED,
        payload: { questionId: "energy", householdProfile: "couple" },
      }),
    );

    const next = binding.getSessionSnapshot();
    assert.ok(next.version > 0);
    assert.equal(next.facts["household.profile"], "couple");
    assert.equal(
      next.interpretation?.priorities.find((item) => item.id === "energy")
        ?.weight,
      1,
    );
    assert.ok(versions.length >= 1);
  });
});
