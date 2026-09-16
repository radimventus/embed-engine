import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  EMPTY_SCROLL_INTENT,
  PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX,
  applyScrollIntent,
  accumulateScrollIntent,
  lockScrollIntentUntilIdle,
  touchDownwardDeltaPx,
} from "./useProgressiveScrollUnlock";

const here = dirname(fileURLToPath(import.meta.url));

describe("progressive scroll navigation", () => {
  it("keeps the threshold tunable and accumulates downward intent", () => {
    assert.equal(PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX, 160);
    assert.deepEqual(accumulateScrollIntent(0, 60), {
      accumulatedPx: 60,
      thresholdReached: false,
    });
    assert.deepEqual(accumulateScrollIntent(60, 100), {
      accumulatedPx: 0,
      thresholdReached: true,
    });
  });

  it("never carries excess input into a second unlock", () => {
    const first = applyScrollIntent(EMPTY_SCROLL_INTENT, 500);
    const momentum = applyScrollIntent(first.state, 500);

    assert.equal(first.unlock, true);
    assert.equal(momentum.unlock, false);
    assert.deepEqual(momentum.state, lockScrollIntentUntilIdle());
  });

  it("resets 140px intent on button navigation before another 20px", () => {
    const page = readFileSync(join(here, "../ClientStudioPage.tsx"), "utf8");
    const partial = applyScrollIntent(EMPTY_SCROLL_INTENT, 140);
    const afterButton = lockScrollIntentUntilIdle();
    const followingScroll = applyScrollIntent(afterButton, 20);

    assert.equal(partial.state.accumulatedPx, 140);
    assert.equal(followingScroll.unlock, false);
    assert.equal(followingScroll.state.accumulatedPx, 0);
    assert.match(page, /setScrollIntentResetKey\(\(current\) => current \+ 1\)/);
    assert.match(page, /progressKey: `\$\{revealedSceneCount\}:\$\{scrollIntentResetKey\}`/);
  });

  it("uses viewport Y movement with the same positive-downward convention", () => {
    assert.equal(touchDownwardDeltaPx(420, 380), 40);
    assert.equal(touchDownwardDeltaPx(380, 420), -40);
  });

  it("routes buttons and scroll through the same canonical unlock", () => {
    const page = readFileSync(join(here, "../ClientStudioPage.tsx"), "utf8");
    assert.match(page, /const unlockScene =/);
    assert.match(page, /scrollTargetId = sceneId/);
    assert.match(page, /const handleSceneNavigate[\s\S]*unlockScene\(sceneId\)/);
    assert.match(page, /useProgressiveScrollUnlock\(/);
    assert.match(page, /unlockScene\(nextScene\.id\)/);
    assert.equal(page.includes("preserveViewport"), false);
  });

  it("positions only after the newly unlocked scene is available", () => {
    const page = readFileSync(join(here, "../ClientStudioPage.tsx"), "utf8");
    const readiness = page.indexOf("document.getElementById(sceneId) === null");
    const positioning = page.indexOf('scrollToSection(sceneId, "smooth")');

    assert.ok(readiness > 0);
    assert.ok(readiness < positioning);
    assert.match(page, /!isSectionScrollReady\(sceneId\)/);
    assert.match(page, /window\.requestAnimationFrame\(scrollWhenReady\)/);
  });

  it("uses the current scene navigation boundary instead of document bottom", () => {
    const hook = readFileSync(join(here, "useProgressiveScrollUnlock.ts"), "utf8");
    const frame = readFileSync(join(here, "JourneySceneFrame.tsx"), "utf8");

    assert.match(frame, /data-journey-navigation-boundary=\{sceneId\}/);
    assert.match(hook, /currentSceneBoundary\(sceneId\)/);
    assert.match(hook, /!isAtCurrentSceneBoundary\(root, currentSceneId\)/);
    assert.match(hook, /boundary\.getBoundingClientRect\(\)\.bottom/);
    assert.equal(hook.includes("document.documentElement.scrollHeight"), false);
    assert.equal(hook.includes("document.body.scrollHeight"), false);
  });

  it("protects nested scrollers and keeps momentum locked after positioning", () => {
    const hook = readFileSync(join(here, "useProgressiveScrollUnlock.ts"), "utf8");
    const page = readFileSync(join(here, "../ClientStudioPage.tsx"), "utf8");

    assert.match(hook, /nestedScrollerCanContinue\(target, root\)/);
    assert.match(hook, /intentRef\.current\.lockedUntilIdle/);
    assert.match(hook, /releaseAfterIdle\(\)/);
    assert.match(page, /setScrollIntentResetKey\(\(current\) => current \+ 1\)/);
    assert.match(hook, /deltaPx <= 0/);
    assert.match(hook, /touchmove/);
    assert.match(hook, /wheel/);
  });
});
