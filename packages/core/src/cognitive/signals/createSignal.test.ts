import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSignal } from "./createSignal";
import { SignalType } from "./SignalType";
import * as signalsApi from "./index";

describe("createSignal", () => {
  it("creates a signal with default payload, metadata, id, and timestamp", () => {
    const before = Date.now();
    const signal = createSignal({ type: SignalType.FLOOR_CHANGED });
    const after = Date.now();

    assert.equal(signal.type, SignalType.FLOOR_CHANGED);
    assert.deepEqual(signal.payload, {});
    assert.deepEqual(signal.metadata, {});
    assert.ok(signal.id.startsWith("signal-"));
    assert.ok(signal.timestamp >= before);
    assert.ok(signal.timestamp <= after);
  });

  it("respects explicit factory inputs", () => {
    const signal = createSignal({
      type: SignalType.QUESTION_OPENED,
      id: "signal-fixed",
      timestamp: 1_700_000_000_000,
      payload: { questionId: "q-1" },
      metadata: { source: "test" },
    });

    assert.deepEqual(signal, {
      id: "signal-fixed",
      type: SignalType.QUESTION_OPENED,
      timestamp: 1_700_000_000_000,
      payload: { questionId: "q-1" },
      metadata: { source: "test" },
    });
  });

  it("returns an immutable signal", () => {
    const signal = createSignal({
      type: SignalType.ROOM_VIEWED,
      payload: { roomId: "living" },
      metadata: { source: "navigator" },
    });

    assert.ok(Object.isFrozen(signal));
    assert.ok(Object.isFrozen(signal.payload));
    assert.ok(Object.isFrozen(signal.metadata));

    assert.throws(() => {
      (signal as { id: string }).id = "mutated";
    }, TypeError);
  });

  it("keeps a stable signals module API", () => {
    assert.equal(typeof signalsApi.createSignal, "function");
    assert.equal(signalsApi.createSignal, createSignal);
    assert.equal(signalsApi.SignalType.ROOM_VIEWED, "ROOM_VIEWED");
  });
});
