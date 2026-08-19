import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { presentSocialProofSignal } from "./socialProofPresentation";

describe("Social Proof Czech presentation", () => {
  it("keeps count value separate while using controlled agreement", () => {
    const expected = new Map([
      [1, "člověk dokončil prohlídku a přešel k prioritám za posledních 7 dní."],
      [2, "lidé dokončili prohlídku a přešli k prioritám za posledních 7 dní."],
      [3, "lidé dokončili prohlídku a přešli k prioritám za posledních 7 dní."],
      [4, "lidé dokončili prohlídku a přešli k prioritám za posledních 7 dní."],
      [5, "lidí dokončilo prohlídku a přešlo k prioritám za posledních 7 dní."],
      [21, "lidí dokončilo prohlídku a přešlo k prioritám za posledních 7 dní."],
    ]);

    for (const [count, text] of expected) {
      const presentation = presentSocialProofSignal({
        kind: "TOUR_COMPLETION",
        houseId: "house-1",
        count,
        window: "ROLLING_7_DAYS",
      });
      assert.deepEqual(presentation, {
        id: "tour-completion",
        icon: "viewing",
        value: String(count),
        text,
      });
      assert.equal(presentation?.text.includes(String(count)), false);
    }
  });

  it("uses controlled percentage, priority, and window forms", () => {
    for (const percentage of [1, 2, 5, 21, 38]) {
      const presentation = presentSocialProofSignal({
        kind: "PRIORITY_PREFERENCE",
        houseId: "house-1",
        priorityId: "energy",
        percentage,
        window: "ROLLING_MONTH",
      });
      assert.equal(presentation?.value, `${percentage} %`);
      assert.equal(
        presentation?.text,
        "lidí s dokončeným nastavením priorit označuje energii jako důležitou prioritu za poslední měsíc.",
      );
      assert.equal(presentation?.text.includes(`${percentage} %`), false);
    }
  });

  it("uses contextual house forms without leaking the internal house ID", () => {
    const save = presentSocialProofSignal({
      kind: "SAVE",
      houseId: "modern-4kk",
      count: 1,
      window: "ROLLING_WEEK",
    });
    const returned = presentSocialProofSignal({
      kind: "RETURN",
      houseId: "modern-4kk",
      count: 2,
      window: "ROLLING_WEEK",
    });

    assert.equal(save?.text, "člověk si tento dům uložil za poslední týden.");
    assert.equal(returned?.text, "lidé se k tomuto domu vrátili za poslední týden.");
    assert.equal(JSON.stringify([save, returned]).includes("modern-4kk"), false);
  });
});
