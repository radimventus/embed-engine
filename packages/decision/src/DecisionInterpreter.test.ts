import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DefaultDecisionRegistry } from "./DefaultDecisionRegistry";
import type { DecisionState } from "./DecisionState";
import { HOUSE_DECISION_FLOW } from "@embed-engine/object-house";
import { interpretDecision } from "./interpretDecision";
import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

describe("interpretDecision", () => {
  it("produces the same ReactExperienceModel for the same DecisionState", () => {
    const registry = new DefaultDecisionRegistry(HOUSE_DECISION_FLOW);
    const state: DecisionState = {
      answers: new Map([["priority-focus", "price"]]),
      currentDecisionId: "priority-focus",
      history: ["start"],
    };

    const first = interpretDecision(
      registry,
      state,
      "start",
      REFERENCE_HOUSE_PACKAGE,
    );
    const second = interpretDecision(
      registry,
      state,
      "start",
      REFERENCE_HOUSE_PACKAGE,
    );

    assert.deepEqual(first, second);
    assert.equal(first.house?.title, "Modern 01");
    assert.equal(first.decisionFilter?.preferPrice, true);
  });

  it("does not mutate DecisionState", () => {
    const registry = new DefaultDecisionRegistry(HOUSE_DECISION_FLOW);
    const state: DecisionState = {
      answers: new Map([["priority-focus", "price"]]),
      currentDecisionId: "priority-focus",
      history: ["start"],
    };
    const answersBefore = [...state.answers.entries()];
    const historyBefore = [...state.history];

    interpretDecision(registry, state, "start", REFERENCE_HOUSE_PACKAGE);

    assert.deepEqual([...state.answers.entries()], answersBefore);
    assert.deepEqual(state.history, historyBefore);
  });

  it("does not mutate DecisionRegistry", () => {
    const registry = new DefaultDecisionRegistry(HOUSE_DECISION_FLOW);
    const definitionBefore = registry.get("priority-focus");
    const state: DecisionState = {
      answers: new Map(),
      currentDecisionId: "start",
      history: [],
    };

    interpretDecision(registry, state, "start", REFERENCE_HOUSE_PACKAGE);

    assert.deepEqual(registry.get("priority-focus"), definitionBefore);
  });
});
