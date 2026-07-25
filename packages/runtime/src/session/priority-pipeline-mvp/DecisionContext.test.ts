import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import { createFixedClock } from "../clock";
import {
  createDecisionSession,
  projectPriorityPipelineStory,
} from "./PriorityDecisionSession";
import { buildDecisionContext } from "./buildDecisionContext";

/**
 * PT-003 — Decision Context from Decision Story.
 */
describe("PT-003 Decision Context Engine", () => {
  it("buildDecisionContext maps energy story to deterministic Context", () => {
    const story = projectPriorityPipelineStory(
      ["energy", "layout", "privacy"],
      10,
    );
    const context = buildDecisionContext(story);

    assert.equal(context.focusPriority, "energy");
    assert.equal(context.secondaryPriority, "layout");
    assert.deepEqual(context.selectedPriorities, [
      "energy",
      "layout",
      "privacy",
    ]);
    assert.equal(
      context.headline,
      "Nejvyšší prioritu mají provozní náklady.",
    );
    assert.match(context.summary, /energetickou efektivitou/);
    assert.deepEqual(context.recommendations, [
      "Energetický standard",
      "Technologie vytápění",
      "Roční provozní náklady",
    ]);
  });

  it("design primary yields a different Context than energy (PT-003 validation)", () => {
    const energy = buildDecisionContext(
      projectPriorityPipelineStory(["energy", "layout", "privacy"], 1),
    );
    const design = buildDecisionContext(
      projectPriorityPipelineStory(["design", "layout", "privacy"], 2),
    );

    assert.notEqual(energy.headline, design.headline);
    assert.notEqual(energy.summary, design.summary);
    assert.notDeepEqual(energy.recommendations, design.recommendations);
    assert.equal(design.focusPriority, "design");
    assert.match(design.headline, /design/i);
  });

  it("session getDecisionContext / buildDecisionContext follow Decision Story", () => {
    const energySession = createDecisionSession({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      clock: createFixedClock(100),
      now: 100,
    });
    energySession.selectPriority("energy");
    energySession.selectPriority("layout");
    energySession.selectPriority("privacy");

    const energyContext = energySession.getDecisionContext();
    assert.equal(energyContext.focusPriority, "energy");
    assert.deepEqual(
      energyContext,
      buildDecisionContext(energySession.getDecisionStory()),
    );

    const designSession = createDecisionSession({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      clock: createFixedClock(200),
      now: 200,
    });
    designSession.selectPriority("design");
    designSession.selectPriority("layout");
    designSession.selectPriority("privacy");

    const designContext = designSession.getDecisionContext();
    assert.equal(designContext.focusPriority, "design");
    assert.notEqual(designContext.headline, energyContext.headline);
    assert.notEqual(designContext.summary, energyContext.summary);
    assert.notDeepEqual(
      designContext.recommendations,
      energyContext.recommendations,
    );
    assert.deepEqual(designSession.buildDecisionContext(), designContext);
  });
});
