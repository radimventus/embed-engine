import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createInitialFocus } from "./createInitialFocus";
import * as focusApi from "./index";

describe("createInitialFocus", () => {
  it("creates an empty focus", () => {
    assert.deepEqual(createInitialFocus(), {});
  });

  it("returns an immutable focus", () => {
    const focus = createInitialFocus();

    assert.ok(Object.isFrozen(focus));
    assert.throws(() => {
      (focus as { roomId?: string }).roomId = "mutated";
    }, TypeError);
  });

  it("does not share instances across factory calls", () => {
    assert.notEqual(createInitialFocus(), createInitialFocus());
  });

  it("keeps a stable focus module API", () => {
    assert.equal(typeof focusApi.createInitialFocus, "function");
    assert.equal(focusApi.createInitialFocus, createInitialFocus);
  });
});
