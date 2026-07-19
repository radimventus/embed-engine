import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SceneGraph } from "@embed-engine/core";

import {
  GARDEN_IMPORTANCE_DECISION_ID,
  GARDEN_IMPORTANCE_YES,
  PRIORITY_FOCUS_DECISION_ID,
  PRIORITY_FOCUS_PRICE,
} from "./buildDecisionFilter";
import { createDecisionRuntime } from "./createDecisionRuntime";
import { DefaultDecisionRegistry } from "./DefaultDecisionRegistry";
import {
  HOUSE_DECISION_FLOW,
  HOUSE_DECISION_FLOW_START_ID,
} from "./house-decision-flow";
import type { GoNextCommand } from "./GoNextCommand";
import type { SetAnswerCommand } from "./SetAnswerCommand";
import type { StartDecisionFlowCommand } from "./StartDecisionFlowCommand";

const SCENE_GRAPH: SceneGraph = {
  start: "start",
  scenes: {
    start: { id: "start" },
  },
};

function startFlow(decisionId: string): StartDecisionFlowCommand {
  return { type: "start-decision-flow", decisionId };
}

function goNext(): GoNextCommand {
  return { type: "go-next" };
}

function setAnswer(decisionId: string, value: unknown): SetAnswerCommand {
  return { type: "set-answer", decisionId, value };
}

describe("Canonical Decision Flow", () => {
  it("populates DecisionRegistry from declarative house definitions", () => {
    const registry = new DefaultDecisionRegistry(HOUSE_DECISION_FLOW);

    assert.equal(registry.get("start")?.next, PRIORITY_FOCUS_DECISION_ID);
    assert.equal(registry.getNext(PRIORITY_FOCUS_DECISION_ID), GARDEN_IMPORTANCE_DECISION_ID);
    assert.equal(registry.getNext(GARDEN_IMPORTANCE_DECISION_ID), "summary");
  });

  it("executes the complete linear house flow end-to-end", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);

    let experience = runtime.dispatch(startFlow(HOUSE_DECISION_FLOW_START_ID));
    assert.equal(experience.currentDecisionId, "start");

    experience = runtime.dispatch(goNext());
    experience = runtime.dispatch(
      setAnswer(PRIORITY_FOCUS_DECISION_ID, PRIORITY_FOCUS_PRICE),
    );
    experience = runtime.dispatch(goNext());
    experience = runtime.dispatch(
      setAnswer(GARDEN_IMPORTANCE_DECISION_ID, GARDEN_IMPORTANCE_YES),
    );
    experience = runtime.dispatch(goNext());

    assert.equal(experience.summaryReady, true);
    assert.equal(experience.decisionFlow.length, 4);
    assert.ok(experience.highlights.length >= 2);
  });
});
