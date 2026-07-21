import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createPriorityRuntimeEngine,
  isPriorityJourneyComplete,
} from "../index";
import {
  GARDEN_OBJECT_ID,
  GARDEN_PRIORITY_ID,
  createGardenEngineEvents,
  createGardenJourneyRun,
  gardenContentPackage,
  gardenExperience,
  gardenInterpretation,
  gardenPrioritySelection,
} from "./index";

describe("createGardenJourneyRun (mock Experience Composer)", () => {
  it("builds a complete Garden PriorityJourneyRun from static SSOT fixtures", () => {
    const run = createGardenJourneyRun();

    assert.equal(run.object.objectId, GARDEN_OBJECT_ID);
    assert.equal(run.stage, "FollowUp");
    assert.deepEqual(run.selection, gardenPrioritySelection);
    assert.equal(run.selection.dominantPriorityId, GARDEN_PRIORITY_ID);
    assert.equal(run.confirmation?.accepted, true);
    assert.equal(
      run.confirmation?.presentationPayload.title,
      gardenContentPackage.stageMicrocopy.confirmation.title,
    );
    assert.equal(run.interpretation?.id, gardenInterpretation.id);
    assert.equal(run.experience?.id, gardenExperience.id);
    assert.equal(run.experience?.title, "Čtení domu přes zahradu");
    assert.ok(run.houseMapping && run.houseMapping.entries.length >= 1);
    assert.ok(run.followUps && run.followUps.length >= 1);
    assert.equal(run.transitionMessage?.text.length !== 0, true);
  });

  it("replays Garden fixtures through Runtime Engine to Completed without errors", () => {
    const run = createGardenJourneyRun();
    const engine = createPriorityRuntimeEngine(run.object.objectId);

    for (const event of createGardenEngineEvents()) {
      const result = engine.dispatch(event);
      assert.equal(
        result.ok,
        true,
        result.ok ? undefined : `${result.error.event}: ${result.error.message}`,
      );
    }

    const state = engine.getState();
    assert.equal(engine.isComplete(), true);
    assert.equal(isPriorityJourneyComplete(state), true);
    assert.equal(state.stage, "FollowUp");
    assert.equal(state.completed, true);
    assert.equal(state.object.objectId, GARDEN_OBJECT_ID);
    assert.equal(state.experience?.title, run.experience?.title);
    assert.equal(state.interpretation?.id, run.interpretation?.id);
    assert.equal(
      state.houseMapping?.entries.length,
      run.houseMapping?.entries.length,
    );
    assert.deepEqual(state.followUps, run.followUps);
  });
});
