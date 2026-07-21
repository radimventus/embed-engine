import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createGardenJourneyRun,
  createInitialPriorityRuntimeState,
  createPriorityRuntimeEngine,
} from "../index";
import { createGardenEngineEvents } from "../mock";
import { renderPriorityJourney } from "./renderPriorityJourney";

describe("Priority HTML Renderer v0.1", () => {
  it("renders Confirmation / Interpretation / House Mapping from fixture + engine state", () => {
    const fixture = createGardenJourneyRun();
    const engine = createPriorityRuntimeEngine(fixture.object.objectId);

    for (const event of createGardenEngineEvents()) {
      if (event.type === "priority.followup.selected") break;
      const result = engine.dispatch(event);
      assert.equal(result.ok, true);
    }

    const html = renderPriorityJourney({
      state: engine.getState(),
      fixture,
      errorMessage: null,
    });

    assert.match(html, /data-stage="HouseMapping"/);
    assert.match(html, /House Mapping/);
    assert.match(html, /day-zone-outdoor-exit/);
    assert.match(html, /Prohlídka denní zóny/);
  });

  it("renders all required stage shells from engine progression", () => {
    const fixture = createGardenJourneyRun();
    const engine = createPriorityRuntimeEngine(fixture.object.objectId);
    const seen = new Set<string>();

    const capture = () => {
      const html = renderPriorityJourney({
        state: engine.getState(),
        fixture,
        errorMessage: null,
      });
      const match = html.match(/data-stage="([^"]+)"/);
      if (match) seen.add(match[1]!);
    };

    capture(); // Selection
    for (const event of createGardenEngineEvents()) {
      const result = engine.dispatch(event);
      assert.equal(result.ok, true);
      capture();
    }

    assert.ok(seen.has("Selection"));
    assert.ok(seen.has("Confirmation"));
    assert.ok(seen.has("Transition"));
    assert.ok(seen.has("Interpretation"));
    assert.ok(seen.has("HouseMapping"));
    assert.ok(seen.has("FollowUp"));
  });

  it("does not invent Experience before engine has it", () => {
    const fixture = createGardenJourneyRun();
    const state = createInitialPriorityRuntimeState(fixture.object);
    // Force Interpretation stage without Experience — renderer must wait for fixture load action
    const html = renderPriorityJourney({
      state: {
        ...state,
        stage: "Interpretation",
        selection: fixture.selection,
        confirmation: fixture.confirmation,
      },
      fixture,
      errorMessage: null,
    });

    assert.match(html, /Načíst čtení z Garden fixture/);
    assert.doesNotMatch(html, /Čtení domu přes zahradu/);
  });
});
