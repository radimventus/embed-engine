import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveConfidence } from "./confidence";
import { resolveFrictions } from "./frictions";
import { resolveIntent } from "./intent";
import { resolveLens } from "./lens";
import { resolveStrengths } from "./strengths";
import { resolveTradeOffs } from "./tradeOffs";

describe("InterpretationEngine semantic modules", () => {
  it("resolves lens by deterministic precedence", () => {
    assert.equal(resolveLens(["energy", "layout", "design"]), "layout");
    assert.equal(resolveLens([]), null);
  });

  it("isolates strengths per lens", () => {
    assert.equal(resolveStrengths("layout")[0]?.code, "family.bedrooms");
    assert.equal(resolveStrengths("investment")[0]?.code, "investment.opex");
    assert.equal(resolveStrengths(null).length, 0);
  });

  it("isolates frictions per lens", () => {
    assert.equal(resolveFrictions("layout")[0]?.code, "family.upper-floor");
    assert.equal(resolveFrictions(null)[0]?.code, "baseline.open-lens");
  });

  it("isolates trade-offs per lens", () => {
    assert.equal(
      resolveTradeOffs("design")[0]?.code,
      "design.clarity-vs-storage",
    );
    assert.equal(resolveTradeOffs(null).length, 0);
  });

  it("isolates confidence per lens", () => {
    assert.equal(resolveConfidence("layout").matchScore, 92);
    assert.equal(resolveConfidence("investment").matchScore, 76);
    assert.equal(resolveConfidence(null).matchScore, 40);
  });

  it("isolates intent per lens", () => {
    assert.equal(resolveIntent("layout"), "explore-layout");
    assert.equal(resolveIntent("energy"), "review-energy");
    assert.equal(resolveIntent(null), "select-priority");
  });
});
