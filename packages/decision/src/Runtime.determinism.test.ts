import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Runtime } from "@embed-engine/core";
import type { SceneGraph } from "@embed-engine/core";

import { createDecisionRuntime } from "./createDecisionRuntime";
import { DecisionInterpreter } from "./DecisionInterpreter";
import { DefaultDecisionRegistry } from "./DefaultDecisionRegistry";
import type { DecisionState } from "./DecisionState";
import { HOUSE_DECISION_FLOW } from "./house-decision-flow";
import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";
import type { SetAnswerCommand } from "./SetAnswerCommand";

const SCENE_GRAPH: SceneGraph = {
  start: "start",
  scenes: {
    start: { id: "start" },
  },
};

function setAnswer(decisionId: string, value: unknown): SetAnswerCommand {
  return {
    type: "set-answer",
    decisionId,
    value,
  };
}

function answersOf(runtime: Runtime): [string, unknown][] {
  const state = runtime.context.state as DecisionState;
  return [...state.answers.entries()];
}

describe("Runtime determinism", () => {
  describe("same input → same output", () => {
    it("two fresh Runtimes produce equal ExperienceModel for the same command", () => {
      const runtimeA = createDecisionRuntime(SCENE_GRAPH);
      const runtimeB = createDecisionRuntime(SCENE_GRAPH);
      const command = setAnswer("priority-focus", "price");

      assert.deepEqual(runtimeA.dispatch(command), runtimeB.dispatch(command));
    });
  });

  describe("deterministic sequence", () => {
    it("the same command sequence yields equal final ExperienceModel and DecisionState", () => {
      const sequence = [
        setAnswer("priority-focus", "price"),
        setAnswer("garden-importance", "yes"),
      ];

      const runtimeA = createDecisionRuntime(SCENE_GRAPH);
      const runtimeB = createDecisionRuntime(SCENE_GRAPH);

      let experienceA;
      let experienceB;

      for (const command of sequence) {
        experienceA = runtimeA.dispatch(command);
        experienceB = runtimeB.dispatch(command);
      }

      assert.deepEqual(experienceA, experienceB);
      assert.deepEqual(answersOf(runtimeA), answersOf(runtimeB));
    });
  });

  describe("interpreter has no side effects", () => {
    it("DecisionState and DecisionRegistry are unchanged by interpretation", () => {
      const registry = new DefaultDecisionRegistry(HOUSE_DECISION_FLOW);
      const state: DecisionState = {
        answers: new Map([["priority-focus", "price"]]),
        currentDecisionId: "priority-focus",
        history: ["start"],
      };
      const answersBefore = [...state.answers.entries()];
      const definitionBefore = registry.get("priority-focus");

      const interpreter = new DecisionInterpreter(
        registry,
        REFERENCE_HOUSE_PACKAGE,
      );
      interpreter.interpret({
        currentSceneId: "start",
        state,
      });

      assert.deepEqual([...state.answers.entries()], answersBefore);
      assert.deepEqual(registry.get("priority-focus"), definitionBefore);
    });

    it("re-interpreting after dispatch does not alter DecisionState further", () => {
      const runtime = createDecisionRuntime(SCENE_GRAPH);
      runtime.dispatch(setAnswer("priority-focus", "price"));

      const answersAfterHandler = answersOf(runtime);
      const interpreter = new DecisionInterpreter(
        new DefaultDecisionRegistry(HOUSE_DECISION_FLOW),
        REFERENCE_HOUSE_PACKAGE,
      );

      interpreter.interpret(runtime.context);
      interpreter.interpret(runtime.context);

      assert.deepEqual(answersOf(runtime), answersAfterHandler);
    });
  });

  describe("Runtime has no hidden state", () => {
    it("isolated Runtimes with the same configuration reproduce the same result", () => {
      const sequence = [
        setAnswer("priority-focus", "price"),
        setAnswer("garden-importance", "yes"),
      ];

      const run = () => {
        const runtime = createDecisionRuntime(SCENE_GRAPH);
        let experience;
        for (const command of sequence) {
          experience = runtime.dispatch(command);
        }
        return {
          experience,
          answers: answersOf(runtime),
        };
      };

      assert.deepEqual(run(), run());
    });
  });

  describe("ExperienceModel is a pure projection", () => {
    it("two consecutive interpretations of the same state are equal", () => {
      const runtime = createDecisionRuntime(SCENE_GRAPH);
      runtime.dispatch(setAnswer("priority-focus", "price"));

      const interpreter = new DecisionInterpreter(
        new DefaultDecisionRegistry(HOUSE_DECISION_FLOW),
        REFERENCE_HOUSE_PACKAGE,
      );

      const a = interpreter.interpret(runtime.context);
      const b = interpreter.interpret(runtime.context);

      assert.deepEqual(a, b);
      assert.deepEqual(a.decisionFlow, b.decisionFlow);
    });
  });
});
