import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DefaultDecisionRegistry } from "./DefaultDecisionRegistry";
import type { DecisionState } from "./DecisionState";
import { interpretDecision } from "./interpretDecision";

const KITCHEN_TYPE = {
  id: "kitchen-type",
  question: "Kitchen type",
  type: "single-choice" as const,
};

describe("interpretDecision", () => {
  it("produces the same ExperienceModel for the same DecisionState", () => {
    const registry = new DefaultDecisionRegistry([KITCHEN_TYPE]);
    const state: DecisionState = {
      answers: new Map([["kitchen-type", "island"]]),
    };

    const first = interpretDecision(registry, state, "start");
    const second = interpretDecision(registry, state, "start");

    assert.deepEqual(first, second);
    assert.deepEqual(first, {
      currentSceneId: "start",
      answers: { "kitchen-type": "island" },
      decisions: [KITCHEN_TYPE],
    });
  });

  it("does not mutate DecisionState", () => {
    const registry = new DefaultDecisionRegistry([KITCHEN_TYPE]);
    const state: DecisionState = {
      answers: new Map([["kitchen-type", "island"]]),
    };
    const answersBefore = [...state.answers.entries()];

    interpretDecision(registry, state, "start");

    assert.deepEqual([...state.answers.entries()], answersBefore);
    assert.equal(state.answers.get("kitchen-type"), "island");
    assert.equal(state.answers.size, 1);
  });

  it("does not mutate DecisionRegistry", () => {
    const registry = new DefaultDecisionRegistry([KITCHEN_TYPE]);
    const definitionBefore = registry.get("kitchen-type");

    const state: DecisionState = {
      answers: new Map([["kitchen-type", "island"]]),
    };

    interpretDecision(registry, state, "start");

    assert.deepEqual(registry.get("kitchen-type"), definitionBefore);
    assert.equal(registry.get("missing"), undefined);
  });
});
