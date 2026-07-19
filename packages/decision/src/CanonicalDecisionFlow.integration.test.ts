import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SceneGraph } from "@embed-engine/core";

import {
  CANONICAL_DECISION_FLOW,
  CANONICAL_DECISION_FLOW_START_ID,
} from "./canonical-decision-flow";
import { createDecisionRuntime } from "./createDecisionRuntime";
import { DefaultDecisionRegistry } from "./DefaultDecisionRegistry";
import type { DecisionState } from "./DecisionState";
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
  it("populates DecisionRegistry from declarative definitions", () => {
    const registry = new DefaultDecisionRegistry(CANONICAL_DECISION_FLOW);

    assert.equal(registry.get("start")?.next, "preference-a");
    assert.equal(registry.getNext("preference-a"), "preference-b");
    assert.equal(registry.getNext("preference-b"), "preference-c");
    assert.equal(registry.getNext("preference-c"), "summary");
    assert.equal(registry.getNext("summary"), undefined);
    assert.equal(registry.getPrevious("preference-a"), "start");
    assert.equal(registry.getPrevious("summary"), "preference-c");
  });

  it("executes the complete linear flow end-to-end", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);

    let experience = runtime.dispatch(
      startFlow(CANONICAL_DECISION_FLOW_START_ID),
    );
    assert.equal(experience.currentDecisionId, "start");
    assert.deepEqual(experience.history, []);
    assert.equal(experience.currentDecision?.title, "Start");
    assert.equal(experience.decisionFlow.length, 5);

    experience = runtime.dispatch(goNext());
    assert.equal(experience.currentDecisionId, "preference-a");
    experience = runtime.dispatch(setAnswer("preference-a", "option-a"));

    experience = runtime.dispatch(goNext());
    assert.equal(experience.currentDecisionId, "preference-b");
    experience = runtime.dispatch(setAnswer("preference-b", "option-b"));

    experience = runtime.dispatch(goNext());
    assert.equal(experience.currentDecisionId, "preference-c");
    experience = runtime.dispatch(setAnswer("preference-c", "option-c"));

    experience = runtime.dispatch(goNext());
    assert.equal(experience.currentDecisionId, "summary");
    assert.deepEqual(experience.history, [
      "start",
      "preference-a",
      "preference-b",
      "preference-c",
    ]);
    assert.deepEqual(experience.answers, {
      "preference-a": "option-a",
      "preference-b": "option-b",
      "preference-c": "option-c",
    });
    assert.equal(experience.currentDecision?.title, "Summary");
    assert.deepEqual(
      experience.decisionFlow.map((decision) => ({
        id: decision.id,
        visited: decision.visited,
        current: decision.current,
      })),
      [
        { id: "start", visited: true, current: false },
        { id: "preference-a", visited: true, current: false },
        { id: "preference-b", visited: true, current: false },
        { id: "preference-c", visited: true, current: false },
        { id: "summary", visited: false, current: true },
      ],
    );

    const state = runtime.context.state as DecisionState;
    assert.equal(state.currentDecisionId, "summary");
    assert.deepEqual([...state.history], [
      "start",
      "preference-a",
      "preference-b",
      "preference-c",
    ]);
  });
});
