import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import {
  AI_CONTEXT_SCHEMA_VERSION,
  composeAIContext,
  createDecisionSessionRuntime,
  interpretDecisionSession,
} from "../testing";

describe("AI Context Reader (CAP-AI-001)", () => {
  it("identical Terminals produce identical AI Contexts", () => {
    const a = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    const b = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });

    a.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    b.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    a.dispatch({ type: "ChangePriority", priorityIds: ["garden", "space"] }, 3);
    b.dispatch({ type: "ChangePriority", priorityIds: ["garden", "space"] }, 3);

    assert.deepEqual(a.getExperience()!.context.decision.ai, b.getExperience()!.context.decision.ai);
    assert.deepEqual(
      a.getExperience()!.context.decision.ai,
      b.getExperience()!.context.decision.ai,
    );
  });

  it("AIContext projects Terminal only — no new semantics", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-kitchen" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["investment"] }, 3);

    const { terminal: decisionTerminal, ai: aiContext } =
      runtime.getExperience()!.context.decision;

    assert.equal(aiContext.schemaVersion, AI_CONTEXT_SCHEMA_VERSION);
    assert.equal(aiContext.id, `ai-context:${decisionTerminal.id}`);
    assert.deepEqual(aiContext.terminal, decisionTerminal);
    assert.deepEqual(aiContext.outcome, decisionTerminal.outcome);
    assert.equal(aiContext.outcome, decisionTerminal.outcome);
  });

  it("composeAIContext accepts only Terminal (Terminal → AIContext)", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["space"] }, 3);

    const interpretation = interpretDecisionSession(
      runtime.getSession(),
      REFERENCE_HOUSE_PACKAGE,
    );

    const again = composeAIContext(interpretation.decisionTerminal);
    assert.deepEqual(again, interpretation.aiContext);
    assert.deepEqual(
      runtime.getExperience()!.context.decision.ai,
      interpretation.aiContext,
    );
  });

  it("AIContext contains no prompt or natural-language fields", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);

    const keys = Object.keys(runtime.getExperience()!.context.decision.ai).sort();
    assert.deepEqual(keys, ["id", "outcome", "schemaVersion", "terminal"]);
  });
});
