import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

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
import {
  CANONICAL_SCROLL_MAX_DURATION_MS,
  CANONICAL_SCROLL_MIN_DURATION_MS,
  HERO_TOUR_REFERENCE_DURATION_MS,
  canonicalScrollDurationMs,
  canonicalScrollProgress,
  heroTourScrollDurationMs,
  sectionScrollDurationMs,
} from "./scrollToSection";
import { canonicalSectionTarget } from "./journeyNavigation";
import { resolvePinnedSceneTarget } from "./pinnedSceneOrder";
import { JourneySceneFrame } from "./JourneySceneFrame";

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

  it("requires distinct intents for PRIORITY → TOUR → HERO", () => {
    const sceneIds = ["orientation", "priority", "racio", "decision"];
    const threshold = applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, -160);
    assert.equal(threshold.transition, "backward");
    const tour = resolvePinnedSceneTarget({
      direction: threshold.transition!,
      activeSceneId: "priority",
      orientationSceneId: "orientation",
      sceneIds,
      orientationStop: "tour",
    });
    assert.deepEqual(tour, {
      activeSceneId: "orientation",
      scrollTargetId: "social-proof",
      scrollOffsetPx: 20,
    });
    assert.equal(
      applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, -159).transition,
      null,
    );
    const hero = resolvePinnedSceneTarget({
      direction: applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, -160)
        .transition!,
      activeSceneId: tour!.activeSceneId,
      orientationSceneId: "orientation",
      sceneIds,
      orientationStop: "tour",
    });
    assert.deepEqual(hero, {
      activeSceneId: "orientation",
      scrollTargetId: "hero",
      scrollOffsetPx: 0,
    });
  });

  it("requires distinct intents for HERO → TOUR → PRIORITY", () => {
    const sceneIds = ["orientation", "priority", "racio", "decision"];
    const tour = resolvePinnedSceneTarget({
      direction: applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, 160)
        .transition!,
      activeSceneId: "orientation",
      orientationSceneId: "orientation",
      sceneIds,
      orientationStop: "hero",
    });
    assert.deepEqual(tour, {
      activeSceneId: "orientation",
      scrollTargetId: "social-proof",
      scrollOffsetPx: 20,
    });
    assert.equal(
      applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, 159).transition,
      null,
    );
    const priority = resolvePinnedSceneTarget({
      direction: applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, 160)
        .transition!,
      activeSceneId: tour!.activeSceneId,
      orientationSceneId: "orientation",
      sceneIds,
      orientationStop: "tour",
    });
    assert.deepEqual(priority, {
      activeSceneId: "priority",
      scrollTargetId: "priority",
      scrollOffsetPx: 0,
    });
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
    assert.match(page, /resolvePinnedSceneTarget/);
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
    assert.match(hook, /markPinnedNavigationTiming\("threshold"\)/);
    const page = read("../ClientStudioPage.tsx");
    assert.match(page, /markPinnedNavigationTiming\("transition-request"\)/);
    assert.doesNotMatch(page, /animateOnMount=\{revealedSceneCount/);
  });

  it("uses one distance-aware canonical RAF animation authority", () => {
    const scroll = read("scrollToSection.ts");
    const heroCta = read("../sections/Hero/HeroCTA.tsx");
    assert.equal(CANONICAL_SCROLL_MIN_DURATION_MS, 816);
    assert.equal(CANONICAL_SCROLL_MAX_DURATION_MS, 1320);
    assert.equal(canonicalScrollDurationMs(0), 816);
    assert.equal(canonicalScrollDurationMs(2_000), 1320);
    assert.equal(canonicalScrollDurationMs(500), 996);
    assert.match(scroll, /canonicalScrollDurationMs/);
    assert.match(scroll, /canonicalScrollProgress/);
    assert.doesNotMatch(heroCta, /requestAnimationFrame|scrollTop|scrollTo\(/);
    assert.match(heroCta, /navigateToJourneySection/);
    assert.match(scroll, /activeScrollFrames[\s\S]*cancelAnimationFrame/);
    assert.match(scroll, /scrollBehavior = "auto"/);
    assert.match(scroll, /scrollSnapType = "none"/);
  });

  it("matches the short HERO path to standard pinned perceived velocity", () => {
    const heroDistance = 605;
    const standardDistance = 804;
    const heroDuration = heroTourScrollDurationMs(heroDistance);
    const standardDuration = canonicalScrollDurationMs(standardDistance);

    assert.equal(HERO_TOUR_REFERENCE_DURATION_MS, 1135);
    assert.equal(heroDuration, 854);
    assert.equal(
      sectionScrollDurationMs("social-proof", heroDistance),
      heroDuration,
    );
    assert.equal(
      sectionScrollDurationMs("journey-scene-priority", standardDistance),
      standardDuration,
    );
    assert.ok(
      Math.abs(heroDistance / heroDuration - standardDistance / standardDuration) <
        0.001,
    );
  });

  it("produces a monotonic smoothstep trajectory without endpoint jumps", () => {
    const samples = Array.from({ length: 101 }, (_, index) =>
      canonicalScrollProgress(index / 100),
    );
    assert.equal(samples[0], 0);
    assert.equal(samples.at(-1), 1);
    samples.slice(1).forEach((value, index) => {
      assert.ok(value > samples[index]!);
    });
    assert.ok(samples[1]! < 0.001);
    assert.ok(1 - samples.at(-2)! < 0.001);
  });

  it("schedules the first movement frame without a timer delay", () => {
    const scroll = read("scrollToSection.ts");
    const start = scroll.indexOf("const startedAt = performance.now()");
    const firstFrame = scroll.indexOf(
      "window.requestAnimationFrame(tick)",
      start,
    );
    assert.ok(start > 0 && firstFrame > start);
    assert.doesNotMatch(scroll.slice(start, firstFrame), /setTimeout/);
    assert.match(scroll, /onFirstFrame\?\.\(\)/);
    assert.match(scroll, /markPinnedNavigationTiming/);
  });

  it("positions only after target render readiness", () => {
    const page = read("../ClientStudioPage.tsx");
    const ready = page.indexOf("document.getElementById(sceneId) === null");
    const position = page.indexOf('positionTarget("smooth",');
    assert.ok(ready > 0 && ready < position);
    assert.match(page, /!isSectionScrollReady\(sceneId\)/);
  });

  it("releases navigation directly from canonical scroll completion", () => {
    const page = read("../ClientStudioPage.tsx");
    assert.doesNotMatch(page, /addEventListener\("scrollend"/);
    assert.match(page, /positionTarget\("smooth", finishTransition\)/);
    assert.match(page, /setIsSceneTransitioning\(false\)/);
    assert.doesNotMatch(page, /PhysicalLock|setTimeout|lock-start/);
  });

  it("prevents native input from competing only while the RAF owns scrolling", () => {
    const scroll = read("scrollToSection.ts");
    assert.match(scroll, /addEventListener\("wheel", preventNativeScroll/);
    assert.match(scroll, /addEventListener\("touchmove", preventNativeScroll/);
    assert.match(scroll, /removeEventListener\("wheel", preventNativeScroll/);
    assert.match(scroll, /restoreChrome\(\);\s*onComplete\?\.\(\)/);
  });

  it("blocks momentum and resets intent through transition and lock", () => {
    const page = read("../ClientStudioPage.tsx");
    const hook = read("useProgressiveScrollUnlock.ts");
    assert.match(
      page,
      /navigationBlocked: isSceneTransitioning,/,
    );
    assert.match(
      hook,
      /if \(navigationBlocked\) gestureConsumedRef.current = true/,
    );
    assert.match(
      page,
      /setScrollIntentResetKey\(\(current\) => current \+ 1\)/,
    );
  });

  it("has no post-arrival lock, settle or corrective timer writer", () => {
    const page = read("../ClientStudioPage.tsx");
    assert.doesNotMatch(page, /FAILSAFE|setTimeout|usePhysicalScrollLock/);
    assert.match(read("useProgressiveScrollUnlock.ts"), /gestureConsumedRef/);
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
    assert.match(orientation, /onBack=\{\(\) =>[\s\S]*<SpatialTerminal \/>/);
    assert.match(orientation, /ClientStudioWelcomeBridge/);
  });

  it("uses the exact same Social Proof composition target for HERO CTA and TOUR navigation", () => {
    const heroCta = read("../sections/Hero/HeroCTA.tsx");
    const page = read("../ClientStudioPage.tsx");
    const buttonTarget = canonicalSectionTarget("walkthrough");
    const pinnedTarget = canonicalSectionTarget("walkthrough");

    assert.deepEqual(buttonTarget, pinnedTarget);
    assert.deepEqual(buttonTarget, {
      scrollTargetId: "social-proof",
      scrollOffsetPx: 20,
    });
    assert.match(
      heroCta,
      /navigateToJourneySection\(PILOT_SECTION_IDS\.walkthrough\)/,
    );
    assert.match(page, /canonicalSectionTarget\(sectionId\)/);
    assert.match(page, /additionalOffsetPx: scrollOffsetPx/);
    assert.doesNotMatch(page, /target\.style\.transform/);
  });

  it("keeps representative scene button and pinned targets on unlockScene", () => {
    const page = read("../ClientStudioPage.tsx");
    assert.match(
      page,
      /const handleSceneNavigate[\s\S]*unlockScene\(sceneId\)/,
    );
    assert.match(
      page,
      /const navigateProgressively[\s\S]*target\.activeSceneId,[\s\S]*target\.scrollTargetId/,
    );
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

  it("renders the production TOUR Back control", () => {
    const markup = renderToStaticMarkup(
      createElement(
        JourneySceneFrame,
        {
          sceneId: "journey-scene-orientation",
          nextSceneId: "journey-scene-interpretation",
          onBack: () => undefined,
          footerLeading: createElement("div", null, "Bridge"),
        },
        createElement("div", { id: "walkthrough" }, "Tour"),
      ),
    );
    assert.match(markup, /data-tour-back=""/);
    assert.match(markup, /← Zpět/);
    assert.match(markup, /Pokračovat →/);
    assert.equal(
      (markup.match(/data-journey-navigation-boundary=/g) ?? []).length,
      1,
    );
  });

  it("routes production TOUR Back to HERO through canonical unlockScene", () => {
    const page = read("../ClientStudioPage.tsx");
    const tour = read("../sections/SpatialTerminal/SpatialTerminal.tsx");
    assert.doesNotMatch(tour, /TourBackNavigation|data-tour-back/);
    assert.match(
      page,
      /<JourneySceneFrame[\s\S]*onBack=\{\(\) =>[\s\S]*unlockScene\([\s\S]*scenes\[0\]!\.id,[\s\S]*PILOT_SECTION_IDS\.hero[\s\S]*<SpatialTerminal \/>/,
    );
  });

  it("keeps the global reserve on responsive layouts only", () => {
    const css = read("../../../index.css");
    assert.match(
      css,
      /body \{[\s\S]*padding-bottom: 0;[\s\S]*@media \(max-width: 1279px\)[\s\S]*padding-bottom: max\(300px, env\(safe-area-inset-bottom\)\)/,
    );
    assert.equal((css.match(/padding-bottom: max\(300px/g) ?? []).length, 1);
    assert.ok(
      css.indexOf("@media (max-width: 1279px)") <
        css.indexOf("padding-bottom: max(300px"),
    );
  });

  it("keeps desktop shell and sticky rail on the same document contract", () => {
    const shell = read("../../../components/layout/AppShell.tsx");
    const css = read("../../../index.css");
    assert.match(shell, /data-studio-shell="app"/);
    assert.match(shell, /data-studio-shell="sidebar-slot"/);
    assert.match(shell, /h-screen/);
    assert.match(css, /body \{[\s\S]*padding-bottom: 0/);
  });

  it("renders no empty navigation row after the final footer", () => {
    const markup = renderToStaticMarkup(
      createElement(
        JourneySceneFrame,
        { sceneId: "journey-scene-decision", compactDesktopEnd: true },
        createElement("footer", { "data-testid": "audit-final-footer" }),
      ),
    );
    assert.doesNotMatch(markup, /data-journey-navigation-boundary/);
    assert.match(
      markup,
      /padding-bottom:calc\(max\(20px, env\(safe-area-inset-bottom/,
    );
    assert.doesNotMatch(markup, /min-height:32px/);
  });

  it("keeps revealed progress monotonic and active scene authoritative", () => {
    const page = read("../ClientStudioPage.tsx");
    assert.match(page, /setRevealedSceneCount\(\(current\) => Math\.max/);
    assert.match(page, /currentSceneId: activeSceneId/);
    assert.match(page, /setActiveSceneId\(sceneId\)/);
  });
});
