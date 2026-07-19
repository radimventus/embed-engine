import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SceneGraph } from "@embed-engine/core";

import {
  GARDEN_IMPORTANCE_DECISION_ID,
  GARDEN_IMPORTANCE_YES,
  PRIORITY_FOCUS_DECISION_ID,
  PRIORITY_FOCUS_PRICE,
  PRIORITY_FOCUS_SPACE,
} from "./buildDecisionFilter";
import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import { createDecisionRuntime } from "./createDecisionRuntime";
import { HOUSE_DECISION_FLOW_START_ID } from "./house-decision-flow";
import type { GoNextCommand } from "./GoNextCommand";
import type { SetAnswerCommand } from "./SetAnswerCommand";
import type { StartDecisionFlowCommand } from "./StartDecisionFlowCommand";

const SCENE_GRAPH: SceneGraph = {
  start: "start",
  scenes: {
    start: { id: "start" },
  },
};

function startFlow(): StartDecisionFlowCommand {
  return {
    type: "start-decision-flow",
    decisionId: HOUSE_DECISION_FLOW_START_ID,
  };
}

function goNext(): GoNextCommand {
  return { type: "go-next" };
}

function setAnswer(decisionId: string, value: unknown): SetAnswerCommand {
  return { type: "set-answer", decisionId, value };
}

describe("Minimal House Decision Experience", () => {
  it("runs the full deterministic vertical slice", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);

    let experience = runtime.dispatch(startFlow());
    assert.equal(experience.house?.id, REFERENCE_HOUSE_PACKAGE.identity.id);
    assert.equal(experience.house?.reference, REFERENCE_HOUSE_PACKAGE.identity.reference);
    assert.equal(experience.currentDecisionId, "start");
    assert.deepEqual(experience.highlights, []);
    assert.deepEqual(experience.recommendedRooms, []);

    experience = runtime.dispatch(goNext());
    assert.equal(experience.currentDecisionId, PRIORITY_FOCUS_DECISION_ID);
    assert.deepEqual(
      experience.currentDecision?.choices?.map((choice) => choice.id),
      [PRIORITY_FOCUS_PRICE, PRIORITY_FOCUS_SPACE],
    );

    experience = runtime.dispatch(
      setAnswer(PRIORITY_FOCUS_DECISION_ID, PRIORITY_FOCUS_PRICE),
    );
    experience = runtime.dispatch(goNext());
    assert.equal(experience.currentDecisionId, GARDEN_IMPORTANCE_DECISION_ID);
    assert.equal(experience.decisionFilter?.preferPrice, true);
    assert.deepEqual(experience.highlights, [
      {
        target: "price",
        label: "Cena",
        reason: "Preferujete cenu",
      },
    ]);

    experience = runtime.dispatch(
      setAnswer(GARDEN_IMPORTANCE_DECISION_ID, GARDEN_IMPORTANCE_YES),
    );
    experience = runtime.dispatch(goNext());

    assert.equal(experience.currentDecisionId, "summary");
    assert.equal(experience.summaryReady, true);
    assert.deepEqual(experience.decisionFilter, {
      preferPrice: true,
      preferSpace: false,
      preferGarden: true,
    });
    assert.deepEqual(experience.highlights, [
      {
        target: "price",
        label: "Cena",
        reason: "Preferujete cenu",
      },
      {
        target: "garden",
        label: "Zahrada",
        reason: "Zahrada je pro vás důležitá",
      },
    ]);
  });

  it("highlights layout and recommends rooms when space is preferred", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);

    runtime.dispatch(startFlow());
    runtime.dispatch(goNext());
    runtime.dispatch(setAnswer(PRIORITY_FOCUS_DECISION_ID, PRIORITY_FOCUS_SPACE));

    const experience = runtime.dispatch(goNext());

    assert.deepEqual(experience.highlights, [
      {
        target: "layout",
        label: "Dispozice",
        reason: "Preferujete prostor",
      },
    ]);
    assert.deepEqual(
      experience.recommendedRooms.map((room) => room.id),
      ["room-living", "room-children"],
    );
  });

  it("reproduces the same ReactExperienceModel for the same answer sequence", () => {
    const sequence = [
      startFlow(),
      goNext(),
      setAnswer(PRIORITY_FOCUS_DECISION_ID, PRIORITY_FOCUS_PRICE),
      goNext(),
      setAnswer(GARDEN_IMPORTANCE_DECISION_ID, GARDEN_IMPORTANCE_YES),
      goNext(),
    ];

    const run = () => {
      const runtime = createDecisionRuntime(SCENE_GRAPH);
      let experience;
      for (const command of sequence) {
        experience = runtime.dispatch(command);
      }
      return experience;
    };

    assert.deepEqual(run(), run());
  });
});
