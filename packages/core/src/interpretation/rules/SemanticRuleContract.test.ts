import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SEMANTIC_RULE_CATALOG,
  getSemanticRuleById,
  getSemanticRuleByMeaning,
  listSemanticRuleIds,
  resolveSemanticRuleId,
} from "./semanticRuleCatalog";
import { createSemanticRuleContract } from "./SemanticRuleContract";

describe("SemanticRuleContract catalog", () => {
  it("exposes stable unique identities", () => {
    const ids = listSemanticRuleIds();
    assert.ok(ids.length > 0);
    assert.equal(new Set(ids).size, ids.length);

    for (const id of ids) {
      assert.match(id, /^[A-Z]+_[0-9]{3}$/);
      const contract = getSemanticRuleById(id);
      assert.ok(contract);
      assert.equal(contract?.id, id);
      assert.equal(typeof contract?.meaning, "string");
      assert.equal(typeof contract?.domain, "string");
      assert.equal(contract?.version, 1);
    }
  });

  it("resolves meaning keys to canonical rule identities", () => {
    assert.equal(resolveSemanticRuleId("family.bedrooms"), "LAYOUT_001");
    assert.equal(resolveSemanticRuleId("investment.price"), "PRICE_001");
    assert.equal(resolveSemanticRuleId("design.open-living"), "SPACE_001");
    assert.equal(resolveSemanticRuleId("design.glazing"), "SUNLIGHT_001");
    assert.equal(resolveSemanticRuleId("lens.layout"), "LENS_001");
    assert.equal(resolveSemanticRuleId("intent.explore-layout"), "INTENT_001");
    assert.equal(resolveSemanticRuleId("unknown.meaning"), undefined);
  });

  it("keeps catalog entries frozen and lookup-consistent", () => {
    assert.ok(Object.isFrozen(SEMANTIC_RULE_CATALOG));
    const byMeaning = getSemanticRuleByMeaning("family.bedrooms");
    const byId = getSemanticRuleById("LAYOUT_001");
    assert.deepEqual(byMeaning, byId);

    const created = createSemanticRuleContract({
      id: "LAYOUT_001",
      version: 1,
      meaning: "family.bedrooms",
      domain: "layout",
    });
    assert.ok(Object.isFrozen(created));
    assert.deepEqual(created, byId);
  });
});
