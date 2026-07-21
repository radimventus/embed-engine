import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  composeExperience,
  createExperienceComposer,
  type ExperienceComposeInput,
} from "./composeExperience";

const OBJECT = Object.freeze({ id: "house-modern-01" });

function inputWith(
  selected: ExperienceComposeInput["priorities"]["selected"],
): ExperienceComposeInput {
  return {
    object: OBJECT,
    priorities: Object.freeze({ selected: Object.freeze([...selected]) }),
  };
}

describe("composeExperience", () => {
  it("returns a valid Experience", () => {
    const experience = composeExperience(inputWith([]));

    assert.equal(typeof experience.id, "string");
    assert.ok(experience.id.length > 0);
    assert.equal(typeof experience.title, "string");
    assert.equal(typeof experience.summary, "string");
    assert.ok(Array.isArray(experience.focus));
    assert.ok(experience.focus.length > 0);
    assert.ok(Array.isArray(experience.recommendations));
    assert.ok(Array.isArray(experience.evidence));
    assert.ok(experience.evidence.length >= 2);
    assert.ok(Array.isArray(experience.concerns));
    assert.ok(experience.concerns.length >= 1);
  });

  it("is deterministic for the same input", () => {
    const input = inputWith(["layout"]);
    assert.deepEqual(composeExperience(input), composeExperience(input));
  });

  it("createExperienceComposer returns the same shape", () => {
    const composer = createExperienceComposer();
    const input = inputWith([]);
    assert.deepEqual(composer(input), composeExperience(input));
  });

  it("keeps object identity in Experience id without changing Object", () => {
    const experience = composeExperience(inputWith(["design"]));
    assert.match(experience.id, /^experience\.house-modern-01\./);
  });
});

describe("first interpretation", () => {
  it("produces different Experiences for different PrioritySelections", () => {
    const family = composeExperience(inputWith(["layout"]));
    const investment = composeExperience(inputWith(["investment"]));
    const design = composeExperience(inputWith(["design"]));
    const sustainability = composeExperience(inputWith(["energy"]));

    assert.notEqual(family.title, investment.title);
    assert.notEqual(family.summary, design.summary);
    assert.notDeepEqual(family.focus, sustainability.focus);
    assert.notDeepEqual(investment.recommendations, design.recommendations);
    assert.notDeepEqual(family.evidence, investment.evidence);
    assert.notDeepEqual(family.concerns, investment.concerns);

    assert.equal(family.title, "Family living interpretation");
    assert.equal(investment.title, "Investment interpretation");
    assert.equal(design.title, "Design interpretation");
    assert.equal(sustainability.title, "Sustainability interpretation");
  });

  it("resolves mapped priority by deterministic precedence", () => {
    const experience = composeExperience(
      inputWith(["energy", "layout", "design"]),
    );
    assert.equal(experience.title, "Family living interpretation");
  });
});

describe("experience evidence", () => {
  it("produces different Evidence for different PrioritySelections", () => {
    const family = composeExperience(inputWith(["layout"]));
    const investment = composeExperience(inputWith(["investment"]));
    const design = composeExperience(inputWith(["design"]));
    const sustainability = composeExperience(inputWith(["energy"]));

    for (const experience of [family, investment, design, sustainability]) {
      assert.ok(experience.evidence.length >= 2);
      assert.ok(experience.evidence.length <= 4);
      for (const item of experience.evidence) {
        assert.equal(typeof item.id, "string");
        assert.equal(typeof item.title, "string");
        assert.equal(typeof item.description, "string");
      }
    }

    assert.equal(family.evidence[0]?.title, "Four bedrooms");
    assert.equal(investment.evidence[0]?.title, "Low operating costs");
    assert.equal(design.evidence[0]?.title, "Premium materials");
    assert.equal(sustainability.evidence[0]?.title, "Energy-efficient envelope");
    assert.notDeepEqual(family.evidence, design.evidence);
  });
});

describe("experience concerns", () => {
  it("produces different Concerns for different PrioritySelections", () => {
    const family = composeExperience(inputWith(["layout"]));
    const investment = composeExperience(inputWith(["investment"]));
    const design = composeExperience(inputWith(["design"]));
    const sustainability = composeExperience(inputWith(["energy"]));

    for (const experience of [family, investment, design, sustainability]) {
      assert.ok(experience.concerns.length >= 1);
      assert.ok(experience.concerns.length <= 3);
      for (const item of experience.concerns) {
        assert.equal(typeof item.id, "string");
        assert.equal(typeof item.title, "string");
        assert.equal(typeof item.description, "string");
        assert.ok(["low", "medium", "high"].includes(item.severity));
      }
    }

    assert.equal(family.concerns[0]?.title, "Children's room on upper floor");
    assert.equal(investment.concerns[0]?.title, "Higher purchase price");
    assert.equal(design.concerns[0]?.title, "Minimal storage");
    assert.equal(
      sustainability.concerns[0]?.title,
      "Solar installation not included",
    );
    assert.notDeepEqual(family.concerns, design.concerns);
  });
});
