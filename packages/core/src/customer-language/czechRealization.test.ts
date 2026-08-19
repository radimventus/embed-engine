import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CURRENT_HOUSE,
  EXPLICIT_PRODUCT,
  approvedLocalityForm,
  customerFacingHouseForm,
  customerFacingHouseIdentityForm,
  customerFacingPercentage,
  customerFacingPersonCount,
  customerFacingPriorityForm,
  customerFacingTimeWindowForm,
  selectPersonPredicate,
} from "./czechRealization";

describe("controlled Czech customer realization", () => {
  it("uses the frozen non-modulo person count classes", () => {
    const expected = new Map([
      [1, ["ONE", "člověk", "SINGULAR"]],
      [2, ["FEW", "lidé", "PLURAL"]],
      [3, ["FEW", "lidé", "PLURAL"]],
      [4, ["FEW", "lidé", "PLURAL"]],
      [5, ["MANY", "lidí", "NUMERIC_PLURAL"]],
      [21, ["MANY", "lidí", "NUMERIC_PLURAL"]],
      [22, ["MANY", "lidí", "NUMERIC_PLURAL"]],
      [23, ["MANY", "lidí", "NUMERIC_PLURAL"]],
      [24, ["MANY", "lidí", "NUMERIC_PLURAL"]],
      [25, ["MANY", "lidí", "NUMERIC_PLURAL"]],
      [101, ["MANY", "lidí", "NUMERIC_PLURAL"]],
      [102, ["MANY", "lidí", "NUMERIC_PLURAL"]],
    ] as const);

    for (const [count, [countClass, noun, agreement]] of expected) {
      const form = customerFacingPersonCount(count);
      assert.deepEqual(form, {
        value: count,
        countClass,
        noun,
        agreement,
      });
    }
  });

  it("rejects invalid customer-facing person counts", () => {
    assert.equal(customerFacingPersonCount(0), null);
    assert.equal(customerFacingPersonCount(-1), null);
    assert.equal(customerFacingPersonCount(1.5), null);
  });

  it("selects controlled predicate agreement from the person form", () => {
    const forms = {
      singular: "uložil",
      plural: "uložili",
      numericPlural: "uložilo",
    };

    const expected = new Map([
      [1, "uložil"],
      [2, "uložili"],
      [3, "uložili"],
      [4, "uložili"],
      [5, "uložilo"],
      [21, "uložilo"],
      [22, "uložilo"],
      [24, "uložilo"],
      [101, "uložilo"],
      [102, "uložilo"],
    ]);

    for (const [count, predicate] of expected) {
      assert.equal(
        selectPersonPredicate(customerFacingPersonCount(count)!, forms),
        predicate,
      );
    }
  });

  it("formats controlled whole percentages", () => {
    for (const value of [1, 2, 5, 21, 38]) {
      assert.deepEqual(customerFacingPercentage(value), {
        value,
        text: `${value} %`,
        personNoun: "lidí",
        agreement: "NUMERIC_PLURAL",
      });
    }
    assert.equal(customerFacingPercentage(-1), null);
    assert.equal(customerFacingPercentage(1.5), null);
  });

  it("resolves approved Priority forms without exposing unknown IDs", () => {
    const expected = [
      ["plot", "Pozemek", "pozemek"],
      ["layout", "Dispozice", "dispozici"],
      ["privacy", "Soukromí", "soukromí"],
      ["design", "Design", "design"],
      ["energy", "Energie", "energii"],
      ["operating-costs", "Provozní náklady", "provozní náklady"],
      ["quality", "Kvalita", "kvalitu"],
      ["maintenance", "Údržba", "údržbu"],
    ] as const;

    for (const [id, display, accusative] of expected) {
      assert.deepEqual(customerFacingPriorityForm(id), {
        id,
        display,
        accusative,
      });
    }

    assert.equal(customerFacingPriorityForm("internal-priority-id"), null);
  });

  it("resolves only controlled house and time forms", () => {
    assert.equal(
      customerFacingHouseForm(CURRENT_HOUSE, "ACCUSATIVE"),
      "tento dům",
    );
    assert.equal(
      customerFacingHouseForm(CURRENT_HOUSE, "DATIVE"),
      "tomuto domu",
    );
    assert.equal(customerFacingHouseForm("modern-4kk", "ACCUSATIVE"), null);
    assert.equal(customerFacingHouseForm(CURRENT_HOUSE, "NOMINATIVE"), null);
    assert.equal(
      customerFacingHouseIdentityForm(EXPLICIT_PRODUCT, "DISPLAY"),
      "Bungalov 4KK",
    );
    assert.equal(
      customerFacingHouseIdentityForm("modern-4kk", "DISPLAY"),
      null,
    );

    assert.equal(customerFacingTimeWindowForm("LIVE"), "právě");
    assert.equal(
      customerFacingTimeWindowForm("ROLLING_7_DAYS"),
      "za posledních 7 dní",
    );
    assert.equal(
      customerFacingTimeWindowForm("ROLLING_WEEK"),
      "za poslední týden",
    );
    assert.equal(
      customerFacingTimeWindowForm("ROLLING_MONTH"),
      "za poslední měsíc",
    );
    assert.equal(customerFacingTimeWindowForm("NO_EXPLICIT_WINDOW"), null);
    assert.equal(customerFacingTimeWindowForm("ANALYTICS_RAW_WINDOW"), null);
  });

  it("accepts only already prepared prepositional locality forms", () => {
    assert.equal(
      approvedLocalityForm({ approvedPrepositionalForm: "z Opavy" })?.text,
      "z Opavy",
    );
    assert.equal(
      approvedLocalityForm({ approvedPrepositionalForm: "" }),
      null,
    );
    assert.equal(
      approvedLocalityForm({ approvedPrepositionalForm: "Opava" }),
      null,
    );
    assert.equal(
      approvedLocalityForm({ approvedPrepositionalForm: "CZ-71" }),
      null,
    );
  });
});
