import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  EMPTY_DIRECTIONAL_INTENT,
  PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX,
  applyDirectionalIntent,
  hasReachedNavigationBoundary,
  hasReachedSceneStart,
  nextProgressiveSceneId,
  previousProgressiveSceneId,
  touchDownwardDeltaPx,
} from "./useProgressiveScrollUnlock";

const here = dirname(fileURLToPath(import.meta.url));
const read = (path: string) => readFileSync(join(here, path), "utf8");

describe("pinned progressive scene navigation", () => {
  it("uses a tunable 160px threshold and transitions forward immediately", () => {
    assert.equal(PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX, 160);
    const partial = applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, 159);
    const reached = applyDirectionalIntent(partial.state, 1);
    assert.equal(partial.transition, null);
    assert.equal(reached.transition, "forward");
    assert.deepEqual(reached.state, EMPTY_DIRECTIONAL_INTENT);
  });

  it("transitions backward at the same signed threshold", () => {
    const partial = applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, -100);
    const reached = applyDirectionalIntent(partial.state, -60);
    assert.equal(reached.transition, "backward");
    assert.deepEqual(reached.state, EMPTY_DIRECTIONAL_INTENT);
  });

  it("resets accumulated displacement when direction changes", () => {
    const down = applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, 140);
    const up = applyDirectionalIntent(down.state, -20);
    assert.deepEqual(up.state, { direction: "backward", accumulatedPx: 20 });
    assert.equal(up.transition, null);
  });

  it("maps both directions to adjacent available scenes", () => {
    const ids = ["orientation", "priority", "racio", "audit"];
    assert.equal(nextProgressiveSceneId(ids, "priority"), "racio");
    assert.equal(previousProgressiveSceneId(ids, "priority"), "orientation");
    assert.equal(previousProgressiveSceneId(ids, "orientation"), null);
  });

  it("keeps touch direction consistent with wheel direction", () => {
    assert.equal(touchDownwardDeltaPx(420, 380), 40);
    assert.equal(touchDownwardDeltaPx(380, 420), -40);
  });

  it("allows long-scene reading before either reading boundary", () => {
    assert.equal(hasReachedNavigationBoundary(1_400, 800), false);
    assert.equal(hasReachedSceneStart(40, 0, 92), false);
    assert.equal(hasReachedNavigationBoundary(800, 800), true);
    assert.equal(hasReachedSceneStart(92, 0, 92), true);
  });

  it("uses scene bounds rather than document bottom", () => {
    const hook = read("useProgressiveScrollUnlock.ts");
    assert.match(hook, /isAtCurrentSceneBoundary/);
    assert.match(hook, /isAtCurrentSceneStart/);
    assert.doesNotMatch(hook, /document\.documentElement\.scrollHeight/);
    assert.doesNotMatch(hook, /document\.body\.scrollHeight/);
  });

  it("pins input only at the matching directional reading boundary", () => {
    const hook = read("useProgressiveScrollUnlock.ts");
    assert.match(
      hook,
      /direction === "forward"[\s\S]*isAtCurrentSceneBoundary/,
    );
    assert.match(hook, /isAtCurrentSceneStart/);
    assert.match(hook, /event\.preventDefault\(\)/);
    assert.match(hook, /passive: false/);
  });

  it("protects directional inner scrollers", () => {
    const hook = read("useProgressiveScrollUnlock.ts");
    assert.match(hook, /direction === "forward"[\s\S]*element\.scrollHeight/);
    assert.match(hook, /direction === "backward" && element\.scrollTop/);
  });

  it("routes buttons and both scroll directions through unlockScene", () => {
    const page = read("../ClientStudioPage.tsx");
    assert.match(
      page,
      /const handleSceneNavigate[\s\S]*unlockScene\(sceneId\)/,
    );
    assert.match(page, /const navigateProgressively/);
    assert.match(page, /unlockScene\(targetScene\)/);
    assert.match(page, /onNavigate: navigateProgressively/);
  });

  it("starts transition synchronously at threshold", () => {
    const hook = read("useProgressiveScrollUnlock.ts");
    const transition = hook.indexOf("navigateRef.current(result.transition)");
    assert.ok(transition > 0);
    assert.doesNotMatch(
      hook.slice(transition - 180, transition + 80),
      /setTimeout/,
    );
  });

  it("positions only after target render readiness", () => {
    const page = read("../ClientStudioPage.tsx");
    const ready = page.indexOf("document.getElementById(sceneId) === null");
    const position = page.indexOf('positionTarget("smooth")');
    assert.ok(ready > 0 && ready < position);
    assert.match(page, /!isSectionScrollReady\(sceneId\)/);
  });

  it("starts physical lock only from canonical scroll completion", () => {
    const page = read("../ClientStudioPage.tsx");
    assert.match(
      page,
      /const onScrollEnd = \(\) => \{[\s\S]*beginPhysicalLockAtTarget\(\)/,
    );
    assert.match(page, /scrollRoot\.addEventListener\("scrollend"/);
    assert.match(page, /isSectionAtScrollAnchor\(sceneId, scrollOffsetPx\)/);
    assert.match(page, /setIsPhysicalScrollLocked\(true\)/);
    const anchorGuard = page.indexOf("if (!isSectionAtScrollAnchor");
    const lockStart = page.indexOf("beginPhysicalLock();", anchorGuard);
    assert.ok(anchorGuard > 0 && anchorGuard < lockStart);
  });

  it("physically blocks wheel and touch for 1000ms", () => {
    const page = read("../ClientStudioPage.tsx");
    const lock = read("usePhysicalScrollLock.ts");
    assert.match(page, /PROGRESSIVE_PHYSICAL_SCROLL_LOCK_MS = 1000/);
    assert.match(lock, /addEventListener\("wheel"[\s\S]*passive: false/);
    assert.match(lock, /addEventListener\("touchmove"[\s\S]*passive: false/);
    assert.match(lock, /preventPhysicalScroll[\s\S]*preventDefault/);
    assert.doesNotMatch(lock, /overflow/);
  });

  it("blocks momentum and resets intent through transition and lock", () => {
    const page = read("../ClientStudioPage.tsx");
    const hook = read("useProgressiveScrollUnlock.ts");
    assert.match(
      page,
      /navigationBlocked: isSceneTransitioning \|\| isPhysicalScrollLocked/,
    );
    assert.match(
      hook,
      /if \(navigationBlocked\)[\s\S]*EMPTY_DIRECTIONAL_INTENT/,
    );
    assert.match(
      page,
      /setScrollIntentResetKey\(\(current\) => current \+ 1\)/,
    );
  });

  it("has an independent physical-lock fail-safe", () => {
    const page = read("../ClientStudioPage.tsx");
    assert.match(page, /PROGRESSIVE_PHYSICAL_SCROLL_LOCK_FAILSAFE_MS = 1500/);
    assert.match(page, /transitionFailsafeRef\.current = window\.setTimeout/);
    assert.match(page, /setIsPhysicalScrollLocked\(false\)/);
  });

  it("uses one canonical 48px desktop gap for standard scenes", () => {
    const page = read("../ClientStudioPage.tsx");
    const css = read("../../../index.css");
    assert.match(
      css,
      /@media \(min-width: 1280px\)[\s\S]*data-standard-desktop-gap=["']true["'][\s\S]*margin-top: 48px/,
    );
    assert.equal((page.match(/standardDesktopGap/g) ?? []).length, 3);
  });

  it("preserves the HERO TOUR Social Proof composition exception", () => {
    const page = read("../ClientStudioPage.tsx");
    const orientation = page.slice(
      page.indexOf("sceneId={scenes[0]!.id}"),
      page.indexOf("{revealedSceneCount >= 2"),
    );
    assert.doesNotMatch(orientation, /standardDesktopGap/);
    assert.match(orientation, /<Hero \/>/);
    assert.match(orientation, /<SpatialTerminal \/>/);
    assert.match(orientation, /ClientStudioWelcomeBridge/);
  });

  it("preserves mobile clipping and safe-area protection", () => {
    const frame = read("JourneySceneFrame.tsx");
    const css = read("../../../index.css");
    assert.match(frame, /minHeight: SCENE_MIN_HEIGHT/);
    assert.match(frame, /env\(safe-area-inset-bottom/);
    assert.match(
      css,
      /@media \(max-width: 767px\)[\s\S]*content-visibility: auto/,
    );
  });

  it("provides TOUR to PRIORITY Back through canonical navigation", () => {
    const page = read("../ClientStudioPage.tsx");
    const priority = read("../sections/PriorityEngine/PriorityEngine.tsx");
    assert.match(priority, /onClick=\{onBack\}[\s\S]*← Zpět/);
    assert.match(
      page,
      /<PriorityEngine[\s\S]*onBack=\{\(\) =>[\s\S]*unlockScene/,
    );
  });

  it("keeps revealed progress monotonic and active scene authoritative", () => {
    const page = read("../ClientStudioPage.tsx");
    assert.match(page, /setRevealedSceneCount\(\(current\) => Math\.max/);
    assert.match(page, /currentSceneId: activeSceneId/);
    assert.match(page, /setActiveSceneId\(sceneId\)/);
  });
});
