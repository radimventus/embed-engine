import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { emptyAnalysisResult } from "../../analyzer/models/AnalysisResult";
import { emptyDecisionMemory } from "./DecisionMemory";
import { createDecisionMemoryService } from "../../memory/DecisionMemoryService";

describe("DecisionMemory model + Service write path (PT-009)", () => {
  it("writes only through DecisionMemoryService", () => {
    const service = createDecisionMemoryService({
      initial: emptyDecisionMemory(),
    });

    service.update({
      analysis: {
        ...emptyAnalysisResult(1),
        facts: [{ key: "familySize", value: 4 }],
      },
    });

    assert.deepEqual(service.getMemory().facts, [
      { key: "familySize", value: 4 },
    ]);
  });
});
