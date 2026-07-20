import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Signal } from "./Signal";
import { SignalType } from "./SignalType";
import { createSignal } from "./createSignal";

describe("Signal", () => {
  it("exposes a stable data-only shape", () => {
    const signal: Signal = createSignal({ type: SignalType.ROOM_VIEWED });

    assert.equal(typeof signal.id, "string");
    assert.equal(typeof signal.type, "string");
    assert.equal(typeof signal.timestamp, "number");
    assert.equal(typeof signal.payload, "object");
    assert.equal(typeof signal.metadata, "object");
  });

  it("contains no methods on the signal object", () => {
    const signal = createSignal({ type: SignalType.MEDIA_OPENED });

    for (const value of Object.values(signal)) {
      assert.notEqual(typeof value, "function");
    }
  });

  it("uses the MVP SignalType vocabulary", () => {
    assert.deepEqual(Object.values(SignalType).sort(), [
      "FLOOR_CHANGED",
      "MEDIA_OPENED",
      "QUESTION_OPENED",
      "ROOM_VIEWED",
    ]);
  });
});
