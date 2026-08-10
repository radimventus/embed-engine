import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { REFERENCE_HOUSE_PACKAGE } from "./reference-house-package";
import { projectHouse } from "./projectHouse";

describe("projectHouse", () => {
  it("maps Object Package fields onto ExperienceHouse", () => {
    const experience = projectHouse(REFERENCE_HOUSE_PACKAGE);
    assert.ok(experience);
    assert.equal(experience?.id, REFERENCE_HOUSE_PACKAGE.identity.id);
    assert.equal(experience?.title, REFERENCE_HOUSE_PACKAGE.identity.title);
    assert.equal(experience?.roomCount, REFERENCE_HOUSE_PACKAGE.overview.rooms);
    assert.equal(experience?.rooms.length, REFERENCE_HOUSE_PACKAGE.rooms.length);
  });

  it("returns null for null input", () => {
    assert.equal(projectHouse(null), null);
  });

  it("preserves optional House-level Hero copy", () => {
    const experience = projectHouse({
      ...REFERENCE_HOUSE_PACKAGE,
      heroCopy: {
        eyebrow: "NOVÝ DŮM",
        headline: "Rozpoznatelný headline",
        metrics: [
          { value: "100 m²", label: "Plocha" },
          { value: "A", label: "Energie" },
          { value: "Zděná", label: "Konstrukce" },
        ],
      },
    });

    assert.equal(experience?.heroCopy?.headline, "Rozpoznatelný headline");
  });
});
