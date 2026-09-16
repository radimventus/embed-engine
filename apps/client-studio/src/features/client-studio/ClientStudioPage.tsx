import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { ReactExperienceModel } from "@embed-engine/model";

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
  isSectionAtScrollAnchor,
  isSectionScrollReady,
  markPinnedNavigationTiming,
  nextProgressiveSceneId,
  previousProgressiveSceneId,
  registerJourneySectionNavigator,
  scrollToSection,
  useActiveSection,
  usePhysicalScrollLock,
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

export const PROGRESSIVE_PHYSICAL_SCROLL_LOCK_MS = 1000;
export const PROGRESSIVE_PHYSICAL_SCROLL_LOCK_FAILSAFE_MS = 1500;

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
  const [isPhysicalScrollLocked, setIsPhysicalScrollLocked] = useState(false);
  const visibleSceneIds = scenes
    .slice(0, revealedSceneCount)
    .map((scene) => scene.id);
  const observedSceneId = useActiveSection(visibleSceneIds);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(
    scenes[0]?.id ?? null,
  );
  const [requestedSceneId, setRequestedSceneId] = useState<string | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [scrollIntentResetKey, setScrollIntentResetKey] = useState(0);
  const transitionTimerRef = useRef<number | null>(null);
  const transitionFailsafeRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (transitionFailsafeRef.current !== null) {
        window.clearTimeout(transitionFailsafeRef.current);
      }
    };
  }, []);

  usePhysicalScrollLock(isPhysicalScrollLocked);

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

    const scrollWhenReady = () => {
      if (cancelled) {
        return;
      }
      if (
        document.getElementById(sceneId) === null ||
        !isSectionScrollReady(sceneId)
      ) {
        frameId = window.requestAnimationFrame(scrollWhenReady);
        return;
      }

      let physicalLockStarted = false;
      const finishTransition = () => {
        if (transitionTimerRef.current !== null) {
          window.clearTimeout(transitionTimerRef.current);
          transitionTimerRef.current = null;
        }
        if (transitionFailsafeRef.current !== null) {
          window.clearTimeout(transitionFailsafeRef.current);
          transitionFailsafeRef.current = null;
        }
        setIsPhysicalScrollLocked(false);
        setIsSceneTransitioning(false);
      };
      const beginPhysicalLock = () => {
        if (physicalLockStarted) return;
        physicalLockStarted = true;
        markPinnedNavigationTiming("lock-start");
        if (transitionTimerRef.current !== null) {
          window.clearTimeout(transitionTimerRef.current);
        }
        setIsPhysicalScrollLocked(true);
        transitionTimerRef.current = window.setTimeout(
          finishTransition,
          PROGRESSIVE_PHYSICAL_SCROLL_LOCK_MS,
        );
        transitionFailsafeRef.current = window.setTimeout(
          finishTransition,
          PROGRESSIVE_PHYSICAL_SCROLL_LOCK_FAILSAFE_MS,
        );
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
      const beginPhysicalLockAtTarget = () => {
        if (!isSectionAtScrollAnchor(sceneId, scrollOffsetPx)) return false;
        beginPhysicalLock();
        return true;
      };
      // Fail-safe is longer than the maximum canonical duration. It cancels
      // the same central animator via an immediate canonical positioning call.
      transitionTimerRef.current = window.setTimeout(() => {
        positionTarget("auto", () => {
          if (!beginPhysicalLockAtTarget()) finishTransition();
        });
      }, 1600);
      positionTarget("smooth", () => {
        if (!beginPhysicalLockAtTarget()) finishTransition();
      });
      setPendingSceneId((current) => (current === sceneId ? null : current));
    };

    // Layout effect runs after the target DOM commits. Start the canonical
    // animator now so its first changed write lands in the nearest RAF.
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
    setRevealedSceneCount((current) => Math.max(current, nextSceneIndex + 1));
    setScrollIntentResetKey((current) => current + 1);
    if (sceneId !== scenes[0]?.id) {
      setSnapEnabled(true);
    }
    setIsSceneTransitioning(true);
    setIsPhysicalScrollLocked(false);
    setActiveSceneId(sceneId);
    setRequestedSceneId(sceneId);
    setPendingSceneScrollOffsetPx(scrollOffsetPx);
    setPendingSceneId(scrollTargetId);
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (transitionFailsafeRef.current !== null) {
      window.clearTimeout(transitionFailsafeRef.current);
      transitionFailsafeRef.current = null;
    }
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

  const nextProgressiveScene = nextProgressiveSceneId(
    scenes.map((scene) => scene.id),
    activeSceneId,
  );
  const previousProgressiveScene = previousProgressiveSceneId(
    scenes.map((scene) => scene.id),
    activeSceneId,
  );

  const navigateProgressively = (direction: ProgressiveNavigationDirection) => {
    markPinnedNavigationTiming("transition-request");
    const targetScene =
      direction === "forward" ? nextProgressiveScene : previousProgressiveScene;
    if (targetScene === null) return;
    if (direction === "forward" && activeSceneId === scenes[0]!.id) {
      welcomeBridge.dismiss();
    }
    // The wheel/touch threshold is an input event. Commit the newly available
    // target in that same event so the canonical animator owns the next RAF.
    flushSync(() => unlockScene(targetScene));
  };

  useProgressiveScrollUnlock({
    navigationBlocked: isSceneTransitioning || isPhysicalScrollLocked,
    canNavigateForward: nextProgressiveScene !== null,
    canNavigateBackward: previousProgressiveScene !== null,
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
