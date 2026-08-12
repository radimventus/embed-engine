import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(here, relative), "utf8");
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("Hero Experience (CSCB-02 / SR-002) — Reference Hero (PT-HERO-00)", () => {
  it("reads no Decision composition APIs", () => {
    const files = readdirSync(here).filter(
      (name) => name.endsWith(".tsx") || name.endsWith(".ts"),
    );

    for (const name of files) {
      if (name.endsWith(".test.ts")) {
        continue;
      }
      const source = stripComments(read(name));
      assert.equal(
        source.includes("composeDecision"),
        false,
        `${name} must not compose Decision semantics`,
      );
      assert.equal(
        source.includes("interpretDecision"),
        false,
        `${name} must not interpret`,
      );
      assert.equal(
        source.includes("dispatch("),
        false,
        `${name} must not dispatch Runtime commands`,
      );
      assert.equal(
        source.includes("presentation-assets"),
        false,
        `${name} must not import presentation catalog`,
      );
      assert.equal(
        source.includes("@embed-engine/object-house"),
        false,
        `${name} must not import Object Package directly`,
      );
    }
  });

  it("prefers House Hero copy while retaining the reference fallback and CTA", () => {
    const content = read("HeroContent.tsx");
    const cta = read("HeroCTA.tsx");
    const image = read("HeroImage.tsx");

    assert.match(content, /MODERN A01/);
    assert.match(content, /Rodinný dům, kde to dýchá štěstím/);
    assert.match(content, /context\.hero\.copy/);
    assert.match(content, /HeroCTA/);
    assert.match(cta, /Podívat se dovnitř/);
    assert.match(cta, /PILOT_SECTION_IDS\.socialProof/);
    assert.match(cta, /data-embed-overlay-mount/);
    assert.match(cta, /scrollTop/);
    assert.equal(stripComments(cta).includes("scrollIntoView"), false);
    assert.match(image, /useDecisionSessionRuntime/);
    assert.match(image, /context\.hero\.primaryMediaUrl/);
    assert.match(image, /animate-hero-photo-veil/);
  });

  it("keeps Social Proof inside the Hero card (reference parity)", () => {
    const hero = read("Hero.tsx");
    const socialProof = read("SocialProof.tsx");
    const feed = read("useSocialProofFeed.tsx");
    assert.match(hero, /SocialProof/);
    assert.match(hero, /grid-cols-\[minmax\(0,1fr\)_minmax\(0,2fr\)\]/);
    assert.equal(hero.includes("tablet:grid-cols"), false);
    assert.match(socialProof, /useSocialProofFeed/);
    assert.match(feed, /useSocialProofReadModel/);
    assert.match(socialProof, /FEED_TICKER_PAUSE_MS = 12000/);
    assert.match(socialProof, /id="social-proof"/);
    assert.match(socialProof, /entries\.length > 0 \?/);
    assert.doesNotMatch(
      socialProof,
      /if \(entries\.length === 0\) \{\s*return null;/,
    );
    assert.match(feed, /if \(model === null\) return \[\];/);
    assert.doesNotMatch(socialProof, /label:\s*layer/);
    assert.equal(socialProof.includes("zájemce"), false);
    assert.match(socialProof, /setTimeout/);
  });
});
