import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { resolveSocialProofFeed } from "@embed-engine/core";

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

  it("contains no independent BUNGALOV proof numbers or pseudo-Social-Proof copy", () => {
    assert.doesNotMatch(launcherSource, /ověřeného House package|Půdorys je součástí|referenční House/);
    assert.doesNotMatch(launcherSource, /numerator|denominator|REFERENCE_HISTORICAL/);
  });
});
