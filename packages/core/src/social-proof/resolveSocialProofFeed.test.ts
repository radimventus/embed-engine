import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveSocialProofFeed } from "./resolveSocialProofFeed";

describe("Social Proof feed resolver", () => {
  it("returns the canonical BUNGALOV reference COUNT and SHARE feed", () => {
    const feed = resolveSocialProofFeed({
      houseId: "bungalov-4kk",
      isReferenceHouse: true,
    });

    assert.equal(feed.length, 10);
    assert.deepEqual(new Set(feed.map((item) => item.group)), new Set(["COUNT", "SHARE"]));
    assert.deepEqual(feed[0], {
      id: "count:LAND_VALIDATION",
      group: "COUNT",
      topic: "LAND_VALIDATION",
      topicFamily: "land_validation",
      icon: "inquiry",
      value: "14",
      text: "lidí požádalo o ověření domu na svém pozemku.",
    });
    assert.deepEqual(feed.find((item) => item.topic === "TOP_PRIORITY"), {
      id: "share:TOP_PRIORITY:energy",
      group: "SHARE",
      topic: "TOP_PRIORITY",
      topicFamily: "top_priority",
      icon: "inquiry",
      value: "38 %",
      text: "zájemců označilo energii za prioritu.",
    });
  });

  it("returns the VPD seed feed without fabricated LIVE data", () => {
    const feed = resolveSocialProofFeed({
      houseId: "vpd-1",
      isReferenceHouse: false,
    });

    assert.equal(feed.length, 5);
    assert.equal(feed.every((item) => item.group === "COUNT"), true);
    assert.equal(feed.every((item) => item.value === "1"), true);
    assert.equal(feed.some((item) => item.group === "LIVE"), false);
  });

  it("includes LIVE only when verified concurrent data is supplied for this house", () => {
    const feed = resolveSocialProofFeed({
      houseId: "vpd-1",
      isReferenceHouse: false,
      live: [{
        kind: "LIVE",
        houseId: "vpd-1",
        count: 2,
        window: "LIVE",
      }, {
        kind: "LIVE",
        houseId: "another-house",
        count: 3,
        window: "LIVE",
      }],
    });

    assert.deepEqual(feed.at(-1), {
      id: "live",
      group: "LIVE",
      topic: "LIVE_HOUSE_VIEWERS",
      topicFamily: "house_view",
      icon: "viewing",
      value: "2",
      text: "lidé právě prohlížejí tento dům.",
    });
    assert.equal(feed.filter((item) => item.group === "LIVE").length, 1);
  });
});
