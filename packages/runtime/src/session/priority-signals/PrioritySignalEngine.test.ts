import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import {
  createFixedClock,
  createDecisionSessionRuntime,
  createPriorityProfile,
  evaluatePrioritySignals,
  evaluatePrioritySignalsFromIds,
} from "../testing";

describe("Priority Signal Engine (CAP-PRI-001)", () => {
  it("identical Priority Profile produces identical signals", () => {
    const profile = createPriorityProfile(["garden", "price", "space"]);
    const a = evaluatePrioritySignals(profile);
    const b = evaluatePrioritySignals(profile);

    assert.deepEqual(a, b);
    assert.equal(a.length, 3);
    assert.equal(a[0]?.kind, "emphasize-outdoor");
    assert.equal(a[0]?.strength, 1);
    assert.equal(a[1]?.kind, "emphasize-value");
    assert.equal(a[1]?.strength, 2 / 3);
    assert.equal(a[2]?.kind, "emphasize-space");
    assert.equal(a[2]?.strength, 1 / 3);
  });

  it("evaluates signals from Runtime priority ids deterministically", () => {
    const first = evaluatePrioritySignalsFromIds(["price", "garden"]);
    const second = evaluatePrioritySignalsFromIds(["price", "garden"]);
    assert.deepEqual(first, second);
    assert.equal(first[0]?.priorityId, "price");
    assert.equal(first[0]?.kind, "emphasize-value");
  });

  it("ChangePriority → signals → Interpretation → Experience changes", () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);

    const before = runtime.getExperience()!.context.decision;
    assert.equal(before.prioritySignals.length, 0);
    assert.equal(before.primaryReason, "primary-living-volume");
    assert.ok(!before.highlights.includes("outdoor-connection"));

    const changed = runtime.dispatch(
      { type: "ChangePriority", priorityIds: ["garden", "space"] },
      3,
    );
    assert.ok(changed.ok);
    if (!changed.ok) {
      return;
    }

    const after = changed.experience.context.decision;
    assert.equal(after.prioritySignals.length, 2);
    assert.equal(after.prioritySignals[0]?.kind, "emphasize-outdoor");
    assert.deepEqual(
      after.prioritySignals,
      changed.interpretation.prioritySignals,
    );
    assert.equal(after.primaryReason, "outdoor-led-exploration");
    assert.ok(after.highlights.includes("outdoor-connection"));
    assert.ok(after.highlights.includes("spatial-generosity"));
    assert.equal(after.recommendedMedia[0]?.role, "gallery");
    assert.equal(
      after.prioritySignals[0]?.kind,
      "emphasize-outdoor",
    );
    assert.notEqual(before.primaryReason, after.primaryReason);
    assert.notDeepEqual(before.highlights, after.highlights);
  });

  it("different priority order yields different signal strengths and Experience", () => {
    const gardenFirst = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    gardenFirst.dispatch({ type: "SelectRoom", roomId: "room-kitchen" }, 2);
    gardenFirst.dispatch(
      { type: "ChangePriority", priorityIds: ["garden", "price"] },
      3,
    );

    const priceFirst = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    priceFirst.dispatch({ type: "SelectRoom", roomId: "room-kitchen" }, 2);
    priceFirst.dispatch(
      { type: "ChangePriority", priorityIds: ["price", "garden"] },
      3,
    );

    const a = gardenFirst.getExperience()!.context.decision;
    const b = priceFirst.getExperience()!.context.decision;

    assert.equal(a.prioritySignals[0]?.kind, "emphasize-outdoor");
    assert.equal(b.prioritySignals[0]?.kind, "emphasize-value");
    assert.equal(a.primaryReason, "outdoor-led-exploration");
    assert.equal(b.primaryReason, "value-led-exploration");
    assert.notEqual(a.interpretationSummary, b.interpretationSummary);
  });

  it("empty profile yields empty signals and baseline interpretation", () => {
    const signals = evaluatePrioritySignals(createPriorityProfile([]));
    assert.deepEqual(signals, []);

    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    const experience = runtime.getExperience()!;
    assert.deepEqual(experience.context.decision.prioritySignals, []);
    assert.equal(experience.context.decision.prioritySignals.length, 0);
  });

  it("ChangePriority → signals → Experience Context decision slice", () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    runtime.dispatch(
      { type: "ChangePriority", priorityIds: ["investment", "privacy"] },
      3,
    );
    const context = runtime.getExperience()!.context;

    assert.equal(context.decision.prioritySignals[0]?.kind, "emphasize-value");
    assert.equal(context.decision.primaryReason, "value-led-exploration");
    assert.ok(context.decision.highlights.includes("value-efficiency"));
    assert.ok(
      context.decision.prioritySignals.some(
        (signal) => signal.kind === "emphasize-privacy",
      ),
    );
  });
});
