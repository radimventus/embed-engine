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
  });

  it("boosts layout when Focus.roomId is set", () => {
    const state = reduce(
      createInitialDecisionState("object-1"),
      createSignal({
        type: SignalType.ROOM_VIEWED,
        payload: { roomId: "room-living" },
      }),
    );

    const layout = project(state).priorities.find((item) => item.id === "layout");
    assert.equal(layout?.weight, 0.92);
  });

  it("boosts the selected question priority to 1", () => {
    const state = reduce(
      createInitialDecisionState("object-1"),
      createSignal({
        type: SignalType.QUESTION_OPENED,
        payload: { questionId: "energy" },
      }),
    );

    const energy = project(state).priorities.find((item) => item.id === "energy");
    assert.equal(energy?.weight, 1);
    assert.equal(project(state).priorities.length, INTERPRETATION_PRIORITY_IDS.length);
  });
});
