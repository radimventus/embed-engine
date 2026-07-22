import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import { createDecisionSessionRuntime } from "../testing";

describe("Decision Focus Engine (CAP-PRI-002)", () => {
  it("identical priorities produce identical Decision Focus", () => {
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
      a.getExperience()!.context.decision.focus,
      b.getExperience()!.context.decision.focus,
    );
    assert.deepEqual(
      a.getExperience()!.context.decision.focus,
      b.getExperience()!.context.decision.focus,
    );
  });

  it("different priorities produce different Decision Focus", () => {
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

    const outdoorFocus = outdoor.getExperience()!.context.decision.focus;
    const privacyFocus = privacy.getExperience()!.context.decision.focus;

    assert.equal(outdoorFocus.focusSignalKind, "emphasize-outdoor");
    assert.equal(privacyFocus.focusSignalKind, "emphasize-privacy");
    assert.equal(outdoorFocus.recommendedAction, "inspect-outdoor-connection");
    assert.equal(privacyFocus.recommendedAction, "inspect-privacy-zones");
    assert.equal(outdoorFocus.recommendedMediaRole, "gallery");
    assert.equal(privacyFocus.recommendedMediaRole, "hero");
    assert.notEqual(outdoorFocus.focusReason, privacyFocus.focusReason);
    assert.notDeepEqual(outdoorFocus, privacyFocus);
  });

  it("confidence is deterministic and bounded", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-kitchen" }, 2);
    runtime.dispatch(
      { type: "ChangePriority", priorityIds: ["investment", "layout"] },
      3,
    );

    const focus = runtime.getExperience()!.context.decision.focus;
    assert.equal(focus.confidence, Number(focus.confidence.toFixed(2)));
    assert.ok(focus.confidence >= 0 && focus.confidence <= 1);
    assert.equal(focus.focusRoomId, "room-kitchen");
    assert.equal(focus.focusPriorityId, "investment");

    const again = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    again.dispatch({ type: "SelectRoom", roomId: "room-kitchen" }, 2);
    again.dispatch(
      { type: "ChangePriority", priorityIds: ["investment", "layout"] },
      3,
    );
    assert.equal(again.getExperience()!.context.decision.focus.confidence, focus.confidence);
  });

  it("Experience Context exposes focus and orders recommendations", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["space"] }, 3);

    const experience = runtime.getExperience()!;
    const focus = experience.context.decision.focus;

    assert.equal(focus.focusSignalKind, "emphasize-space");
    assert.equal(focus.recommendedMediaRole, "video");
    assert.equal(experience.context.decision.recommendedMedia[0]?.role, "video");
    assert.equal(experience.context.decision.highlights[0], "spatial-generosity");
    assert.equal(experience.context.decision.focus.recommendedAction, "inspect-spatial-volume");
  });
});
