import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  emptyDecisionMemory,
  mergeDecisionMemory,
} from "./DecisionMemory";

describe("DecisionMemory merge (PT-007 stub / future 007B)", () => {
  it("mergeDecisionMemory only appends new keys", () => {
    const base = mergeDecisionMemory(emptyDecisionMemory(), {
      facts: [{ key: "familySize", value: 4 }],
    });
    const merged = mergeDecisionMemory(base, {
      facts: [{ key: "familySize", value: 5 }],
      preferences: [{ key: "style", value: "modern" }],
    });
    assert.deepEqual(merged.facts, [{ key: "familySize", value: 4 }]);
    assert.deepEqual(merged.preferences, [{ key: "style", value: "modern" }]);
  });
});
