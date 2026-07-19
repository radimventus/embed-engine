import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Runtime, SceneGraph } from "@embed-engine/core";

import { createDecisionRuntime } from "./createDecisionRuntime";
import { DefaultDecisionRegistry } from "./DefaultDecisionRegistry";
import type { DecisionState } from "./DecisionState";
import type { GoBackCommand } from "./GoBackCommand";
import type { GoNextCommand } from "./GoNextCommand";
import { InvalidDecisionGraphError } from "./InvalidDecisionGraphError";
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

describe("Decision graph navigation", () => {
  it("resolves go-next from the registry graph deterministically", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);

    runtime.dispatch(startFlow("start"));
    const toPreferenceA = runtime.dispatch(goNext());
    const toPreferenceB = runtime.dispatch(goNext());

    assert.equal(toPreferenceA.currentDecisionId, "preference-a");
    assert.deepEqual(toPreferenceA.history, ["start"]);
    assert.deepEqual(toPreferenceA.currentDecision, {
      id: "preference-a",
      title: "Preference A",
      visited: false,
      current: true,
    });

    assert.equal(toPreferenceB.currentDecisionId, "preference-b");
    assert.deepEqual(toPreferenceB.history, ["start", "preference-a"]);
    assert.deepEqual(toPreferenceB.currentDecision, {
      id: "preference-b",
      title: "Preference B",
      visited: false,
      current: true,
    });
  });

  it("reproduces the same graph navigation sequence on fresh Runtimes", () => {
    const sequence = [
      startFlow("start"),
      goNext(),
      goNext(),
      goBack(),
      goNext(),
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
      currentDecisionId: "preference-b",
      history: ["start", "preference-a"],
    });
  });

  it("fails predictably when a next edge is missing", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);

    runtime.dispatch(startFlow("summary"));

    assert.throws(
      () => runtime.dispatch(goNext()),
      (error: unknown) =>
        error instanceof InvalidDecisionGraphError &&
        error.message.includes("has no next edge"),
    );
  });

  it("fails predictably when go-next is used without a current decision", () => {
    const runtime = createDecisionRuntime(SCENE_GRAPH);

    assert.throws(
      () => runtime.dispatch(goNext()),
      (error: unknown) =>
        error instanceof InvalidDecisionGraphError &&
        error.message.includes("without a current decision"),
    );
  });

  it("fails predictably when the registry contains an invalid next edge", () => {
    assert.throws(
      () =>
        new DefaultDecisionRegistry([
          {
            id: "start",
            question: "Start",
            type: "text",
            next: "missing-node",
          },
        ]),
      (error: unknown) =>
        error instanceof InvalidDecisionGraphError &&
        error.message.includes("missing-node"),
    );
  });

  it("fails predictably when the registry contains an invalid previous edge", () => {
    assert.throws(
      () =>
        new DefaultDecisionRegistry([
          {
            id: "preference-a",
            question: "Preference A",
            type: "single-choice",
            previous: "missing-node",
          },
        ]),
      (error: unknown) =>
        error instanceof InvalidDecisionGraphError &&
        error.message.includes("missing-node"),
    );
  });

  it("exposes static next and previous through DecisionRegistry", () => {
    const registry = new DefaultDecisionRegistry([
      {
        id: "start",
        question: "Start",
        type: "text",
        next: "preference-a",
      },
      {
        id: "preference-a",
        question: "Preference A",
        type: "single-choice",
        next: "preference-b",
        previous: "start",
      },
      {
        id: "preference-b",
        question: "Preference B",
        type: "single-choice",
        previous: "preference-a",
      },
    ]);

    assert.equal(registry.getNext("start"), "preference-a");
    assert.equal(registry.getPrevious("preference-a"), "start");
    assert.equal(registry.getNext("preference-b"), undefined);
    assert.equal(registry.getPrevious("start"), undefined);
  });
});
