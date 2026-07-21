import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  composeExperience,
  createExperienceComposer,
  type ExperienceComposeInput,
} from "./composeExperience";
import { createEmptyPrioritySelection } from "./PrioritySelection";

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
});

describe("priority → ExperienceComposer pipeline", () => {
  it("accepts changing PrioritySelection while Experience stays identical", () => {
    const empty = inputWith([]);
    const selected = inputWith(["layout", "energy", "privacy"]);

    assert.notDeepEqual(empty.priorities, selected.priorities);
    assert.notDeepEqual(
      empty.priorities.selected,
      selected.priorities.selected,
    );

    const experienceEmpty = composeExperience(empty);
    const experienceSelected = composeExperience(selected);

    assert.deepEqual(experienceEmpty, experienceSelected);
    assert.deepEqual(
      experienceEmpty,
      composeExperience({
        object: OBJECT,
        priorities: createEmptyPrioritySelection(),
      }),
    );
  });
});
