import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import {
  createDecisionSessionRuntime,
  projectFromInterpretation,
  interpretDecisionSession,
} from "../index";

describe("Experience Context projection (CAP-HP-003.5)", () => {
  it("identical Runtime state produces identical Experience Context", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-kitchen" }, 2);
    const experience = runtime.getExperience()!;

    const again = interpretDecisionSession(
      runtime.getSession(),
      REFERENCE_HOUSE_PACKAGE,
    );
    const twin = projectFromInterpretation(again, REFERENCE_HOUSE_PACKAGE);
    assert.ok(twin.ok);
    if (!twin.ok) {
      return;
    }

    assert.deepEqual(experience.context, twin.experience.context);
    assert.deepEqual(experience.context, experience.context);
  });

  it("room change updates Experience Context", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });

    runtime.dispatch({ type: "SelectRoom", roomId: "room-bedroom" }, 2);
    const bedroom = runtime.getExperience()!.context;
    assert.equal(bedroom.activeRoom.id, "room-bedroom");
    assert.equal(bedroom.navigation.currentFloor, "1");
    assert.equal(bedroom.object.reference, "ASTAV-M01");
    assert.equal(bedroom.decision.primaryReason, "private-rest-zone");

    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 3);
    const living = runtime.getExperience()!.context;
    assert.equal(living.activeRoom.id, "room-living");
    assert.equal(living.navigation.currentFloor, "0");
    assert.equal(living.decision.primaryReason, "primary-living-volume");
    assert.notEqual(bedroom.activeRoom.id, living.activeRoom.id);
  });

  it("fallback context remains deterministic when no room is selected", () => {
    const a = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    const b = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });

    assert.deepEqual(a.getExperience()!.context, b.getExperience()!.context);
    assert.equal(a.getExperience()!.context.activeRoom.id, null);
    assert.equal(a.getExperience()!.context.activeRoom.focusRoom?.id, "room-living");
    assert.equal(a.getExperience()!.context.navigation.currentFloor, "0");
    assert.equal(a.getExperience()!.context.navigation.canSelectRoom, true);
    assert.ok(a.getExperience()!.context.decision.primaryReason.length > 0);
  });
});
