import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import {
  createFixedClock,
  composeDecisionOutcome,
  createDecisionSessionRuntime,
  DECISION_OUTCOME_SCHEMA_VERSION,
  interpretDecisionSession,
} from "../testing";

describe("Decision Outcome Engine (CAP-OUT-001)", () => {
  it("identical Move sequences produce identical Outcomes", () => {
    const a = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    const b = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });

    a.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    b.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    a.dispatch({ type: "ChangePriority", priorityIds: ["garden", "space"] }, 3);
    b.dispatch({ type: "ChangePriority", priorityIds: ["garden", "space"] }, 3);

    assert.deepEqual(
      a.getExperience()!.context.decision.outcome,
      b.getExperience()!.context.decision.outcome,
    );
    assert.deepEqual(
      a.getExperience()!.context.decision.outcome,
      b.getExperience()!.context.decision.outcome,
    );
  });

  it("Outcome is derived from Moves and references the Move sequence", () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-kitchen" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["investment"] }, 3);

    const { moves: decisionMoves, outcome: decisionOutcome, story: decisionStory } =
      runtime.getExperience()!.context.decision;

    assert.equal(decisionOutcome.schemaVersion, DECISION_OUTCOME_SCHEMA_VERSION);
    assert.equal(decisionOutcome.storyId, decisionMoves.storyId);
    assert.equal(decisionOutcome.storyId, decisionStory.id);
    assert.equal(decisionOutcome.moveRef.storyId, decisionMoves.storyId);
    assert.equal(decisionOutcome.moveRef.activeMoveId, decisionMoves.activeMoveId);
    assert.equal(decisionOutcome.moveRef.moveCount, decisionMoves.moves.length);
    assert.deepEqual(
      decisionOutcome.moveRef.moveIds,
      decisionMoves.moves.map((move) => move.id),
    );
    assert.equal(decisionOutcome.status, "in-progress");
    assert.ok(decisionOutcome.unresolvedMoveIds.length > 0);
    assert.equal(
      decisionOutcome.confidence,
      Number(decisionOutcome.confidence.toFixed(2)),
    );
  });

  it("different Move sequences produce different Outcomes", () => {
    const outdoor = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    outdoor.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    outdoor.dispatch({ type: "ChangePriority", priorityIds: ["plot"] }, 3);

    const privacy = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    privacy.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    privacy.dispatch({ type: "ChangePriority", priorityIds: ["privacy"] }, 3);

    assert.notDeepEqual(
      outdoor.getExperience()!.context.decision.moves,
      privacy.getExperience()!.context.decision.moves,
    );
    assert.notDeepEqual(
      outdoor.getExperience()!.context.decision.outcome,
      privacy.getExperience()!.context.decision.outcome,
    );
    assert.notEqual(
      outdoor.getExperience()!.context.decision.outcome.recommendation,
      privacy.getExperience()!.context.decision.outcome.recommendation,
    );
  });

  it("composeDecisionOutcome accepts only Moves (Moves → Outcome)", () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["space"] }, 3);

    const interpretation = interpretDecisionSession(
      runtime.getSession(),
      REFERENCE_HOUSE_PACKAGE,
    );

    const again = composeDecisionOutcome(interpretation.decisionMoves);
    assert.deepEqual(again, interpretation.decisionOutcome);
    assert.deepEqual(
      runtime.getExperience()!.context.decision.outcome,
      interpretation.decisionOutcome,
    );
    assert.ok(interpretation.decisionOutcome.rationale.length > 0);
    assert.equal(
      interpretation.decisionOutcome.recommendedNextAction,
      interpretation.decisionMoves.moves[0]?.recommendedAction,
    );
  });
});
