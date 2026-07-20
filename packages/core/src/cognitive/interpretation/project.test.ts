import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createInitialDecisionState } from "../decision-state/createInitialDecisionState";
import { createSignal } from "../signals/createSignal";
import { SignalType } from "../signals/SignalType";
import { reduce } from "../reducer/reduce";
import { INTERPRETATION_PRIORITY_IDS, project } from "./project";

describe("project", () => {
  it("is deterministic and does not mutate DecisionState", () => {
    const state = createInitialDecisionState("object-1");
    const before = structuredClone(state);

    const first = project(state);
    const second = project(state);

    assert.deepEqual(first, second);
    assert.deepEqual(state, before);
    assert.ok(Object.isFrozen(first));
    assert.ok(Object.isFrozen(first.priorities));
    assert.ok(Object.isFrozen(first.events));
    assert.ok(Object.isFrozen(first.recommendedQuestions));
  });

  it("projects shared FAQ + AI fields from one DecisionState", () => {
    const state = reduce(
      createInitialDecisionState("object-1"),
      createSignal({
        type: SignalType.ROOM_VIEWED,
        payload: { roomId: "room-living", label: "Living room opened" },
      }),
    );

    const interpretation = project(state);
    const layout = interpretation.priorities.find((item) => item.id === "layout");

    assert.equal(layout?.weight, 0.92);
    assert.equal(layout?.rank, 1);
    assert.equal(interpretation.activeTopic, "Layout");
    assert.ok(interpretation.conversationContext.includes("Layout"));
    assert.ok(interpretation.recommendedQuestions.length > 0);
    assert.equal(interpretation.recommendedQuestions[0]?.highlighted, true);
    assert.ok(interpretation.nextAction.includes("Layout"));
    assert.equal(interpretation.priorities.length, INTERPRETATION_PRIORITY_IDS.length);
  });

  it("projects a timeline from DecisionState.signals", () => {
    const state = reduce(
      createInitialDecisionState("object-1"),
      createSignal({
        type: SignalType.FLOOR_CHANGED,
        id: "evt-1",
        timestamp: 10,
        payload: { floorId: "floor-1", label: "Floor selected" },
      }),
    );

    const interpretation = project(state);
    assert.equal(interpretation.events.length, 1);
    assert.equal(interpretation.events[0]?.label, "Floor selected");
    assert.equal(interpretation.activeTopic, "Plot");
  });
});
