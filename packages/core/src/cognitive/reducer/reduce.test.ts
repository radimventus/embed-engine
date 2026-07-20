import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createInitialDecisionState } from "../decision-state/createInitialDecisionState";
import { createSignal } from "../signals/createSignal";
import { SignalType } from "../signals/SignalType";
import type { Signal } from "../signals/Signal";
import { reduce } from "./reduce";
import * as reducerApi from "./index";

describe("reduce", () => {
  it("is deterministic for identical inputs", () => {
    const state = createInitialDecisionState("object-1");
    const signal = createSignal({
      type: SignalType.ROOM_VIEWED,
      id: "s-1",
      timestamp: 100,
      payload: { roomId: "room-living" },
    });

    const first = reduce(state, signal);
    const second = reduce(state, signal);

    assert.deepEqual(first, second);
  });

  it("never mutates the previous DecisionState", () => {
    const state = createInitialDecisionState("object-1");
    const before = structuredClone(state);
    const signal = createSignal({
      type: SignalType.MEDIA_OPENED,
      payload: { mediaId: "media-1" },
    });

    const next = reduce(state, signal);

    assert.deepEqual(state, before);
    assert.notEqual(next, state);
    assert.notEqual(next.focus, state.focus);
    assert.ok(Object.isFrozen(next));
    assert.ok(Object.isFrozen(next.focus));
  });

  it("returns unchanged state for unknown SignalType", () => {
    const state = createInitialDecisionState("object-1");
    const unknown = {
      ...createSignal({ type: SignalType.ROOM_VIEWED }),
      type: "UNKNOWN_SIGNAL",
    } as Signal;

    const next = reduce(state, unknown);

    assert.equal(next, state);
  });

  it("returns unchanged state when Focus id payload is missing", () => {
    const state = createInitialDecisionState("object-1");
    const signal = createSignal({ type: SignalType.ROOM_VIEWED, payload: {} });

    assert.equal(reduce(state, signal), state);
  });

  it("updates Focus.roomId for ROOM_VIEWED", () => {
    const state = createInitialDecisionState("object-1");
    const next = reduce(
      state,
      createSignal({
        type: SignalType.ROOM_VIEWED,
        payload: { roomId: "room-living" },
      }),
    );

    assert.equal(next.focus.roomId, "room-living");
    assert.equal(next.focus.mediaId, undefined);
    assert.equal(next.focus.floorId, undefined);
    assert.equal(next.focus.questionId, undefined);
  });

  it("updates Focus.mediaId for MEDIA_OPENED", () => {
    const seeded = reduce(
      createInitialDecisionState("object-1"),
      createSignal({
        type: SignalType.ROOM_VIEWED,
        payload: { roomId: "room-living" },
      }),
    );

    const next = reduce(
      seeded,
      createSignal({
        type: SignalType.MEDIA_OPENED,
        payload: { mediaId: "media-exterior" },
      }),
    );

    assert.equal(next.focus.mediaId, "media-exterior");
    assert.equal(next.focus.roomId, "room-living");
  });

  it("updates Focus.floorId for FLOOR_CHANGED", () => {
    const seeded = reduce(
      createInitialDecisionState("object-1"),
      createSignal({
        type: SignalType.ROOM_VIEWED,
        payload: { roomId: "room-living" },
      }),
    );

    const next = reduce(
      seeded,
      createSignal({
        type: SignalType.FLOOR_CHANGED,
        payload: { floorId: "floor-1" },
      }),
    );

    assert.equal(next.focus.floorId, "floor-1");
    assert.equal(next.focus.roomId, "room-living");
  });

  it("updates Focus.questionId for QUESTION_OPENED", () => {
    const seeded = reduce(
      createInitialDecisionState("object-1"),
      createSignal({
        type: SignalType.MEDIA_OPENED,
        payload: { mediaId: "media-1" },
      }),
    );

    const next = reduce(
      seeded,
      createSignal({
        type: SignalType.QUESTION_OPENED,
        payload: { questionId: "q-1" },
      }),
    );

    assert.equal(next.focus.questionId, "q-1");
    assert.equal(next.focus.mediaId, "media-1");
  });

  it("stores household.profile fact from QUESTION_OPENED payload", () => {
    const next = reduce(
      createInitialDecisionState("object-1"),
      createSignal({
        type: SignalType.QUESTION_OPENED,
        payload: {
          questionId: "layout.ask-household-shape",
          householdProfile: "family",
        },
      }),
    );

    assert.equal(next.focus.questionId, "layout.ask-household-shape");
    assert.equal(next.facts.length, 1);
    assert.equal(next.facts[0]?.key, "household.profile");
    assert.equal(next.facts[0]?.value, "family");
  });

  it("appends Signal into DecisionState.signals on successful reduce", () => {
    const state = createInitialDecisionState("object-1");
    const signal = createSignal({
      type: SignalType.ROOM_VIEWED,
      id: "signal-room-1",
      payload: { roomId: "room-living", label: "Living room" },
    });

    const next = reduce(state, signal);

    assert.equal(next.signals.length, 1);
    assert.equal(next.signals[0]?.id, "signal-room-1");
    assert.equal(state.signals.length, 0);
  });

  it("keeps a stable reducer module API", () => {
    assert.equal(typeof reducerApi.reduce, "function");
    assert.equal(reducerApi.reduce, reduce);
  });
});
