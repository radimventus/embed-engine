import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CANONICAL_ASSET_BASE,
  resolveProductionAssetBase,
} from "./resolveProductionAssetBase";

describe("resolveProductionAssetBase", () => {
  it("leaves undefined and empty unchanged for same-origin hosts", () => {
    assert.equal(resolveProductionAssetBase(undefined), undefined);
    assert.equal(resolveProductionAssetBase(""), undefined);
    assert.equal(resolveProductionAssetBase("   "), undefined);
  });

  it("keeps canonical conis.cz and strips trailing slash", () => {
    assert.equal(
      resolveProductionAssetBase("https://conis.cz"),
      CANONICAL_ASSET_BASE,
    );
    assert.equal(
      resolveProductionAssetBase("https://conis.cz/"),
      CANONICAL_ASSET_BASE,
    );
  });

  it("rewrites legacy github.io project URLs to conis.cz", () => {
    assert.equal(
      resolveProductionAssetBase(
        "https://radimventus.github.io/embed-engine",
      ),
      CANONICAL_ASSET_BASE,
    );
    assert.equal(
      resolveProductionAssetBase(
        "https://radimventus.github.io/embed-engine/",
      ),
      CANONICAL_ASSET_BASE,
    );
    assert.equal(
      resolveProductionAssetBase(
        "http://radimventus.github.io/embed-engine",
      ),
      CANONICAL_ASSET_BASE,
    );
  });

  it("does not rewrite unrelated origins", () => {
    assert.equal(
      resolveProductionAssetBase("https://partner.example"),
      "https://partner.example",
    );
  });
});
