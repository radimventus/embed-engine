import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Focus } from "./Focus";
import { createInitialFocus } from "./createInitialFocus";

describe("Focus", () => {
  it("exposes a data-only shape with optional attention ids", () => {
    const empty: Focus = createInitialFocus();
    const populated: Focus = Object.freeze({
      roomId: "room-living",
      mediaId: "media-exterior",
      floorId: "floor-0",
      questionId: "q-1",
    });

    assert.equal(typeof empty, "object");
    assert.equal(populated.roomId, "room-living");
    assert.equal(populated.mediaId, "media-exterior");
    assert.equal(populated.floorId, "floor-0");
    assert.equal(populated.questionId, "q-1");
  });

  it("contains no methods", () => {
    const focus = createInitialFocus();

    for (const value of Object.values(focus)) {
      assert.notEqual(typeof value, "function");
    }
  });
});
