import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import { createFixedClock } from "../clock";
import {
  createDecisionSession,
  projectPriorityPipelineStory,
} from "./PriorityDecisionSession";

/**
 * PT-001 validation: Priority Selection → Signal → Decision Story → Experience.
 */
describe("PT-001 Priority Selection Pipeline (MVP)", () => {
  it("createDecisionSession + selectPriority records signals and builds Decision Story", () => {
    const session = createDecisionSession({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      clock: createFixedClock(1000),
      now: 1000,
    });

    const energy = session.selectPriority("energy");
    assert.equal(energy.ok, true);
    const layout = session.selectPriority("layout");
    assert.equal(layout.ok, true);
    const privacy = session.selectPriority("privacy");
    assert.equal(privacy.ok, true);

    const signals = session.getSignals();
    assert.equal(signals.length, 3);
    assert.equal(signals[0]?.type, "PrioritySelected");
    assert.equal(signals[0]?.priorityId, "energy");
    assert.equal(signals[1]?.priorityId, "layout");
    assert.equal(signals[2]?.priorityId, "privacy");

    const story = session.getDecisionStory();
    assert.equal(story.primaryPriority, "energy");
    assert.equal(story.secondaryPriority, "layout");
    assert.deepEqual(story.selectedPriorities, [
      "energy",
      "layout",
      "privacy",
    ]);
    assert.equal(story.updatedAt, 1000);

    const rebuilt = session.buildDecisionStory();
    assert.deepEqual(rebuilt, story);
  });

  it("removePriority records a signal and rebuilds Decision Story", () => {
    const session = createDecisionSession({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      clock: createFixedClock(1),
    });
    session.selectPriority("energy");
    session.selectPriority("layout");
    session.selectPriority("privacy");

    const removed = session.removePriority("layout");
    assert.equal(removed.ok, true);
    assert.equal(removed.ok && removed.signal?.type, "PriorityRemoved");

    const story = session.getDecisionStory();
    assert.equal(story.primaryPriority, "energy");
    assert.equal(story.secondaryPriority, "privacy");
    assert.deepEqual(story.selectedPriorities, ["energy", "privacy"]);
  });

  it("selectPriority updates certified Runtime Experience (Decision Story / signals)", () => {
    const session = createDecisionSession({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      clock: createFixedClock(1),
    });

    const before =
      session.getRuntime().getExperience()!.context.decision.priorityIds;
    assert.equal(before.length, 0);

    session.selectPriority("energy");
    session.selectPriority("layout");
    session.selectPriority("privacy");

    const decision = session.getRuntime().getExperience()!.context.decision;
    assert.deepEqual(decision.priorityIds, ["energy", "layout", "privacy"]);
    assert.ok(decision.prioritySignals.length >= 1);
    assert.ok(decision.story.id.length > 0);
    assert.notEqual(decision.terminal.outcome.recommendation, "");
  });

  it("projectPriorityPipelineStory is order-only (no heuristics)", () => {
    const story = projectPriorityPipelineStory(
      ["privacy", "energy", "layout"],
      42,
    );
    assert.equal(story.primaryPriority, "privacy");
    assert.equal(story.secondaryPriority, "energy");
    assert.equal(story.updatedAt, 42);
  });

  it("recordSignal is available for explicit semantic recording", () => {
    const session = createDecisionSession({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      clock: createFixedClock(7),
    });
    const signal = session.recordSignal({
      type: "PrioritySelected",
      priorityId: "design",
    });
    assert.equal(signal.at, 7);
    assert.equal(session.getSignals().length, 1);
  });
});
