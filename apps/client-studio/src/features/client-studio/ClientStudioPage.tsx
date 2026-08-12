import { useEffect, useRef, useState } from "react";
import type { ReactExperienceModel } from "@embed-engine/model";
import type { DecisionSessionRuntime } from "@embed-engine/runtime";

import { DecisionAnalyticsProvider, JourneySurfaceObserver } from "./analytics";
import { BuilderPreviewPersonaApplicator } from "./runtime/BuilderPreviewPersonaApplicator";
import { DecisionSessionRuntimeProvider } from "./runtime/DecisionSessionRuntimeProvider";
import { DesktopCanvas } from "./DesktopCanvas";
import {
  ChapterSpacer,
  GuidedJourneyRoot,
  JourneySceneFrame,
  RuntimeBootstrapGate,
  decisionJourneyScenes,
  isDecisionSection,
  isOrientationSection,
  isPrioritySection,
  isRacioSection,
  isSectionScrollReady,
  registerJourneySectionNavigator,
  scrollToSection,
  useActiveSection,
} from "./foundation";
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
  /** Shared Runtime from Embed Delivery Layer (optional for standalone SPA). */
  runtime?: DecisionSessionRuntime;
  /** Publishes the canonical visible scene to shell navigation. */
  onActiveSceneChange?: (sceneId: string | null) => void;
  /** Publishes the scene anchors that are currently rendered and navigable. */
  onVisibleSceneIdsChange?: (sceneIds: readonly string[]) => void;
};

/**
 * Decision Session Experience host (ED-DA-04 / CSCB-01).
 *
 * Provider tree is Context transport only:
 * DecisionAnalyticsProvider → DecisionSessionRuntimeProvider → WalkthroughProvider → PriorityExperienceProvider.
 * Cognitive Interpretation / Story providers are not mounted on the live path.
 *
 * Runtime is bootstrapped exactly once via DecisionSessionRuntimeProvider
 * (or injected once by Embed delivery).
 * Analytics observes passively (CSCB-08) and never mutates Runtime.
 */
export function ClientStudioPage({
  legacyExperience = null,
  onLegacySelectChoice,
  onLegacyContinue,
  runtime,
  onActiveSceneChange,
  onVisibleSceneIdsChange,
}: ClientStudioPageProps) {
  const scenes = decisionJourneyScenes();
  const [revealedSceneCount, setRevealedSceneCount] = useState(1);
  const [pendingSceneId, setPendingSceneId] = useState<string | null>(null);
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);
  const visibleSceneIds = scenes
    .slice(0, revealedSceneCount)
    .map((scene) => scene.id);
  const observedSceneId = useActiveSection(visibleSceneIds);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(
    scenes[0]?.id ?? null,
  );
  const [requestedSceneId, setRequestedSceneId] = useState<string | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const pendingSceneIdRef = useRef<string | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const scrollDelayTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const transitionEndCleanupRef = useRef<(() => void) | null>(null);
  const initialScrollAppliedRef = useRef(false);

  useEffect(() => {
    pendingSceneIdRef.current = pendingSceneId;
  }, [pendingSceneId]);

  useEffect(() => {
    if (initialScrollAppliedRef.current) return;
    const socialProof = document.getElementById(PILOT_SECTION_IDS.socialProof);
    const overlayMount = document.querySelector<HTMLElement>(
      "[data-embed-overlay-mount]",
    );
    if (socialProof === null || overlayMount === null) return;
    const frameId = window.requestAnimationFrame(() => {
      const headerHeight =
        document
          .querySelector<HTMLElement>("[data-experience-header]")
          ?.getBoundingClientRect().height ?? 72;
      overlayMount.scrollTop = Math.max(
        0,
        overlayMount.scrollTop +
          socialProof.getBoundingClientRect().top -
          overlayMount.getBoundingClientRect().top -
          Math.ceil(headerHeight),
      );
      initialScrollAppliedRef.current = true;
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
      if (scrollDelayTimerRef.current !== null) {
        window.clearTimeout(scrollDelayTimerRef.current);
      }
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      transitionEndCleanupRef.current?.();
    };
  }, []);

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

  useEffect(() => {
    if (pendingSceneId === null) {
      return;
    }
    if (scrollFrameRef.current !== null) {
      return;
    }
    if (scrollDelayTimerRef.current !== null) {
      return;
    }
    const scrollWhenMounted = () => {
      const sceneId = pendingSceneIdRef.current;
      if (sceneId === null) {
        scrollFrameRef.current = null;
        return;
      }
      if (
        document.getElementById(sceneId) === null ||
        !isSectionScrollReady(sceneId)
      ) {
        scrollFrameRef.current =
          window.requestAnimationFrame(scrollWhenMounted);
        return;
      }
      scrollFrameRef.current = window.requestAnimationFrame(() => {
        const currentSceneId = pendingSceneIdRef.current;
        if (currentSceneId === null) {
          scrollFrameRef.current = null;
          return;
        }
        if (
          document.getElementById(currentSceneId) !== null &&
          isSectionScrollReady(currentSceneId)
        ) {
          const finishTransition = () => {
            if (transitionTimerRef.current !== null) {
              window.clearTimeout(transitionTimerRef.current);
              transitionTimerRef.current = null;
            }
            setIsSceneTransitioning(false);
          };
          transitionEndCleanupRef.current?.();
          transitionEndCleanupRef.current = null;
          transitionTimerRef.current = window.setTimeout(
            finishTransition,
            2000,
          );
          scrollToSection(currentSceneId, "smooth");
          setPendingSceneId((current) =>
            current === currentSceneId ? null : current,
          );
          scrollFrameRef.current = null;
          return;
        }
        scrollFrameRef.current =
          window.requestAnimationFrame(scrollWhenMounted);
      });
    };
    scrollDelayTimerRef.current = window.setTimeout(() => {
      scrollDelayTimerRef.current = null;
      scrollFrameRef.current = window.requestAnimationFrame(scrollWhenMounted);
    }, 1000);
  }, [pendingSceneId, revealedSceneCount]);

  const enterScene = (sceneId: string, scrollTargetId = sceneId) => {
    const nextSceneIndex = scenes.findIndex((scene) => scene.id === sceneId);
    if (nextSceneIndex === -1) {
      return;
    }
    if (sceneId !== scenes[0]?.id) {
      setSnapEnabled(true);
    }
    setIsSceneTransitioning(true);
    setActiveSceneId(sceneId);
    setRequestedSceneId(sceneId);
    setRevealedSceneCount((current) => Math.max(current, nextSceneIndex + 1));
    setPendingSceneId(scrollTargetId);
    transitionEndCleanupRef.current?.();
    transitionEndCleanupRef.current = null;
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  };

  useEffect(() => {
    registerJourneySectionNavigator((sectionId) => {
      if (isDecisionSection(sectionId) && revealedSceneCount >= 4) {
        enterScene(scenes[3]!.id, sectionId);
        return;
      }
      if (isPrioritySection(sectionId)) {
        enterScene(scenes[1]!.id, sectionId);
        return;
      }
      if (isRacioSection(sectionId) && revealedSceneCount >= 3) {
        enterScene(scenes[2]!.id, sectionId);
        return;
      }
      if (isOrientationSection(sectionId)) {
        enterScene(scenes[0]!.id, sectionId);
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
    onEnterPriority: enterScene,
  });

  const handleSceneNavigate = (sceneId: string) => {
    enterScene(sceneId);
  };

  return (
    <DecisionAnalyticsProvider>
      <DecisionSessionRuntimeProvider runtime={runtime}>
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
                    reserveScrollSpace={revealedSceneCount === 1}
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
                        animateOnMount={revealedSceneCount === 2}
                      >
                        <PriorityEngine
                          onBack={() =>
                            enterScene(
                              scenes[0]!.id,
                              PILOT_SECTION_IDS.socialProof,
                            )
                          }
                          onContinueToRacio={() => {
                            if (PILOT_FLAGS.showAiAdvisor) {
                              enterScene(scenes[2]!.id);
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
                      animateOnMount={revealedSceneCount === 3}
                      pinFooterToBottom={false}
                    >
                      {PILOT_FLAGS.showAiAdvisor ? <AIAdvisor /> : null}
                    </JourneySceneFrame>
                  ) : null}
                  {revealedSceneCount >= 4 ? (
                    <JourneySceneFrame
                      sceneId={scenes[3]!.id}
                      onNavigate={handleSceneNavigate}
                      animateOnMount={revealedSceneCount === 4}
                      pinFooterToBottom={false}
                    >
                      <AuditLeadCapture
                        onBack={() => enterScene(scenes[2]!.id)}
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
      </DecisionSessionRuntimeProvider>
    </DecisionAnalyticsProvider>
  );
}
