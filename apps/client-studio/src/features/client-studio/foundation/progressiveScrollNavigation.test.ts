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
  canonicalMonotonicScrollTarget,
  canonicalScrollDurationMs,
  canonicalScrollProgress,
} from "./scrollToSection";
import { canonicalSectionTarget } from "./journeyNavigation";
import {
  resolveActivePinnedSceneStop,
  resolvePinnedSceneTarget,
} from "./pinnedSceneOrder";
import { JourneySceneFrame } from "./JourneySceneFrame";

const here = dirname(fileURLToPath(import.meta.url));
const read = (path: string) => readFileSync(join(here, path), "utf8");

describe("pinned progressive scene navigation", () => {
  it("uses a tunable 80px threshold and transitions forward immediately", () => {
    assert.equal(PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX, 80);
    const partial = applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, 79);
    const reached = applyDirectionalIntent(partial.state, 1);
    assert.equal(partial.transition, null);
    assert.equal(reached.transition, "forward");
    assert.deepEqual(reached.state, EMPTY_DIRECTIONAL_INTENT);
  });

  it("transitions backward at the same signed threshold", () => {
    const partial = applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, -50);
    const reached = applyDirectionalIntent(partial.state, -30);
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
    const threshold = applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, -80);
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
      applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, -79).transition,
      null,
    );
    const hero = resolvePinnedSceneTarget({
      direction: applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, -80)
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
      direction: applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, 80)
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
      applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, 79).transition,
      null,
    );
    const priority = resolvePinnedSceneTarget({
      direction: applyDirectionalIntent(EMPTY_DIRECTIONAL_INTENT, 80)
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

  it("takes over intent only at the matching directional reading boundary", () => {
    const hook = read("useProgressiveScrollUnlock.ts");
    assert.match(
      hook,
      /direction === "forward"[\s\S]*isAtCurrentSceneBoundary/,
    );
    assert.match(hook, /isAtCurrentSceneStart/);
    assert.doesNotMatch(hook, /event\.preventDefault\(\)/);
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

  it("hands the threshold frame to native scroll before canonical RAF takeover", () => {
    const hook = read("useProgressiveScrollUnlock.ts");
    const threshold = hook.indexOf(
      'markPinnedNavigationTiming("threshold")',
    );
    const scheduled = hook.indexOf(
      "takeoverFrameId = window.requestAnimationFrame",
      threshold,
    );
    const navigate = hook.indexOf(
      "navigateRef.current(transition)",
      scheduled,
    );
    assert.ok(threshold > 0);
    assert.ok(scheduled > threshold);
    assert.ok(navigate > scheduled);
    assert.match(
      hook,
      /takeoverFrameId = window\.requestAnimationFrame\([\s\S]*navigateRef\.current\(transition\)/,
    );
    assert.match(
      hook,
      /if \(takeoverFrameId !== null\)[\s\S]*cancelAnimationFrame\(takeoverFrameId\)/,
    );
    assert.doesNotMatch(
      hook,
      /navigateRef\.current\(result\.transition\)/,
    );
  });

  it("uses one distance-aware canonical RAF animation authority", () => {
    const scroll = read("scrollToSection.ts");
    const heroCta = read("../sections/Hero/HeroCTA.tsx");
    assert.equal(CANONICAL_SCROLL_MIN_DURATION_MS, 653);
    assert.equal(CANONICAL_SCROLL_MAX_DURATION_MS, 1056);
    assert.equal(canonicalScrollDurationMs(0), 653);
    assert.equal(canonicalScrollDurationMs(2_000), 1056);
    assert.equal(canonicalScrollDurationMs(500), 797);
    assert.match(scroll, /canonicalScrollDurationMs/);
    assert.match(scroll, /canonicalScrollProgress/);
    assert.doesNotMatch(heroCta, /requestAnimationFrame|scrollTop|scrollTo\(/);
    assert.match(heroCta, /navigateToJourneySection/);
    assert.match(scroll, /activeScrollFrames[\s\S]*cancelAnimationFrame/);
    assert.match(scroll, /scrollBehavior = "auto"/);
    assert.match(scroll, /scrollSnapType = "none"/);
  });

  it("captures the canonical RAF baseline from live scroll position on its first frame", () => {
    const scroll = read("scrollToSection.ts");

    assert.match(
      scroll,
      /const readScrollPosition = \(\) =>[\s\S]*scroller\.scrollTop/,
    );
    assert.match(
      scroll,
      /let from: number \| null = null;/,
    );
    assert.match(
      scroll,
      /const tick = \(now: number\) => \{[\s\S]*if \(from === null \|\| startedAt === null\)[\s\S]*from = readScrollPosition\(\);[\s\S]*startedAt = now;/,
    );
    assert.doesNotMatch(
      scroll,
      /const from =\s*scroller instanceof Window \? scroller\.scrollY : scroller\.scrollTop;[\s\S]*const tick/,
    );
  });

  it("uses the same generic duration and target pipeline for every stop", () => {
    const scroll = read("scrollToSection.ts");
    assert.equal(canonicalScrollDurationMs(605), 835);
    assert.equal(canonicalScrollDurationMs(804), 908);
    assert.doesNotMatch(scroll, /heroTour|HERO_TOUR/);
    assert.doesNotMatch(scroll, /sectionId === ["']social-proof["']/);
    assert.match(
      scroll,
      /const destination = sectionScrollTargetY[\s\S]*canonicalScrollDurationMs/,
    );
  });

  it("describes HERO, TOUR and standard stops without animation branches", () => {
    const common = {
      orientationSceneId: "orientation",
      sceneIds: ["orientation", "priority"],
    } as const;
    assert.deepEqual(
      resolveActivePinnedSceneStop({
        ...common,
        activeSceneId: "orientation",
        orientationStop: "hero",
      }),
      {
        activeSceneId: "orientation",
        scrollTargetId: "hero",
        scrollOffsetPx: 0,
        readingBoundaryId: "hero",
      },
    );
    assert.deepEqual(
      resolveActivePinnedSceneStop({
        ...common,
        activeSceneId: "orientation",
        orientationStop: "tour",
      }),
      {
        activeSceneId: "orientation",
        scrollTargetId: "social-proof",
        scrollOffsetPx: 20,
        readingBoundaryId: "orientation",
      },
    );
    assert.deepEqual(
      resolveActivePinnedSceneStop({
        ...common,
        activeSceneId: "priority",
        orientationStop: "tour",
      }),
      {
        activeSceneId: "priority",
        scrollTargetId: "priority",
        scrollOffsetPx: 0,
        readingBoundaryId: "priority",
      },
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

  it("never pulls live scroll backward against the canonical direction", () => {
    assert.equal(
      canonicalMonotonicScrollTarget(0, 600, 450, 520),
      520,
    );
    assert.equal(
      canonicalMonotonicScrollTarget(600, 0, 150, 80),
      80,
    );
    assert.equal(
      canonicalMonotonicScrollTarget(0, 600, 450, 620),
      600,
    );
    assert.equal(
      canonicalMonotonicScrollTarget(600, 0, 150, -20),
      0,
    );
  });

  it("schedules the first movement frame without a timer delay", () => {
    const scroll = read("scrollToSection.ts");
    const animate = scroll.indexOf("function animateScroll(");
    const tick = scroll.indexOf("const tick = (now: number) => {", animate);
    const firstFrame = scroll.indexOf(
      "window.requestAnimationFrame(tick)",
      tick,
    );

    assert.ok(animate > 0);
    assert.ok(tick > animate);
    assert.ok(firstFrame > tick);

    assert.doesNotMatch(
      scroll.slice(animate, firstFrame),
      /setTimeout/,
    );

    assert.match(
      scroll.slice(tick, firstFrame),
      /startedAt = now/,
    );

    assert.match(scroll, /onFirstFrame\?\.\(\)/);
  });

  it("positions only after target render readiness", () => {
    const page = read("../ClientStudioPage.tsx");
    const laterPath = page.indexOf("if (pendingSceneId === null)");
    const ready = page.indexOf(
      "document.getElementById(sceneId) === null",
      laterPath,
    );
    const position = page.indexOf(
      'scrollToSection(sceneId, "smooth",',
      laterPath,
    );
    assert.ok(ready > 0 && ready < position);
    assert.match(page, /!isSectionScrollReady\(sceneId, scrollOffsetPx\)/);
  });

  it("releases navigation directly from canonical scroll completion", () => {
    const page = read("../ClientStudioPage.tsx");
    assert.doesNotMatch(page, /addEventListener\("scrollend"/);
    assert.match(
      page,
      /scrollToSection\(sceneId, "smooth", \{[\s\S]*setIsSceneTransitioning\(false\)/,
    );
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

  it("keeps CSS proximity snap out of the native pre-threshold path", () => {
    const page = read("../ClientStudioPage.tsx");
    assert.match(
      page,
      /<GuidedJourneyRoot snapEnabled=\{false\} \/>/,
    );
    assert.doesNotMatch(page, /setSnapEnabled/);
    assert.doesNotMatch(page, /const \[snapEnabled/);
  });

  it("releases consumed gesture ownership when transition lock ends", () => {
    const page = read("../ClientStudioPage.tsx");
    const hook = read("useProgressiveScrollUnlock.ts");
    assert.match(page, /navigationBlocked: isSceneTransitioning,/);
    assert.match(
      hook,
      /gestureConsumedRef\.current = navigationBlocked/,
    );
    assert.match(
      hook,
      /if \(navigationBlocked \|\| gestureConsumedRef\.current\) return false/,
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



  it("keeps reachability in a journey-tail runway without moving scene geometry", () => {
    const page = read("../ClientStudioPage.tsx");
    const css = read("../../../index.css");

    assert.match(
      page,
      /--journey-reachability-runway/,
    );
    assert.match(
      page,
      /const requiredMaximum = Math\.max\([\s\S]*requested,[\s\S]*currentScrollTop/,
    );
    assert.match(
      page,
      /maximumWithoutRunway = Math\.max/,
    );
    assert.match(
      page,
      /currentScrollTop <= maximumWithoutRunway \+ 1/,
    );
    assert.match(
      css,
      /padding-bottom:\s*var\(--journey-reachability-runway, 0px\)/,
    );
    assert.doesNotMatch(
      page,
      /style\.setProperty\("--journey-anchor-reserve"/,
    );
    assert.doesNotMatch(
      page,
      /previousSceneId = scenes\[revealedSceneCount - 2\]/,
    );
  });

  it("keeps native movement through the 80px threshold frame", () => {
    const hook = read("useProgressiveScrollUnlock.ts");
    assert.match(
      hook,
      /PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX = 80/,
    );
    assert.match(
      hook,
      /Native scrolling owns the gesture through the threshold frame/,
    );
    assert.match(
      hook,
      /takeoverFrameId = window\.requestAnimationFrame/,
    );
    assert.doesNotMatch(hook, /event\.preventDefault\(\)/);
  });

  it("does not stretch standard desktop scenes beyond their real content", () => {
    const css = read("../../../index.css");
    assert.match(
      css,
      /@media \(min-width: 1280px\)[\s\S]*data-standard-desktop-gap=["']true["'][\s\S]*min-height:\s*0 !important/,
    );
    assert.match(
      css,
      /--journey-pinned-scene-gap:\s*600px/,
    );
  });

  it("uses one canonical large gap for every pinned scene boundary", () => {
    const page = read("../ClientStudioPage.tsx");
    const css = read("../../../index.css");
    assert.match(
      css,
      /--journey-pinned-scene-gap:\s*600px[\s\S]*data-standard-desktop-gap=["']true["'][\s\S]*margin-top:\s*var\(--journey-pinned-scene-gap\)/,
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
    assert.match(page, /currentSceneStartId: activePinnedStop\.scrollTargetId/);
    assert.doesNotMatch(page, /target\.style\.transform/);
  });

  it("keeps initial and later TOUR navigation on one canonical stop", () => {
    const page = read("../ClientStudioPage.tsx");

    assert.match(
      page,
      /const \[orientationStop, setOrientationStop\] = useState<"hero" \| "tour">\(\s*"hero",\s*\)/,
    );
    assert.match(page, /const initialLandingCanonicalOffsetPx = 20/);
    assert.match(
      page,
      /sectionScrollTargetY\(sceneId, initialLandingCanonicalOffsetPx\)/,
    );
    assert.match(
      page,
      /isSectionScrollReady\(sceneId, initialLandingCanonicalOffsetPx\)/,
    );
    assert.match(
      page,
      /additionalOffsetPx: initialLandingCanonicalOffsetPx/,
    );
    const pinned = read("./pinnedSceneOrder.ts");
    assert.match(
      pinned,
      /scrollTargetId: PILOT_SECTION_IDS\.socialProof,[\s\S]*scrollOffsetPx: 20/,
    );
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

  it("keeps responsive baseline free of permanent bottom reserve", () => {
    const css = read("../../../index.css");
    assert.match(
      css,
      /body \{[\s\S]*padding-bottom: 0;[\s\S]*@media \(max-width: 1279px\)[\s\S]*padding-bottom: env\(safe-area-inset-bottom\)/,
    );
    assert.doesNotMatch(css, /padding-bottom: max\(300px/);
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
    assert.match(page, /activeSceneId: activeSceneId/);
    assert.match(page, /currentSceneStartId: activePinnedStop\.scrollTargetId/);
    assert.match(page, /setActiveSceneId\(sceneId\)/);
  });
});


describe("JourneySceneFrame visibility", () => {
  it("does not poll layout during scrolling", () => {
    const source = readFileSync(
      new URL("./JourneySceneFrame.tsx", import.meta.url),
      "utf8",
    );

    assert.doesNotMatch(source, /setInterval\s*\(\s*updateVisibility/);
    assert.match(source, /new MutationObserver\s*\(\s*updateVisibility\s*\)/);
    assert.match(source, /new ResizeObserver\s*\(\s*updateVisibility\s*\)/);
  });
});


describe("initial canonical landing state", () => {
  it("finishes loaded thumbnail readiness before starting the canonical animation clock", () => {
    const page = read("../ClientStudioPage.tsx");
    const initialPath = page.indexOf("if (initialLandingSceneId === null)");
    const laterPath = page.indexOf("if (pendingSceneId === null)");
    const initial = page.slice(initialPath, laterPath);
    const preparation = initial.indexOf(
      "prepareInitialScrollMedia().then",
    );
    const animation = initial.indexOf('positionTarget("smooth")');

    assert.ok(preparation > 0);
    assert.ok(animation > preparation);
    assert.match(initial, /thumbnailDecodeReady = true/);
    assert.match(
      initial,
      /thumbnailDecodeReady = true;[\s\S]*requestAnimationFrame\(scrollWhenReady\)/,
    );
    assert.doesNotMatch(initial, /setTimeout/);
  });

  it("defers TOUR logical commit until the frame after physical initial landing", () => {
    const page = read("../ClientStudioPage.tsx");

    const initialPath = page.indexOf("if (initialLandingSceneId === null)");
    const laterPath = page.indexOf("if (pendingSceneId === null)");

    assert.ok(initialPath > 0 && laterPath > initialPath);

    const initial = page.slice(initialPath, laterPath);
    const reached = initial.indexOf(
      'markPinnedNavigationTiming("target-reached")',
    );
    const deferred = initial.indexOf(
      "window.requestAnimationFrame(() => {",
      reached,
    );
    const logical = initial.indexOf(
      'setOrientationStop("tour")',
      deferred,
    );

    assert.ok(reached > 0);
    assert.ok(deferred > reached);
    assert.ok(logical > deferred);

    assert.match(
      initial.slice(deferred),
      /setScrollIntentResetKey\(\(current\) => current \+ 1\)/,
    );
  });
});
