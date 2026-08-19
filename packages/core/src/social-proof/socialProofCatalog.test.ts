import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SOCIAL_PROOF_TOPICS,
  derivedSocialProofPercentage,
  resolveSocialProofDataset,
} from "./socialProofCatalog";

describe("canonical Social Proof catalog", () => {
  it("defines the complete fifteen-topic contract", () => {
    assert.equal(SOCIAL_PROOF_TOPICS.length, 15);
  });

  it("starts real houses with historical founder seeds and no live data", () => {
    const dataset = resolveSocialProofDataset({
      houseId: "vpd-1",
      isReferenceHouse: false,
    });
    assert.ok(dataset);
    assert.equal(dataset?.mode, "REAL");
    assert.equal(dataset?.historical.every((metric) => metric.numerator === 1), true);
    assert.deepEqual(dataset?.live, []);
  });

  it("uses a deterministic coherent reference dataset without simulated live data", () => {
    const dataset = resolveSocialProofDataset({
      houseId: "bungalov-4kk",
      isReferenceHouse: true,
    });
    assert.ok(dataset);
    assert.equal(dataset?.historical.filter((metric) => metric.group === "COUNT").length, 5);
    assert.equal(dataset?.historical.filter((metric) => metric.group === "SHARE").length, 5);
    assert.equal(dataset?.live.length, 0);
    const share = dataset?.historical.find((metric) => metric.topic === "TOP_PRIORITY");
    assert.equal(derivedSocialProofPercentage(share!), 38);
  });
});
