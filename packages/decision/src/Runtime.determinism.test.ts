import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Runtime } from "@embed-engine/core";
import type { SceneGraph } from "@embed-engine/core";

import { createDecisionRuntime } from "./createDecisionRuntime";
import { DecisionInterpreter } from "./DecisionInterpreter";
import { DefaultDecisionRegistry } from "./DefaultDecisionRegistry";
import type { DecisionState } from "./DecisionState";
import type { SetAnswerCommand } from "./SetAnswerCommand";

const SCENE_GRAPH: SceneGraph = {
  start: "start",
  scenes: {
    start: { id: "start" },
  },
};

const PREFERENCE_A_DEFINITION = {
  id: "preference-a",
  question: "Preference A",
  type: "single-choice" as const,
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
      const command = setAnswer("preference-a", "option-a");

      const experienceA = runtimeA.dispatch(command);
      const experienceB = runtimeB.dispatch(command);

      assert.deepEqual(experienceA, experienceB);
    });
  });

  describe("deterministic sequence", () => {
    it("the same command sequence yields equal final ExperienceModel and DecisionState", () => {
      const sequence = [
        setAnswer("preference-a", "option-a"),
        setAnswer("preference-a", "option-a2"),
        setAnswer("other-decision", 42),
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
      assert.equal(experienceA?.currentSceneId, "start");
      assert.deepEqual(experienceA?.answers, {
        "preference-a": "option-a2",
        "other-decision": 42,
      });
      assert.equal(experienceA?.currentDecisionId, null);
      assert.deepEqual(experienceA?.history, []);
      assert.equal(experienceA?.currentDecision, null);
      assert.equal(experienceA?.decisionFlow.length, 5);
      assert.deepEqual(
        experienceA?.decisions.map((decision) => decision.id),
        ["preference-a"],
      );
    });
  });

  describe("interpreter has no side effects", () => {
    it("DecisionState and DecisionRegistry are unchanged by interpretation", () => {
      const registry = new DefaultDecisionRegistry([PREFERENCE_A_DEFINITION]);
      const state: DecisionState = {
        answers: new Map([["preference-a", "option-a"]]),
        currentDecisionId: "preference-a",
        history: ["start"],
      };
      const answersBefore = [...state.answers.entries()];
      const definitionBefore = registry.get("preference-a");

      const interpreter = new DecisionInterpreter(registry);
      interpreter.interpret({
        currentSceneId: "start",
        state,
      });

      assert.deepEqual([...state.answers.entries()], answersBefore);
      assert.deepEqual(registry.get("preference-a"), definitionBefore);
    });

    it("re-interpreting after dispatch does not alter DecisionState further", () => {
      const runtime = createDecisionRuntime(SCENE_GRAPH);
      runtime.dispatch(setAnswer("preference-a", "option-a"));

      const answersAfterHandler = answersOf(runtime);
      const interpreter = new DecisionInterpreter(
        new DefaultDecisionRegistry([PREFERENCE_A_DEFINITION]),
      );

      interpreter.interpret(runtime.context);
      interpreter.interpret(runtime.context);

      assert.deepEqual(answersOf(runtime), answersAfterHandler);
    });
  });

  describe("Runtime has no hidden state", () => {
    it("isolated Runtimes with the same configuration reproduce the same result", () => {
      const sequence = [
        setAnswer("preference-a", "option-a"),
        setAnswer("preference-a", "option-a2"),
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
      runtime.dispatch(setAnswer("preference-a", "option-a"));

      const interpreter = new DecisionInterpreter(
        new DefaultDecisionRegistry([PREFERENCE_A_DEFINITION]),
      );

      const a = interpreter.interpret(runtime.context);
      const b = interpreter.interpret(runtime.context);

      assert.deepEqual(a, b);
      assert.deepEqual(a.decisionFlow, b.decisionFlow);
    });
  });
});
