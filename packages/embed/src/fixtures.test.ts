import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyPriorityEvent,
  createGardenJourneyRun,
  createPriorityRuntimeEngine,
} from "@embed-engine/runtime";
import {
  createEngineEventsFromJourneyRun,
  resolveEngineEvents,
  resolveJourneyFixture,
  type EmbedMountOptions,
} from "./fixtures";

describe("Embed fixtures", () => {
  it("resolves garden fixture via createGardenJourneyRun", () => {
    const options: EmbedMountOptions = {
      target: "#x",
      fixture: "garden",
    };
    const run = resolveJourneyFixture(options);
    assert.equal(run.object.objectId, "house-modern-01");
    assert.equal(run.selection.dominantPriorityId, "garden");
    assert.ok(run.experience);
  });

  it("passes through experience option", () => {
    const experience = createGardenJourneyRun();
    const run = resolveJourneyFixture({
      target: "#x",
      experience,
    });
    assert.equal(run, experience);
  });

  it("builds engine events that complete a Journey", () => {
    const run = createGardenJourneyRun();
    const events = createEngineEventsFromJourneyRun(run);
    const engine = createPriorityRuntimeEngine(run.object.objectId);

    for (const event of events) {
      const result = engine.dispatch(event);
      assert.equal(result.ok, true);
    }

    const follow = engine.dispatch({
      type: "priority.followup.selected",
      targetId: run.followUps![0]!.targetId,
    });
    assert.equal(follow.ok, true);
    assert.equal(engine.isComplete(), true);

    // also verify pure applyPriorityEvent path stays valid
    let state = createPriorityRuntimeEngine(run.object.objectId).getState();
    for (const event of events) {
      const result = applyPriorityEvent(state, event);
      assert.equal(result.ok, true);
      if (result.ok) state = result.state;
    }
  });

  it("garden resolveEngineEvents omits followup.selected", () => {
    const options: EmbedMountOptions = { target: "#x", fixture: "garden" };
    const run = resolveJourneyFixture(options);
    const events = resolveEngineEvents(options, run);
    assert.ok(
      events.every((event) => event.type !== "priority.followup.selected"),
    );
  });
});
