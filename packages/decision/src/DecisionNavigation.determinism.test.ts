import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Runtime, SceneGraph } from "@embed-engine/core";

import { createDecisionRuntime } from "./createDecisionRuntime";
import type { DecisionState } from "./DecisionState";
import type { GoBackCommand } from "./GoBackCommand";
import type { GoToDecisionCommand } from "./GoToDecisionCommand";
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

function goTo(decisionId: string): GoToDecisionCommand {
  return { type: "go-to-decision", decisionId };
}

function goBack(): GoBackCommand {
  return { type: "go-back" };
}

function navigationOf(runtime: Runtime) {
  const state = runtime.context.state as DecisionState;
  return {
    currentDecisionId: state.currentDecisionId,
    history: [...state.history],
  };
}

describe("Decision navigation determinism", () => {
  it("starts a flow at the requested decision with empty history", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);

    const experience = runtime.dispatch(startFlow("priority-focus"));

    assert.deepEqual(navigationOf(runtime), {
      currentDecisionId: "priority-focus",
      history: [],
    });
    assert.equal(experience.currentDecision?.title, "Co je pro vás důležitější?");
  });

  it("navigates forward and records history deterministically", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);

    runtime.dispatch(startFlow("priority-focus"));
    const experience = runtime.dispatch(goTo("garden-importance"));

    assert.deepEqual(navigationOf(runtime), {
      currentDecisionId: "garden-importance",
      history: ["priority-focus"],
    });
    assert.equal(experience.currentDecisionId, "garden-importance");
  });

  it("navigates back using history", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);

    runtime.dispatch(startFlow("priority-focus"));
    runtime.dispatch(goTo("garden-importance"));
    runtime.dispatch(goTo("summary"));
    const experience = runtime.dispatch(goBack());

    assert.deepEqual(navigationOf(runtime), {
      currentDecisionId: "garden-importance",
      history: ["priority-focus"],
    });
    assert.equal(experience.currentDecisionId, "garden-importance");
  });

  it("reproduces the same navigation sequence on fresh Runtimes", () => {
    const sequence = [
      startFlow("priority-focus"),
      goTo("garden-importance"),
      goTo("summary"),
      goBack(),
      goTo("summary"),
    ];

    const run = () => {
      const runtime = createDecisionRuntime(SCENE_GRAPH);
      let experience;
      for (const command of sequence) {
        experience = runtime.dispatch(command);
      }
      return {
        experience,
        navigation: navigationOf(runtime),
      };
    };

    assert.deepEqual(run(), run());
  });

  it("keeps history deterministic across identical forward/back sequences", () => {
    const sequence = [
      startFlow("priority-focus"),
      goTo("garden-importance"),
      goTo("summary"),
      goBack(),
      goBack(),
      goTo("summary"),
    ];

    const runtimeA = createDecisionRuntime(SCENE_GRAPH);
    const runtimeB = createDecisionRuntime(SCENE_GRAPH);

    for (const command of sequence) {
      runtimeA.dispatch(command);
      runtimeB.dispatch(command);
    }

    assert.deepEqual(navigationOf(runtimeA), navigationOf(runtimeB));
    assert.deepEqual(navigationOf(runtimeA), {
      currentDecisionId: "summary",
      history: ["priority-focus"],
    });
  });
});
