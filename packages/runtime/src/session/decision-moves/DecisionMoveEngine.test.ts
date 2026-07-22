import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import {
  composeDecisionMoves,
  createDecisionSessionRuntime,
  DECISION_MOVE_SCHEMA_VERSION,
  interpretDecisionSession,
} from "../testing";

describe("Decision Move Engine (CAP-DST-002)", () => {
  it("identical Stories produce identical Move sequences", () => {
    const a = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    const b = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });

    a.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    b.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    a.dispatch({ type: "ChangePriority", priorityIds: ["garden", "space"] }, 3);
    b.dispatch({ type: "ChangePriority", priorityIds: ["garden", "space"] }, 3);

    assert.deepEqual(
      a.getExperience()!.decisionMoves,
      b.getExperience()!.decisionMoves,
    );
    assert.deepEqual(
      a.getExperience()!.context.decision.moves,
      b.getExperience()!.context.decision.moves,
    );
  });

  it("Moves always reference parent Story and never exist without it", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-kitchen" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["investment"] }, 3);

    const experience = runtime.getExperience()!;
    const { decisionStory, decisionMoves } = experience;

    assert.equal(decisionMoves.storyId, decisionStory.id);
    assert.equal(decisionMoves.schemaVersion, DECISION_MOVE_SCHEMA_VERSION);
    assert.ok(decisionMoves.moves.length > 0);
    for (const move of decisionMoves.moves) {
      assert.equal(move.storyId, decisionStory.id);
      assert.ok(move.id.includes(decisionStory.id));
    }
  });

  it("Move ordering is stable and successor-linked", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["space"] }, 3);

    const moves = runtime.getExperience()!.decisionMoves.moves;
    assert.equal(moves[0]?.status, "active");
    assert.equal(runtime.getExperience()!.decisionMoves.activeMoveId, moves[0]?.id);

    for (let index = 0; index < moves.length; index += 1) {
      const move = moves[index]!;
      assert.equal(move.order, index + 1);
      if (index < moves.length - 1) {
        assert.equal(move.successorMoveId, moves[index + 1]!.id);
      } else {
        assert.equal(move.successorMoveId, null);
      }
      if (index > 0) {
        assert.equal(move.status, "pending");
      }
    }
  });

  it("different Stories produce different Move sequences", () => {
    const outdoor = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    outdoor.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    outdoor.dispatch({ type: "ChangePriority", priorityIds: ["plot"] }, 3);

    const privacy = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    privacy.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    privacy.dispatch({ type: "ChangePriority", priorityIds: ["privacy"] }, 3);

    assert.notEqual(
      outdoor.getExperience()!.decisionStory.id,
      privacy.getExperience()!.decisionStory.id,
    );
    assert.notDeepEqual(
      outdoor.getExperience()!.decisionMoves,
      privacy.getExperience()!.decisionMoves,
    );
  });

  it("composeDecisionMoves accepts only Story (Story → Moves)", () => {
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

    const again = composeDecisionMoves(interpretation.decisionStory);
    assert.deepEqual(again, interpretation.decisionMoves);
    assert.deepEqual(
      runtime.getExperience()!.context.decision.moves,
      interpretation.decisionMoves,
    );
  });
});
