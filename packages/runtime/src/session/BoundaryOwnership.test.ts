import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import {
  composeAIContext,
  composeDecisionMoves,
  composeDecisionOutcome,
  composeDecisionTerminal,
  createDecisionSessionRuntime,
  interpretDecisionSession,
} from "../testing";

/**
 * ED-DA-01 — ownership / dependency direction guards (no behavioural change).
 */
describe("Decision Architecture boundaries (ED-DA-01)", () => {
  it("enforces Story → Moves → Outcome → Terminal → AIContext ownership chain", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["garden"] }, 3);

    const interpretation = interpretDecisionSession(
      runtime.getSession(),
      REFERENCE_HOUSE_PACKAGE,
    );

    const moves = composeDecisionMoves(interpretation.decisionStory);
    const outcome = composeDecisionOutcome(moves);
    const terminal = composeDecisionTerminal(outcome);
    const ai = composeAIContext(terminal);

    assert.equal(moves.storyId, interpretation.decisionStory.id);
    assert.equal(outcome.storyId, moves.storyId);
    assert.deepEqual(outcome.moveRef.moveIds, moves.moves.map((m) => m.id));
    assert.equal(terminal.outcome, outcome);
    assert.equal(ai.terminal, terminal);
    assert.equal(ai.outcome, terminal.outcome);

    assert.deepEqual(moves, interpretation.decisionMoves);
    assert.deepEqual(outcome, interpretation.decisionOutcome);
    assert.deepEqual(terminal, interpretation.decisionTerminal);
    assert.deepEqual(ai, interpretation.aiContext);
  });

  it("Experience Context exposes owned Story / Moves / Outcome / Terminal / AI", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);

    const experience = runtime.getExperience()!;
    const interpretation = interpretDecisionSession(
      runtime.getSession(),
      REFERENCE_HOUSE_PACKAGE,
    );
    const decision = experience.context.decision;

    assert.deepEqual(decision.story, interpretation.decisionStory);
    assert.deepEqual(decision.moves, interpretation.decisionMoves);
    assert.deepEqual(decision.outcome, interpretation.decisionOutcome);
    assert.deepEqual(decision.terminal, interpretation.decisionTerminal);
    assert.deepEqual(decision.ai, interpretation.aiContext);
  });
});
