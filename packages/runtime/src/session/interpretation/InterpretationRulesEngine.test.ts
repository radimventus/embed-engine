import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import {
  createDecisionSessionRuntime,
  createInterpretationRuleset,
  DEFAULT_HOUSE_INTERPRETATION_RULES,
  interpretDecisionSession,
  projectFromInterpretation,
} from "../testing";

describe("Interpretation Rules Engine (CAP-HP-003.5)", () => {
  it("identical inputs produce identical interpretation", () => {
    const selected = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    selected.dispatch({ type: "SelectRoom", roomId: "room-kitchen" }, 2);

    const a = interpretDecisionSession(
      selected.getSession(),
      REFERENCE_HOUSE_PACKAGE,
    );
    const b = interpretDecisionSession(
      selected.getSession(),
      REFERENCE_HOUSE_PACKAGE,
    );

    assert.deepEqual(a, b);
    assert.equal(a.primaryReason, "daily-workflow-core");
    assert.equal(a.focusRoom?.id, "room-kitchen");
    assert.ok(a.highlights.includes("workflow-efficiency"));
    assert.equal(a.recommendedMedia[0]?.role, "hero");
  });

  it("higher rule priority overrides conflicting semantic outputs", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-living" }, 2);
    const session = runtime.getSession();

    const baseline = interpretDecisionSession(
      session,
      REFERENCE_HOUSE_PACKAGE,
      { rules: DEFAULT_HOUSE_INTERPRETATION_RULES },
    );
    assert.equal(baseline.primaryReason, "primary-living-volume");
    assert.equal(baseline.recommendedMedia[0]?.role, "video");

    const overrideRules = createInterpretationRuleset({
      id: "house-session-override",
      version: 1,
      rules: [
        ...DEFAULT_HOUSE_INTERPRETATION_RULES.rules,
        {
          id: "hero-emphasis.override",
          kind: "hero-emphasis",
          priority: 200,
          enabled: true,
          version: 1,
          config: {
            defaultReason: "explore-house-structure",
            reasonsByRoomId: {
              "room-living": "override-living-emphasis",
            },
          },
        },
        {
          id: "media-prioritization.override",
          kind: "media-prioritization",
          priority: 200,
          enabled: true,
          version: 1,
          config: {
            roleOrder: ["document", "hero", "gallery", "video", "thumbnail"],
          },
        },
      ],
    });

    const overridden = interpretDecisionSession(
      session,
      REFERENCE_HOUSE_PACKAGE,
      { rules: overrideRules },
    );

    assert.equal(overridden.primaryReason, "override-living-emphasis");
    assert.equal(overridden.recommendedMedia[0]?.role, "document");
    assert.ok(overridden.appliedRuleIds.includes("hero-emphasis.override"));
    assert.notEqual(overridden.summary, baseline.summary);
  });

  it("projection changes when interpretation rules change", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-bedroom" }, 2);
    const session = runtime.getSession();

    const defaultInterpretation = interpretDecisionSession(
      session,
      REFERENCE_HOUSE_PACKAGE,
    );
    const defaultProjection = projectFromInterpretation(
      defaultInterpretation,
      REFERENCE_HOUSE_PACKAGE,
    );
    assert.ok(defaultProjection.ok);
    if (!defaultProjection.ok) {
      return;
    }

    const altRules = createInterpretationRuleset({
      id: "alt-importance",
      version: 2,
      rules: [
        {
          id: "room-importance.bath-first",
          kind: "room-importance",
          priority: 100,
          enabled: true,
          version: 1,
          config: {
            order: ["room-bath", "room-bedroom", "room-living"],
          },
        },
        {
          id: "hero-emphasis.alt",
          kind: "hero-emphasis",
          priority: 100,
          enabled: true,
          version: 1,
          config: {
            defaultReason: "alt-default",
            reasonsByRoomId: {
              "room-bedroom": "alt-bedroom-reason",
            },
          },
        },
        {
          id: "media-prioritization.alt",
          kind: "media-prioritization",
          priority: 100,
          enabled: true,
          version: 1,
          config: {
            roleOrder: ["thumbnail", "hero", "gallery", "video", "document"],
          },
        },
        {
          id: "contextual-messaging.alt",
          kind: "contextual-messaging",
          priority: 100,
          enabled: true,
          version: 1,
          config: {
            defaultMessages: ["alt-inspect"],
            messagesByRoomId: {
              "room-bedroom": ["alt-privacy"],
            },
          },
        },
        {
          id: "recommendation-ordering.alt",
          kind: "recommendation-ordering",
          priority: 100,
          enabled: true,
          version: 1,
          config: {
            highlightOrder: ["alt-privacy", "alt-inspect"],
          },
        },
      ],
    });

    const altInterpretation = interpretDecisionSession(
      session,
      REFERENCE_HOUSE_PACKAGE,
      { rules: altRules },
    );
    const altProjection = projectFromInterpretation(
      altInterpretation,
      REFERENCE_HOUSE_PACKAGE,
    );
    assert.ok(altProjection.ok);
    if (!altProjection.ok) {
      return;
    }

    assert.equal(defaultProjection.experience.context.decision.primaryReason, "private-rest-zone");
    assert.equal(altProjection.experience.context.decision.primaryReason, "alt-bedroom-reason");
    assert.deepEqual(altProjection.experience.context.decision.highlights, ["alt-privacy"]);
    assert.equal(altProjection.experience.context.decision.recommendedMedia[0]?.role, "thumbnail");
    assert.equal(altProjection.experience.context.decision.rulesetId, "alt-importance");
    assert.notDeepEqual(
      defaultProjection.experience.context.decision.primaryReason,
      altProjection.experience.context.decision.primaryReason,
    );
  });

  it("projection is unchanged when interpretation is unchanged", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
      rules: DEFAULT_HOUSE_INTERPRETATION_RULES,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-bath" }, 2);

    const first = runtime.getExperience();
    const interpretation = interpretDecisionSession(
      runtime.getSession(),
      REFERENCE_HOUSE_PACKAGE,
      { rules: DEFAULT_HOUSE_INTERPRETATION_RULES },
    );
    const second = projectFromInterpretation(
      interpretation,
      REFERENCE_HOUSE_PACKAGE,
    );
    assert.ok(second.ok);
    if (!second.ok || first === null) {
      return;
    }

    assert.deepEqual(
      first.context.activeRoom.focusRoom,
      second.experience.context.activeRoom.focusRoom,
    );
    assert.equal(
      first.context.decision.primaryReason,
      second.experience.context.decision.primaryReason,
    );
    assert.deepEqual(
      first.context.decision.highlights,
      second.experience.context.decision.highlights,
    );
    assert.deepEqual(
      first.context.decision.recommendedMedia,
      second.experience.context.decision.recommendedMedia,
    );
    assert.deepEqual(
      first.context.decision.appliedRuleIds,
      second.experience.context.decision.appliedRuleIds,
    );
  });

  it("without active room, focusRoom comes from room-importance rules", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    const experience = runtime.getExperience();
    assert.ok(experience !== null);
    assert.equal(experience?.context.activeRoom.id, null);
    assert.equal(experience?.context.activeRoom.focusRoom?.id, "room-living");
    assert.equal(experience?.context.decision.primaryReason, "primary-living-volume");
    assert.equal(experience?.context.navigation.roomImportanceRank[0], "room-living");
  });
});
