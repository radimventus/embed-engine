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

    const experience = runtime.dispatch(startFlow("preference-a"));

    assert.deepEqual(navigationOf(runtime), {
      currentDecisionId: "preference-a",
      history: [],
    });
    assert.equal(experience.currentDecisionId, "preference-a");
    assert.deepEqual(experience.history, []);
    assert.deepEqual(experience.currentDecision, {
      id: "preference-a",
      title: "Preference A",
      visited: false,
      current: true,
    });
  });

  it("navigates forward and records history deterministically", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);

    runtime.dispatch(startFlow("preference-a"));
    const experience = runtime.dispatch(goTo("preference-b"));

    assert.deepEqual(navigationOf(runtime), {
      currentDecisionId: "preference-b",
      history: ["preference-a"],
    });
    assert.equal(experience.currentDecisionId, "preference-b");
    assert.deepEqual(experience.history, ["preference-a"]);
    assert.deepEqual(experience.currentDecision, {
      id: "preference-b",
      title: "Preference B",
      visited: false,
      current: true,
    });
  });

  it("navigates back using history", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);

    runtime.dispatch(startFlow("preference-a"));
    runtime.dispatch(goTo("preference-b"));
    runtime.dispatch(goTo("preference-c"));
    const experience = runtime.dispatch(goBack());

    assert.deepEqual(navigationOf(runtime), {
      currentDecisionId: "preference-b",
      history: ["preference-a"],
    });
    assert.equal(experience.currentDecisionId, "preference-b");
    assert.deepEqual(experience.history, ["preference-a"]);
    assert.deepEqual(experience.currentDecision, {
      id: "preference-b",
      title: "Preference B",
      visited: false,
      current: true,
    });
  });

  it("reproduces the same navigation sequence on fresh Runtimes", () => {
    const sequence = [
      startFlow("preference-a"),
      goTo("preference-b"),
      goTo("preference-c"),
      goBack(),
      goTo("preference-c"),
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

    const first = run();
    const second = run();

    assert.deepEqual(first, second);
    assert.deepEqual(first.navigation, {
      currentDecisionId: "preference-c",
      history: ["preference-a", "preference-b"],
    });
    assert.deepEqual(first.experience?.currentDecision, {
      id: "preference-c",
      title: "Preference C",
      visited: false,
      current: true,
    });
  });

  it("keeps history deterministic across identical forward/back sequences", () => {
    const sequence = [
      startFlow("preference-a"),
      goTo("preference-b"),
      goTo("preference-c"),
      goBack(),
      goBack(),
      goTo("preference-c"),
    ];

    const runtimeA = createDecisionRuntime(SCENE_GRAPH);
    const runtimeB = createDecisionRuntime(SCENE_GRAPH);

    for (const command of sequence) {
      runtimeA.dispatch(command);
      runtimeB.dispatch(command);
    }

    assert.deepEqual(navigationOf(runtimeA), navigationOf(runtimeB));
    assert.deepEqual(navigationOf(runtimeA), {
      currentDecisionId: "preference-c",
      history: ["preference-a"],
    });
  });
});
