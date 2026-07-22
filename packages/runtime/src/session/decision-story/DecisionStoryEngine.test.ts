import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import {
  composeDecisionStory,
  createDecisionSessionRuntime,
  DECISION_STORY_SCHEMA_VERSION,
  interpretDecisionSession,
} from "../index";

describe("Decision Story Engine (CAP-DST-001)", () => {
  it("identical Interpretation inputs produce identical Decision Stories", () => {
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

    const storyA = a.getExperience()!.decisionStory;
    const storyB = b.getExperience()!.decisionStory;

    assert.deepEqual(storyA, storyB);
    assert.deepEqual(
      a.getExperience()!.context.decision.story,
      b.getExperience()!.context.decision.story,
    );
    assert.equal(storyA.schemaVersion, DECISION_STORY_SCHEMA_VERSION);
  });

  it("different priorities produce different Decision Stories", () => {
    const outdoor = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    outdoor.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    outdoor.dispatch({ type: "ChangePriority", priorityIds: ["plot"] }, 3);

    const privacy = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    privacy.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    privacy.dispatch({ type: "ChangePriority", priorityIds: ["privacy"] }, 3);

    const outdoorStory = outdoor.getExperience()!.decisionStory;
    const privacyStory = privacy.getExperience()!.decisionStory;

    assert.notEqual(outdoorStory.id, privacyStory.id);
    assert.notDeepEqual(outdoorStory, privacyStory);
    assert.equal(outdoorStory.nextDecisionStep, "inspect-outdoor-connection");
    assert.equal(privacyStory.nextDecisionStep, "inspect-privacy-zones");
    assert.ok(
      outdoorStory.semanticTransitions.includes("focus-signal:emphasize-outdoor"),
    );
    assert.ok(
      privacyStory.semanticTransitions.includes("focus-signal:emphasize-privacy"),
    );
  });

  it("Story exposes PT-004 narrative fields in chapter order", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-kitchen" }, 2);
    runtime.dispatch(
      { type: "ChangePriority", priorityIds: ["investment", "layout"] },
      3,
    );

    const story = runtime.getExperience()!.decisionStory;

    assert.equal(story.primaryExplanation, story.chapters[0]?.key);
    assert.equal(story.chapters[0]?.kind, "primary-explanation");
    assert.equal(story.nextDecisionStep, "inspect-value-drivers");
    assert.equal(
      story.chapters[story.chapters.length - 1]?.kind,
      "next-decision-step",
    );
    assert.ok(story.supportingArguments.length > 0);
    assert.ok(story.recommendationSequence.includes("inspect-value-drivers"));
    assert.equal(story.provenance.focusPriorityId, "investment");
    assert.equal(story.confidence, Number(story.confidence.toFixed(2)));
  });

  it("Experience Context exposes Story; Interpretation attaches Story", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["space"] }, 3);

    const experience = runtime.getExperience()!;
    const interpretation = interpretDecisionSession(
      runtime.getSession(),
      REFERENCE_HOUSE_PACKAGE,
    );

    assert.deepEqual(experience.decisionStory, interpretation.decisionStory);
    assert.deepEqual(
      experience.context.decision.story,
      interpretation.decisionStory,
    );
    assert.equal(
      experience.context.decision.story.nextDecisionStep,
      "inspect-spatial-volume",
    );
  });

  it("composeDecisionStory is a pure deterministic function", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["garden"] }, 3);

    const interpretation = interpretDecisionSession(
      runtime.getSession(),
      REFERENCE_HOUSE_PACKAGE,
    );

    const again = composeDecisionStory({
      objectId: interpretation.objectId,
      prioritySignals: interpretation.prioritySignals,
      semantics: {
        focusRoom: interpretation.focusRoom,
        primaryReason: interpretation.primaryReason,
        highlights: interpretation.highlights,
        recommendedMedia: interpretation.recommendedMedia,
        roomImportanceRank: interpretation.roomImportanceRank,
        appliedRuleIds: interpretation.appliedRuleIds,
      },
      decisionFocus: interpretation.decisionFocus,
      highlights: interpretation.highlights,
      recommendedMedia: interpretation.recommendedMedia,
      rulesetId: interpretation.rulesetId,
      rulesetVersion: interpretation.rulesetVersion,
    });

    assert.deepEqual(again, interpretation.decisionStory);
  });
});
