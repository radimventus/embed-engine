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

function createState(
  overrides: Partial<DecisionState> = {},
): DecisionState {
  return {
    answers: new Map([["kitchen-type", "island"]]),
    currentDecisionId: "kitchen-type",
    history: [],
    ...overrides,
  };
}

describe("interpretDecision", () => {
  it("produces the same ExperienceModel for the same DecisionState", () => {
    const registry = new DefaultDecisionRegistry([KITCHEN_TYPE]);
    const state = createState();

    const first = interpretDecision(registry, state, "start");
    const second = interpretDecision(registry, state, "start");

    assert.deepEqual(first, second);
    assert.deepEqual(first.decisionFlow, [
      {
        id: "kitchen-type",
        title: "Kitchen type",
        visited: false,
        current: true,
      },
    ]);
    assert.deepEqual(first.currentDecision, first.decisionFlow[0]);
  });

  it("does not mutate DecisionState", () => {
    const registry = new DefaultDecisionRegistry([KITCHEN_TYPE]);
    const state = createState({ history: ["layout"] });
    const answersBefore = [...state.answers.entries()];
    const historyBefore = [...state.history];
    const currentBefore = state.currentDecisionId;

    interpretDecision(registry, state, "start");

    assert.deepEqual([...state.answers.entries()], answersBefore);
    assert.deepEqual(state.history, historyBefore);
    assert.equal(state.currentDecisionId, currentBefore);
  });

  it("does not mutate DecisionRegistry", () => {
    const registry = new DefaultDecisionRegistry([KITCHEN_TYPE]);
    const definitionBefore = registry.get("kitchen-type");
    const state = createState();

    interpretDecision(registry, state, "start");

    assert.deepEqual(registry.get("kitchen-type"), definitionBefore);
    assert.equal(registry.get("missing"), undefined);
  });
});
