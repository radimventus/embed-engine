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
    const toPriority = runtime.dispatch(goNext());
    const toGarden = runtime.dispatch(goNext());

    assert.equal(toPriority.currentDecisionId, "priority-focus");
    assert.deepEqual(toPriority.history, ["start"]);
    assert.equal(toGarden.currentDecisionId, "garden-importance");
    assert.deepEqual(toGarden.history, ["start", "priority-focus"]);
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

    assert.deepEqual(run(), run());
    assert.deepEqual(run().navigation, {
      currentDecisionId: "garden-importance",
      history: ["start", "priority-focus"],
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
            id: "priority-focus",
            question: "Priority",
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
        next: "priority-focus",
      },
      {
        id: "priority-focus",
        question: "Priority",
        type: "single-choice",
        next: "summary",
        previous: "start",
      },
      {
        id: "summary",
        question: "Summary",
        type: "text",
        previous: "priority-focus",
      },
    ]);

    assert.equal(registry.getNext("start"), "priority-focus");
    assert.equal(registry.getPrevious("priority-focus"), "start");
    assert.equal(registry.getNext("summary"), undefined);
  });
});
