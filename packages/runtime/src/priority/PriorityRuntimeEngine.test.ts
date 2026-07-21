import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  Experience,
  FollowUpHandoff,
  HouseMappingSet,
  Interpretation,
  PrioritySelection,
} from "@embed-engine/core/priority";
import {
  applyPriorityEvent,
  createInitialPriorityRuntimeState,
  createPriorityRuntimeEngine,
  isPriorityJourneyComplete,
  resetPriorityRuntimeState,
} from "./index";

const SELECTION: PrioritySelection = {
  selectedPriorityIds: ["garden"],
  dominantPriorityId: "garden",
};

const CONFIRMATION_PAYLOAD = {
  title: "Zahrada",
  body: "Budeme číst dům optikou zahrady.",
  primaryAction: "Potvrdit",
  secondaryAction: "Upravit",
};

function minimalInterpretation(objectId: string): Interpretation {
  return {
    id: "interp-1",
    objectId,
    priorityIds: ["garden"],
    strengths: [],
    frictions: [],
    opportunities: [],
    tradeOffs: [],
    confidenceInputs: [],
    matchScore: 50,
    recommendedIntent: "verify_garden",
  };
}

function minimalExperience(): Experience {
  return {
    id: "exp-1",
    title: "Čtení zahrady",
    summary: "Hypotéza.",
    focus: ["zahrada"],
    recommendations: ["ověřit vztah interiér–exteriér"],
    evidence: [
      {
        id: "ev-1",
        title: "Přímý výstup",
        description: "Obývací pokoj navazuje na terasu.",
      },
    ],
    concerns: [],
    confidence: {
      level: "medium",
      score: 60,
      explanation: "Částečná evidence.",
    },
    actions: [
      {
        id: "act-1",
        label: "Podívat se na terasu",
        type: "primary",
        intent: "explore",
      },
    ],
  };
}

function minimalMapping(objectId: string): HouseMappingSet {
  return {
    object: { objectId },
    entries: [
      {
        claimRef: { claimId: "ev-1" },
        objectAnchor: { kind: "zone", id: "terrace" },
        why: "Ověření kontaktu se zahradou.",
      },
    ],
  };
}

const FOLLOW_UPS: readonly FollowUpHandoff[] = [
  { targetId: "tour", label: "Prohlídka" },
  { targetId: "terminal", label: "Shrnutí" },
];

function runValidPath(objectId = "house-modern-01") {
  let state = createInitialPriorityRuntimeState({ objectId });

  let result = applyPriorityEvent(state, {
    type: "priority.selection.changed",
    selection: SELECTION,
  });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("unreachable");
  assert.equal(result.state.stage, "Confirmation");
  assert.deepEqual(result.emitted, ["priority.context.invalidated"]);
  state = result.state;

  result = applyPriorityEvent(state, {
    type: "priority.confirmation.accepted",
    presentationPayload: CONFIRMATION_PAYLOAD,
  });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("unreachable");
  assert.equal(result.state.stage, "Transition");
  state = result.state;

  result = applyPriorityEvent(state, {
    type: "priority.transition.completed",
    transitionMessage: { text: "Teď čteme dům vaší optikou." },
  });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("unreachable");
  assert.equal(result.state.stage, "Interpretation");
  state = result.state;

  result = applyPriorityEvent(state, {
    type: "priority.interpretation.ready",
    interpretation: minimalInterpretation(objectId),
    experience: minimalExperience(),
  });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("unreachable");
  assert.equal(result.state.stage, "Interpretation");
  assert.ok(result.state.experience);
  state = result.state;

  result = applyPriorityEvent(state, {
    type: "priority.mapping.ready",
    houseMapping: minimalMapping(objectId),
    followUps: FOLLOW_UPS,
  });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("unreachable");
  assert.equal(result.state.stage, "HouseMapping");
  state = result.state;

  result = applyPriorityEvent(state, {
    type: "priority.followup.selected",
    targetId: "tour",
  });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("unreachable");
  assert.equal(result.state.stage, "FollowUp");
  assert.equal(result.state.completed, true);

  return result.state;
}

describe("PriorityRuntimeEngine", () => {
  it("accepts a valid Journey path Selection → … → FollowUp", () => {
    const state = runValidPath();
    assert.equal(isPriorityJourneyComplete(state), true);
    assert.equal(state.selection.dominantPriorityId, "garden");
    assert.equal(state.confirmation?.accepted, true);
    assert.equal(state.houseMapping?.entries.length, 1);
  });

  it("rejects invalid transition (interpretation before confirmation)", () => {
    const state = createInitialPriorityRuntimeState({ objectId: "obj-1" });
    const result = applyPriorityEvent(state, {
      type: "priority.interpretation.ready",
      interpretation: minimalInterpretation("obj-1"),
      experience: minimalExperience(),
    });

    assert.equal(result.ok, false);
    if (result.ok) throw new Error("unreachable");
    assert.equal(result.error.code, "INVALID_TRANSITION");
    assert.equal(result.state.stage, "Selection");
    assert.equal(result.state.experience, null);
  });

  it("rejects Follow-up shortcut from Transition", () => {
    let state = createInitialPriorityRuntimeState({ objectId: "obj-1" });

    let result = applyPriorityEvent(state, {
      type: "priority.selection.changed",
      selection: SELECTION,
    });
    assert.equal(result.ok, true);
    if (!result.ok) throw new Error("unreachable");
    state = result.state;

    result = applyPriorityEvent(state, {
      type: "priority.confirmation.accepted",
      presentationPayload: CONFIRMATION_PAYLOAD,
    });
    assert.equal(result.ok, true);
    if (!result.ok) throw new Error("unreachable");
    state = result.state;
    assert.equal(state.stage, "Transition");

    result = applyPriorityEvent(state, {
      type: "priority.followup.selected",
      targetId: "tour",
    });
    assert.equal(result.ok, false);
    if (result.ok) throw new Error("unreachable");
    assert.equal(result.error.code, "INVALID_TRANSITION");
    assert.equal(result.state.stage, "Transition");
  });

  it("resets Journey to Selection and clears outputs", () => {
    const completed = runValidPath("obj-reset");
    const reset = resetPriorityRuntimeState(completed);

    assert.equal(reset.stage, "Selection");
    assert.equal(reset.completed, false);
    assert.equal(reset.object.objectId, "obj-reset");
    assert.equal(reset.confirmation, null);
    assert.equal(reset.interpretation, null);
    assert.equal(reset.experience, null);
    assert.equal(reset.houseMapping, null);
    assert.deepEqual(reset.selection.selectedPriorityIds, []);
  });

  it("detects Journey completion via engine API", () => {
    const engine = createPriorityRuntimeEngine("obj-engine");
    assert.equal(engine.isComplete(), false);

    const final = runValidPath("obj-engine");
    // recreate path on engine instance
    const e2 = createPriorityRuntimeEngine("obj-engine");
    const steps = [
      {
        type: "priority.selection.changed" as const,
        selection: SELECTION,
      },
      {
        type: "priority.confirmation.accepted" as const,
        presentationPayload: CONFIRMATION_PAYLOAD,
      },
      {
        type: "priority.transition.completed" as const,
        transitionMessage: { text: "Bridge." },
      },
      {
        type: "priority.interpretation.ready" as const,
        interpretation: minimalInterpretation("obj-engine"),
        experience: minimalExperience(),
      },
      {
        type: "priority.mapping.ready" as const,
        houseMapping: minimalMapping("obj-engine"),
        followUps: FOLLOW_UPS,
      },
      {
        type: "priority.followup.selected" as const,
        targetId: "terminal",
      },
    ];

    for (const step of steps) {
      const result = e2.dispatch(step);
      assert.equal(result.ok, true, `failed at ${step.type}`);
    }

    assert.equal(e2.isComplete(), true);
    assert.equal(e2.getState().stage, "FollowUp");
    assert.equal(final.completed, true);

    e2.reset();
    assert.equal(e2.isComplete(), false);
    assert.equal(e2.getState().stage, "Selection");
  });

  it("invalidates derived outputs when selection changes mid-journey", () => {
    let state = createInitialPriorityRuntimeState({ objectId: "obj-1" });

    for (const event of [
      {
        type: "priority.selection.changed" as const,
        selection: SELECTION,
      },
      {
        type: "priority.confirmation.accepted" as const,
        presentationPayload: CONFIRMATION_PAYLOAD,
      },
      {
        type: "priority.transition.completed" as const,
      },
      {
        type: "priority.interpretation.ready" as const,
        interpretation: minimalInterpretation("obj-1"),
        experience: minimalExperience(),
      },
    ]) {
      const result = applyPriorityEvent(state, event);
      assert.equal(result.ok, true);
      if (!result.ok) throw new Error("unreachable");
      state = result.state;
    }

    assert.ok(state.experience);

    const result = applyPriorityEvent(state, {
      type: "priority.selection.changed",
      selection: {
        selectedPriorityIds: ["layout"],
        dominantPriorityId: "layout",
      },
    });

    assert.equal(result.ok, true);
    if (!result.ok) throw new Error("unreachable");
    assert.equal(result.state.stage, "Confirmation");
    assert.equal(result.state.experience, null);
    assert.equal(result.state.interpretation, null);
    assert.deepEqual(result.emitted, ["priority.context.invalidated"]);
  });
});
