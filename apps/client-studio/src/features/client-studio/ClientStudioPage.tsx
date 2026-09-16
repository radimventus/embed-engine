import { useEffect, useLayoutEffect, useState } from "react";
import { flushSync } from "react-dom";
import type { ReactExperienceModel } from "@embed-engine/model";

import {
  cancelSectionScroll,
  heroTourTargetY,
} from "./foundation/scrollToSection";

import { DecisionAnalyticsProvider, JourneySurfaceObserver } from "./analytics";
import { BuilderPreviewPersonaApplicator } from "./runtime/BuilderPreviewPersonaApplicator";
import { DesktopCanvas } from "./DesktopCanvas";
import {
  ChapterSpacer,
  canonicalSectionTarget,
  GuidedJourneyRoot,
  JourneySceneFrame,
  RuntimeBootstrapGate,
  decisionJourneyScenes,
  isDecisionSection,
  isOrientationSection,
  isPrioritySection,
  isRacioSection,
  isSectionScrollReady,
  markPinnedNavigationTiming,
  resolvePinnedSceneTarget,
  registerJourneySectionNavigator,
  scrollToSection,
  useActiveSection,
  useProgressiveScrollUnlock,
} from "./foundation";
import type { ProgressiveNavigationDirection } from "./foundation";
import { LegacyCommandExperience } from "./legacy/LegacyCommandExperience";
import { AIAdvisor } from "./sections/AIAdvisor/AIAdvisor";
import { Hero } from "./sections/Hero/Hero";
import { AmbientSocialProof } from "./sections/Hero/AmbientSocialProof";
import { SocialProofFeedProvider } from "./sections/Hero/useSocialProofFeed";
import { AuditLeadCapture } from "./sections/AuditLeadCapture/AuditLeadCapture";
import { PriorityEngine } from "./sections/PriorityEngine/PriorityEngine";
import { PriorityExperienceProvider } from "./sections/PriorityEngine/PriorityExperienceProvider";
import { SpatialTerminal } from "./sections/SpatialTerminal/SpatialTerminal";
import { WalkthroughProvider } from "../walkthrough";
import { PILOT_FLAGS, PILOT_SECTION_IDS } from "./pilot/pilotVocabulary";
import {
  CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG,
  ClientStudioWelcomeBridge,
  useWelcomeBridgeController,
} from "./welcome-bridge";

type ClientStudioPageProps = {
  /** LEGACY only — set when CommandRuntime host is explicitly enabled. */
  legacyExperience?: ReactExperienceModel | null;
  onLegacySelectChoice?: (decisionId: string, choiceId: string) => void;
  onLegacyContinue?: () => void;
  /** Workspace-only initial scene landing adjustment supplied by its mount. */
  initialLandingOffsetPx?: number;
  /** Publishes the canonical visible scene to shell navigation. */
  onActiveSceneChange?: (sceneId: string | null) => void;
  /** Publishes the scene anchors that are currently rendered and navigable. */
  onVisibleSceneIdsChange?: (sceneIds: readonly string[]) => void;
};

/**
 * Decision Session Experience host (ED-DA-04 / CSCB-01).
 *
 * Provider tree is Context transport only:
 * DecisionAnalyticsProvider → WalkthroughProvider → PriorityExperienceProvider,
 * inside the App-level DecisionSessionRuntimeProvider.
 *
 * Runtime is bootstrapped exactly once via DecisionSessionRuntimeProvider
 * (or injected once by Embed delivery).
 * Analytics observes passively (CSCB-08) and never mutates Runtime.
 */
export function ClientStudioPage({
  legacyExperience = null,
  onLegacySelectChoice,
  onLegacyContinue,
  initialLandingOffsetPx = 0,
  onActiveSceneChange,
  onVisibleSceneIdsChange,
}: ClientStudioPageProps) {
  const scenes = decisionJourneyScenes();
  const [revealedSceneCount, setRevealedSceneCount] = useState(1);
  const [pendingSceneId, setPendingSceneId] = useState<string | null>(
    PILOT_SECTION_IDS.socialProof,
  );
  const [pendingSceneScrollOffsetPx, setPendingSceneScrollOffsetPx] = useState(
    initialLandingOffsetPx,
  );
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);
  const visibleSceneIds = scenes
    .slice(0, revealedSceneCount)
    .map((scene) => scene.id);
  const observedSceneId = useActiveSection(visibleSceneIds);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(
    scenes[0]?.id ?? null,
  );
  const [orientationStop, setOrientationStop] = useState<"hero" | "tour">(
    "tour",
  );
  const [requestedSceneId, setRequestedSceneId] = useState<string | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [scrollIntentResetKey, setScrollIntentResetKey] = useState(0);
  useEffect(() => () => cancelSectionScroll(), []);


  useEffect(() => {
    onActiveSceneChange?.(activeSceneId);
  }, [activeSceneId, onActiveSceneChange]);

  useEffect(() => {
    if (observedSceneId === null) {
      return;
    }
    if (requestedSceneId === observedSceneId) {
      setRequestedSceneId(null);
      return;
    }
    if (requestedSceneId === null) {
      setActiveSceneId(observedSceneId);
    }
  }, [observedSceneId, requestedSceneId]);

  useEffect(() => {
    onVisibleSceneIdsChange?.(
      scenes.slice(0, revealedSceneCount).map((scene) => scene.id),
    );
  }, [onVisibleSceneIdsChange, revealedSceneCount, scenes]);

  useEffect(() => {
    if (activeSceneId !== scenes[0]?.id) {
      setSnapEnabled(true);
    }
  }, [activeSceneId, scenes]);

  useLayoutEffect(() => {
    if (pendingSceneId === null) {
      return;
    }
    const sceneId = pendingSceneId;
    const scrollOffsetPx = pendingSceneScrollOffsetPx;
    let frameId: number | null = null;
    let cancelled = false;
    let previousTargetTop: number | null = null;
    const orientation = document.getElementById(scenes[0]!.id);
    // A short first scene must still have enough scroll range for the historical
    // HERO landing. This reserve is after the reading/navigation boundary and
    // disappears as soon as real downstream content supplies the range.
    if (revealedSceneCount > 1) {
      orientation?.style.removeProperty("--journey-anchor-reserve");
    }

    const scrollWhenReady = () => {
      if (cancelled) {
        return;
      }
      if (document.getElementById(sceneId) === null) {
        frameId = window.requestAnimationFrame(scrollWhenReady);
        return;
      }
      const overlay = document.querySelector<HTMLElement>("[data-embed-overlay-mount]");
      const orientation = document.getElementById(scenes[0]!.id);
      if (sceneId === PILOT_SECTION_IDS.socialProof && revealedSceneCount === 1 && orientation) {
        const targetY = heroTourTargetY() ?? 0;
        const maximum = overlay ? overlay.scrollHeight - overlay.clientHeight :
          document.documentElement.scrollHeight - window.innerHeight;
        const missing = Math.ceil(targetY - maximum);
        if (missing > 0) {
          const current = parseFloat(orientation.style.getPropertyValue("--journey-anchor-reserve")) || 0;
          orientation.style.setProperty("--journey-anchor-reserve", `${current + missing}px`);
          frameId = window.requestAnimationFrame(scrollWhenReady);
          return;
        }
      }
      if (!isSectionScrollReady(sceneId)) {
        frameId = window.requestAnimationFrame(scrollWhenReady);
        return;
      }
      const targetTop = document.getElementById(sceneId)!.getBoundingClientRect().top +
        (overlay?.scrollTop ?? window.scrollY);
      if (
        previousTargetTop === null ||
        Math.abs(previousTargetTop - targetTop) > 0.5
      ) {
        previousTargetTop = targetTop;
        frameId = window.requestAnimationFrame(scrollWhenReady);
        return;
      }
      const finishTransition = () => {
        setIsSceneTransitioning(false);
      };
      const positionTarget = (
        behavior: ScrollBehavior,
        onComplete?: () => void,
      ) => {
        scrollToSection(sceneId, behavior, {
          additionalOffsetPx: scrollOffsetPx,
          onFirstFrame: () => markPinnedNavigationTiming("first-frame"),
          onComplete: () => {
            markPinnedNavigationTiming("target-reached");
            onComplete?.();
          },
        });
      };
      positionTarget("smooth", finishTransition);
      setPendingSceneId((current) => (current === sceneId ? null : current));
    };

    // Measure committed layout, confirm it on the nearest RAF, then give the
    // animator one immutable target. No debounce, settle or scrollend wait.
    scrollWhenReady();
    return () => {
      cancelled = true;
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [pendingSceneId, pendingSceneScrollOffsetPx, revealedSceneCount]);

  const unlockScene = (
    sceneId: string,
    scrollTargetId = sceneId,
    scrollOffsetPx = 0,
  ) => {
    const nextSceneIndex = scenes.findIndex((scene) => scene.id === sceneId);
    if (nextSceneIndex === -1) {
      return;
    }
    if (sceneId === scenes[0]?.id) {
      setOrientationStop(
        scrollTargetId === PILOT_SECTION_IDS.hero ? "hero" : "tour",
      );
    }
    setRevealedSceneCount((current) => Math.max(current, nextSceneIndex + 1));
    setScrollIntentResetKey((current) => current + 1);
    if (sceneId !== scenes[0]?.id) {
      setSnapEnabled(true);
    }
    setIsSceneTransitioning(true);
    setActiveSceneId(sceneId);
    setRequestedSceneId(sceneId);
    setPendingSceneScrollOffsetPx(scrollOffsetPx);
    setPendingSceneId(scrollTargetId);
  };

  useEffect(() => {
    registerJourneySectionNavigator((sectionId) => {
      if (isDecisionSection(sectionId) && revealedSceneCount >= 4) {
        unlockScene(scenes[3]!.id, sectionId);
        return;
      }
      if (isPrioritySection(sectionId)) {
        unlockScene(scenes[1]!.id, sectionId);
        return;
      }
      if (isRacioSection(sectionId) && revealedSceneCount >= 3) {
        unlockScene(scenes[2]!.id, sectionId);
        return;
      }
      if (isOrientationSection(sectionId)) {
        const target = canonicalSectionTarget(sectionId);
        unlockScene(
          scenes[0]!.id,
          target.scrollTargetId,
          target.scrollOffsetPx,
        );
      }
    });
    return () => {
      registerJourneySectionNavigator(null);
    };
  }, [revealedSceneCount, scenes]);

  const welcomeBridge = useWelcomeBridgeController({
    config: CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG,
    isTourActive: revealedSceneCount === 1,
    prioritySceneId: scenes[1]?.id ?? "journey-scene-interpretation",
    onEnterPriority: unlockScene,
  });

  const handleSceneNavigate = (sceneId: string) => {
    unlockScene(sceneId);
  };

  const nextPinnedTarget = resolvePinnedSceneTarget({
    direction: "forward",
    activeSceneId: activeSceneId ?? scenes[0]!.id,
    orientationSceneId: scenes[0]!.id,
    sceneIds: scenes.map((scene) => scene.id),
    orientationStop,
  });
  const previousPinnedTarget = resolvePinnedSceneTarget({
    direction: "backward",
    activeSceneId: activeSceneId ?? scenes[0]!.id,
    orientationSceneId: scenes[0]!.id,
    sceneIds: scenes.map((scene) => scene.id),
    orientationStop,
  });

  const navigateProgressively = (direction: ProgressiveNavigationDirection) => {
    markPinnedNavigationTiming("transition-request");
    const target =
      direction === "forward" ? nextPinnedTarget : previousPinnedTarget;
    if (target === null) return;
    if (
      direction === "forward" &&
      activeSceneId === scenes[0]!.id &&
      target.activeSceneId !== scenes[0]!.id
    ) {
      welcomeBridge.dismiss();
    }
    // The wheel/touch threshold is an input event. Commit the newly available
    // target in that same event so the canonical animator owns the next RAF.
    flushSync(() =>
      unlockScene(
        target.activeSceneId,
        target.scrollTargetId,
        target.scrollOffsetPx,
      ),
    );
  };

  useProgressiveScrollUnlock({
    navigationBlocked: isSceneTransitioning,
    canNavigateForward: nextPinnedTarget !== null,
    canNavigateBackward: previousPinnedTarget !== null,
    currentSceneId: activeSceneId ?? scenes[0]!.id,
    progressKey: `${revealedSceneCount}:${scrollIntentResetKey}`,
    onNavigate: navigateProgressively,
  });

  return (
    <DecisionAnalyticsProvider>
      <SocialProofFeedProvider>
        <RuntimeBootstrapGate>
          <BuilderPreviewPersonaApplicator />
          <WalkthroughProvider>
            <GuidedJourneyRoot
              snapEnabled={snapEnabled && !isSceneTransitioning}
            />
            <JourneySurfaceObserver />
            <DesktopCanvas>
              <div
                className="relative"
                data-guided-journey="decision-journey"
                data-current-scene={activeSceneId ?? ""}
              >
                {legacyExperience !== null &&
                onLegacySelectChoice !== undefined &&
                onLegacyContinue !== undefined ? (
                  <LegacyCommandExperience
                    experience={legacyExperience}
                    onSelectChoice={onLegacySelectChoice}
                    onContinue={onLegacyContinue}
                  />
                ) : null}
                <JourneySceneFrame
                  sceneId={scenes[0]!.id}
                  nextSceneId={scenes[1]?.id}
                  onNavigate={handleSceneNavigate}
                  onBack={() =>
                    unlockScene(scenes[0]!.id, PILOT_SECTION_IDS.hero)
                  }
                  pinFooterToBottom={false}
                  footerLeading={
                    <ClientStudioWelcomeBridge
                      open={welcomeBridge.open}
                      onContinue={welcomeBridge.continueToPriority}
                      onDismiss={welcomeBridge.dismiss}
                    />
                  }
                >
                  <Hero />
                  <ChapterSpacer />
                  <SpatialTerminal />
                </JourneySceneFrame>
                {revealedSceneCount >= 2 ? (
                  <PriorityExperienceProvider>
                    <JourneySceneFrame
                      sceneId={scenes[1]!.id}
                      onNavigate={handleSceneNavigate}
                      standardDesktopGap
                    >
                      <PriorityEngine
                        onBack={() =>
                          unlockScene(
                            scenes[0]!.id,
                            PILOT_SECTION_IDS.socialProof,
                            20,
                          )
                        }
                        onContinueToRacio={() => {
                          if (PILOT_FLAGS.showAiAdvisor) {
                            unlockScene(scenes[2]!.id);
                          }
                        }}
                        showRacioBridge={revealedSceneCount < 3}
                      />
                    </JourneySceneFrame>
                  </PriorityExperienceProvider>
                ) : null}
                {revealedSceneCount >= 3 ? (
                  <JourneySceneFrame
                    sceneId={scenes[2]!.id}
                    previousSceneId={scenes[1]?.id}
                    nextSceneId={scenes[3]?.id}
                    onNavigate={handleSceneNavigate}
                    pinFooterToBottom={false}
                    standardDesktopGap
                  >
                    {PILOT_FLAGS.showAiAdvisor ? <AIAdvisor /> : null}
                  </JourneySceneFrame>
                ) : null}
                {revealedSceneCount >= 4 ? (
                  <JourneySceneFrame
                    sceneId={scenes[3]!.id}
                    compactDesktopEnd
                    onNavigate={handleSceneNavigate}
                    pinFooterToBottom={false}
                    standardDesktopGap
                  >
                    <AuditLeadCapture
                      onBack={() => unlockScene(scenes[2]!.id)}
                    />
                  </JourneySceneFrame>
                ) : null}
                <AmbientSocialProof
                  enabled={!isSceneTransitioning}
                  journeyHasLeftMain={
                    activeSceneId !== scenes[0]?.id || revealedSceneCount > 1
                  }
                />
              </div>
            </DesktopCanvas>
          </WalkthroughProvider>
        </RuntimeBootstrapGate>
      </SocialProofFeedProvider>
    </DecisionAnalyticsProvider>
  );
}
