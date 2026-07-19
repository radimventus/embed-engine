import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Command } from "./Command";
import type { CommandHandler } from "./CommandHandler";
import type { ExecutionContext } from "./ExecutionContext";
import type { Interpreter } from "./Interpreter";
import { MapCommandResolver } from "./MapCommandResolver";
import { Runtime } from "./Runtime";
import type { SceneGraph } from "./SceneGraph";

const SCENE_GRAPH: SceneGraph = {
  start: "start",
  scenes: {
    start: { id: "start" },
  },
};

type TestState = {
  answers: Map<string, unknown>;
};

type SetValueCommand = Command & {
  type: "set-value";
  key: string;
  value: unknown;
};

function setValue(key: string, value: unknown): SetValueCommand {
  return { type: "set-value", key, value };
}

const setValueHandler: CommandHandler = {
  execute(command: Command, context: ExecutionContext): void {
    const { key, value } = command as SetValueCommand;
    const state = context.state as TestState;
    state.answers.set(key, value);
  },
};

const testInterpreter: Interpreter = {
  interpret(context: ExecutionContext) {
    const state = context.state as TestState;
    return {
      currentSceneId: context.currentSceneId,
      answers: Object.fromEntries(state.answers.entries()),
      decisions: [],
      currentDecisionId: null,
      history: [],
      currentDecision: null,
      decisionFlow: [],
      house: null,
      decisionFilter: null,
      highlights: [],
      recommendedRooms: [],
      summaryReady: false,
    };
  },
};

function createTestRuntime(): Runtime {
  const executionContext: ExecutionContext = {
    currentSceneId: SCENE_GRAPH.start,
    state: {
      answers: new Map<string, unknown>(),
    } satisfies TestState,
  };

  const resolver = new MapCommandResolver();
  resolver.register("set-value", setValueHandler);

  return new Runtime(SCENE_GRAPH, {
    executionContext,
    resolver,
    interpreter: testInterpreter,
  });
}

function answersOf(runtime: Runtime): [string, unknown][] {
  const state = runtime.context.state as TestState;
  return [...state.answers.entries()];
}

describe("Runtime determinism (core)", () => {
  it("same command on two fresh Runtimes yields equal ExperienceModel", () => {
    const runtimeA = createTestRuntime();
    const runtimeB = createTestRuntime();
    const command = setValue("a", 1);

    assert.deepEqual(runtimeA.dispatch(command), runtimeB.dispatch(command));
  });

  it("same command sequence is reproducible across fresh Runtimes", () => {
    const sequence = [setValue("a", 1), setValue("b", 2), setValue("a", 3)];

    const run = () => {
      const runtime = createTestRuntime();
      let experience;
      for (const command of sequence) {
        experience = runtime.dispatch(command);
      }
      return { experience, answers: answersOf(runtime) };
    };

    assert.deepEqual(run(), run());
  });

  it("interpretation does not mutate ExecutionContext state", () => {
    const runtime = createTestRuntime();
    runtime.dispatch(setValue("a", 1));

    const before = answersOf(runtime);
    const first = testInterpreter.interpret(runtime.context);
    const second = testInterpreter.interpret(runtime.context);

    assert.deepEqual(answersOf(runtime), before);
    assert.deepEqual(first, second);
  });
});
