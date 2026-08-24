import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createSocialProofTickerSchedule,
  resolveSocialProofFeed,
  SOCIAL_PROOF_TICK_MS,
} from "@embed-engine/core";

const launcherSource = readFileSync(
  new URL("./EmbedHero.tsx", import.meta.url),
  "utf8",
);
const clientFeedSource = readFileSync(
  new URL(
    "../../../../../apps/client-studio/src/features/client-studio/sections/Hero/useSocialProofFeed.tsx",
    import.meta.url,
  ),
  "utf8",
);

describe("launcher Social Proof parity", () => {
  it("uses the same canonical BUNGALOV and VPD resolver contract as Client Studio", () => {
    const bungalov = resolveSocialProofFeed({
      houseId: "bungalov-4kk",
      isReferenceHouse: true,
    });
    const vpd = resolveSocialProofFeed({
      houseId: "vpd-1",
      isReferenceHouse: false,
    });

    assert.equal(bungalov.length, 10);
    assert.equal(vpd.length, 5);
    assert.match(launcherSource, /resolveSocialProofFeed/);
    assert.match(launcherSource, /houseId,\s*isReferenceHouse/);
    assert.match(clientFeedSource, /resolveSocialProofFeed/);
  });

  it("shares the 18s ticker and semantic topic-family scheduler", () => {
    assert.equal(SOCIAL_PROOF_TICK_MS, 18_000);

    const feed = resolveSocialProofFeed({
      houseId: "bungalov-4kk",
      isReferenceHouse: true,
    });
    const schedule = createSocialProofTickerSchedule(feed);

    for (let index = 0; index <= schedule.length - 3; index += 1) {
      const visible = schedule.slice(index, index + 3);
      if (visible.length < 3) continue;
      assert.equal(
        new Set(visible.map((item) => item.topicFamily)).size,
        3,
      );
    }

    assert.match(launcherSource, /SOCIAL_PROOF_TICK_MS/);
    assert.match(clientFeedSource, /createSocialProofTickerSchedule/);
  });

  it("keeps VPD free of BUNGALOV reference values", () => {
    const bungalov = resolveSocialProofFeed({
      houseId: "bungalov-4kk",
      isReferenceHouse: true,
    });
    const vpd = resolveSocialProofFeed({
      houseId: "vpd-1",
      isReferenceHouse: false,
    });

    const referenceValues = new Set(bungalov.map((item) => item.value));
    assert.equal(vpd.every((item) => item.value === "1"), true);
    assert.equal(
      vpd.some((item) => referenceValues.has(item.value) && item.value !== "1"),
      false,
    );
    assert.equal(vpd.some((item) => item.group === "LIVE"), false);
  });

  it("contains no independent BUNGALOV proof numbers or pseudo-Social-Proof copy", () => {
    assert.doesNotMatch(launcherSource, /ověřeného House package|Půdorys je součástí|referenční House/);
    assert.doesNotMatch(launcherSource, /numerator|denominator|REFERENCE_HISTORICAL/);
  });

  it("uses a full-width three-slot viewport with a clipped incoming fourth item", () => {
    assert.match(launcherSource, /overflow-hidden/);
    assert.match(launcherSource, /flex w-\[calc\(400%\/3\+1px\)\]/);
    assert.match(launcherSource, /flexBasis: "25%"/);
    assert.match(launcherSource, /translateX\(-25%\)/);
  });
});
