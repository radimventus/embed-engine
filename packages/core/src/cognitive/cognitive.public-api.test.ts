import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createInitialDecisionState,
  type DecisionState,
} from "@embed-engine/core/cognitive";

describe("cognitive public API", () => {
  it("exports DecisionState typing and createInitialDecisionState", () => {
    const state: DecisionState = createInitialDecisionState("public-api");

    assert.equal(typeof createInitialDecisionState, "function");
    assert.equal(state.objectId, "public-api");
  });
});
