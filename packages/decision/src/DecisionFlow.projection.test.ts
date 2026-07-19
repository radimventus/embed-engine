import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SceneGraph } from "@embed-engine/core";

import { createDecisionRuntime } from "./createDecisionRuntime";
import { DefaultDecisionRegistry } from "./DefaultDecisionRegistry";
import type { DecisionState } from "./DecisionState";
import { HOUSE_DECISION_FLOW } from "./house-decision-flow";
import { interpretDecision } from "./interpretDecision";
import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";
import type { GoNextCommand } from "./GoNextCommand";
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

describe("Decision Flow projection", () => {
  it("projects every decision into decisionFlow", () => {
    const registry = new DefaultDecisionRegistry(HOUSE_DECISION_FLOW);
    const state: DecisionState = {
      answers: new Map(),
      currentDecisionId: null,
      history: [],
    };

    const experience = interpretDecision(
      registry,
      state,
      "start",
      REFERENCE_HOUSE_PACKAGE,
    );

    assert.equal(experience.decisionFlow.length, HOUSE_DECISION_FLOW.length);
    assert.deepEqual(
      experience.decisionFlow.map((decision) => decision.id),
      HOUSE_DECISION_FLOW.map((definition) => definition.id),
    );
  });

  it("preserves registry graph order", () => {
    const registry = new DefaultDecisionRegistry(HOUSE_DECISION_FLOW);
    const state: DecisionState = {
      answers: new Map(),
      currentDecisionId: "priority-focus",
      history: ["start"],
    };

    const experience = interpretDecision(
      registry,
      state,
      "start",
      REFERENCE_HOUSE_PACKAGE,
    );

    assert.deepEqual(
      experience.decisionFlow.map((decision) => decision.id),
      ["start", "priority-focus", "garden-importance", "summary"],
    );
  });

  it("marks exactly one node as current after the flow starts", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);
    const experience = runtime.dispatch(startFlow("start"));

    const currentNodes = experience.decisionFlow.filter(
      (decision) => decision.current,
    );

    assert.equal(currentNodes.length, 1);
    assert.equal(currentNodes[0]?.id, "start");
  });

  it("marks visited nodes from history only", () => {
    const registry = new DefaultDecisionRegistry(HOUSE_DECISION_FLOW);
    const state: DecisionState = {
      answers: new Map(),
      currentDecisionId: "garden-importance",
      history: ["start", "priority-focus"],
    };

    const experience = interpretDecision(
      registry,
      state,
      "start",
      REFERENCE_HOUSE_PACKAGE,
    );

    assert.deepEqual(
      experience.decisionFlow.map((decision) => ({
        id: decision.id,
        visited: decision.visited,
        current: decision.current,
      })),
      [
        { id: "start", visited: true, current: false },
        { id: "priority-focus", visited: true, current: false },
        { id: "garden-importance", visited: false, current: true },
        { id: "summary", visited: false, current: false },
      ],
    );
  });

  it("produces identical decisionFlow for identical runtimes and sequences", () => {
    const sequence = [startFlow("start"), goNext(), goNext()];

    const run = () => {
      const runtime = createDecisionRuntime(SCENE_GRAPH);
      let experience;
      for (const command of sequence) {
        experience = runtime.dispatch(command);
      }
      return experience?.decisionFlow;
    };

    assert.deepEqual(run(), run());
  });
});
