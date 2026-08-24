import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildOfficialPartnerSnippet } from "./partnerSnippet.mjs";

const BUNGALOV =
  "reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk";
const VPD =
  "draft-company-domy-s-energii-project-domy-s-energii-vas-prvni-dum-5kk";

describe("canonical partner Embed snippet", () => {
  it("is deterministic for the same House", () => {
    const input = {
      houseId: BUNGALOV,
      assetBase: "https://conis.cz",
      cacheBust: "task64",
      aiDeliveryUrl: "https://ai.example.test",
    };

    assert.equal(
      buildOfficialPartnerSnippet(input),
      buildOfficialPartnerSnippet(input),
    );
  });

  it("binds the exact intended House", () => {
    const bungalov = buildOfficialPartnerSnippet({ houseId: BUNGALOV });
    const vpd = buildOfficialPartnerSnippet({ houseId: VPD });

    assert.match(bungalov, new RegExp(BUNGALOV));
    assert.match(vpd, new RegExp(VPD));
    assert.doesNotMatch(bungalov, new RegExp(VPD));
    assert.doesNotMatch(vpd, new RegExp(BUNGALOV));
  });

  it("loads the canonical Embed artifact and launcher contract", () => {
    const snippet = buildOfficialPartnerSnippet({ houseId: BUNGALOV });

    assert.match(snippet, /https:\/\/conis\.cz\/embed\/embed\.iife\.js/);
    assert.match(snippet, /Embed\.mount\(\{/);
    assert.match(snippet, /mode: "launcher"/);
    assert.match(snippet, /entryPoint: "hero-cta"/);
  });

  it("contains no customer Social Proof or Experience corpus", () => {
    const snippet = buildOfficialPartnerSnippet({ houseId: BUNGALOV });

    for (const forbidden of [
      "lidí požádalo",
      "zájemců označilo",
      "právě prohlížejí",
      "Rodinný dům, kde to dýchá štěstím",
      "Užitná plocha",
      "Energetická třída",
      "Podívat se dovnitř",
    ]) {
      assert.equal(snippet.includes(forbidden), false, forbidden);
    }
  });

  it("contains no OpenAI browser secret", () => {
    const snippet = buildOfficialPartnerSnippet({
      houseId: BUNGALOV,
      aiDeliveryUrl: "https://ai.example.test",
    });

    assert.doesNotMatch(snippet, /OPENAI_API_KEY/);
    assert.doesNotMatch(snippet, /sk-[A-Za-z0-9_-]{20,}/);
    assert.match(snippet, /__EMBED_AI_DELIVERY__/);
  });
});
