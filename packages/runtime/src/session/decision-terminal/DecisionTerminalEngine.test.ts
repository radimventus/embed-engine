import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import {
  createFixedClock,
  composeDecisionTerminal,
  createDecisionSessionRuntime,
  DECISION_TERMINAL_SCHEMA_VERSION,
  interpretDecisionSession,
} from "../testing";

describe("Decision Terminal Engine (CAP-DTR-001)", () => {
  it("identical Outcomes produce identical Terminals", () => {
    const a = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    const b = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });

    a.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    b.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    a.dispatch({ type: "ChangePriority", priorityIds: ["garden", "space"] }, 3);
    b.dispatch({ type: "ChangePriority", priorityIds: ["garden", "space"] }, 3);

    assert.deepEqual(
      a.getExperience()!.context.decision.terminal,
      b.getExperience()!.context.decision.terminal,
    );
    assert.deepEqual(
      a.getExperience()!.context.decision.terminal,
      b.getExperience()!.context.decision.terminal,
    );
  });

  it("Terminal wraps Outcome without enriching semantics", () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-kitchen" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["investment"] }, 3);

    const { outcome: decisionOutcome, terminal: decisionTerminal } =
      runtime.getExperience()!.context.decision;

    assert.equal(decisionTerminal.schemaVersion, DECISION_TERMINAL_SCHEMA_VERSION);
    assert.equal(decisionTerminal.id, `terminal:${decisionOutcome.id}`);
    assert.deepEqual(decisionTerminal.outcome, decisionOutcome);
    assert.equal(
      decisionTerminal.outcome.recommendation,
      decisionOutcome.recommendation,
    );
    assert.equal(decisionTerminal.outcome.confidence, decisionOutcome.confidence);
  });

  it("composeDecisionTerminal accepts only Outcome (Outcome → Terminal)", () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["space"] }, 3);

    const interpretation = interpretDecisionSession(
      runtime.getSession(),
      REFERENCE_HOUSE_PACKAGE,
    );

    const again = composeDecisionTerminal(interpretation.decisionOutcome);
    assert.deepEqual(again, interpretation.decisionTerminal);
    assert.deepEqual(
      runtime.getExperience()!.context.decision.terminal,
      interpretation.decisionTerminal,
    );
  });

  it("different Outcomes produce different Terminals", () => {
    const outdoor = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    outdoor.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    outdoor.dispatch({ type: "ChangePriority", priorityIds: ["plot"] }, 3);

    const privacy = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    privacy.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    privacy.dispatch({ type: "ChangePriority", priorityIds: ["privacy"] }, 3);

    assert.notDeepEqual(
      outdoor.getExperience()!.context.decision.outcome,
      privacy.getExperience()!.context.decision.outcome,
    );
    assert.notDeepEqual(
      outdoor.getExperience()!.context.decision.terminal,
      privacy.getExperience()!.context.decision.terminal,
    );
  });
});
