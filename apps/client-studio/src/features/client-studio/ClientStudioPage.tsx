import { useEffect, useState } from 'react';
import type { ReactExperienceModel } from '@embed-engine/model';
import type { DecisionSessionRuntime } from '@embed-engine/runtime';

import {
  DecisionAnalyticsProvider,
  JourneySurfaceObserver,
} from './analytics';
import { DecisionSessionRuntimeProvider } from './runtime/DecisionSessionRuntimeProvider';
import { DesktopCanvas } from './DesktopCanvas';
import {
  ChapterSpacer,
  GuidedJourneyRoot,
  JourneySceneFrame,
  RuntimeBootstrapGate,
  decisionJourneyScenes,
  scrollToSection,
  useActiveSection,
} from './foundation';
import { LegacyCommandExperience } from './legacy/LegacyCommandExperience';
import { AIAdvisor } from './sections/AIAdvisor/AIAdvisor';
import { Hero } from './sections/Hero/Hero';
import { AuditLeadCapture } from './sections/AuditLeadCapture/AuditLeadCapture';
import { PriorityEngine } from './sections/PriorityEngine/PriorityEngine';
import { PriorityExperienceProvider } from './sections/PriorityEngine/PriorityExperienceProvider';
import { SpatialTerminal } from './sections/SpatialTerminal/SpatialTerminal';
import { WalkthroughProvider } from '../walkthrough';
import { PILOT_FLAGS } from './pilot/pilotVocabulary';

type ClientStudioPageProps = {
  /** LEGACY only — set when CommandRuntime host is explicitly enabled. */
  legacyExperience?: ReactExperienceModel | null;
  onLegacySelectChoice?: (decisionId: string, choiceId: string) => void;
  onLegacyContinue?: () => void;
  /** Shared Runtime from Embed Delivery Layer (optional for standalone SPA). */
  runtime?: DecisionSessionRuntime;
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
}: ClientStudioPageProps) {
  const scenes = decisionJourneyScenes();
  const [revealedSceneCount, setRevealedSceneCount] = useState(1);
  const [pendingSceneId, setPendingSceneId] = useState<string | null>(null);
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);
  const visibleSceneIds = scenes
    .slice(0, revealedSceneCount)
    .map((scene) => scene.id);
  const activeSceneId = useActiveSection(visibleSceneIds);
  const [snapEnabled, setSnapEnabled] = useState(false);

  useEffect(() => {
    if (activeSceneId !== scenes[0]?.id) {
      setSnapEnabled(true);
    }
  }, [activeSceneId, scenes]);

  useEffect(() => {
    if (pendingSceneId === null) {
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      scrollToSection(pendingSceneId);
      setPendingSceneId(null);
    });
    const transitionTimer = window.setTimeout(() => {
      setIsSceneTransitioning(false);
    }, 1000);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(transitionTimer);
    };
  }, [pendingSceneId, revealedSceneCount]);

  const handleSceneNavigate = (sceneId: string) => {
    const nextSceneIndex = scenes.findIndex((scene) => scene.id === sceneId);
    if (nextSceneIndex === -1) {
      return;
    }
    if (sceneId !== scenes[0]?.id) {
      setSnapEnabled(true);
    }
    setIsSceneTransitioning(true);
    setRevealedSceneCount((current) => Math.max(current, nextSceneIndex + 1));
    setPendingSceneId(sceneId);
  };

  return (
    <DecisionAnalyticsProvider>
      <DecisionSessionRuntimeProvider runtime={runtime}>
        <RuntimeBootstrapGate>
          <WalkthroughProvider>
            <GuidedJourneyRoot snapEnabled={snapEnabled && !isSceneTransitioning} />
            <JourneySurfaceObserver />
            <DesktopCanvas>
              <div
                className="relative"
                data-guided-journey="decision-journey"
                data-current-scene={activeSceneId ?? ''}
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
                >
                  <Hero />
                  <ChapterSpacer />
                  <SpatialTerminal />
                </JourneySceneFrame>
                {revealedSceneCount >= 2 ? (
                  <PriorityExperienceProvider>
                    <JourneySceneFrame
                      sceneId={scenes[1]!.id}
                      previousSceneId={scenes[0]?.id}
                      nextSceneId={scenes[2]?.id}
                      onNavigate={handleSceneNavigate}
                      animateOnMount={revealedSceneCount === 2}
                    >
                      <PriorityEngine />
                      {PILOT_FLAGS.showAiAdvisor ? (
                        <>
                          <ChapterSpacer />
                          <AIAdvisor />
                        </>
                      ) : null}
                    </JourneySceneFrame>
                  </PriorityExperienceProvider>
                ) : null}
                {revealedSceneCount >= 3 ? (
                  <JourneySceneFrame
                    sceneId={scenes[2]!.id}
                    previousSceneId={scenes[1]?.id}
                    onNavigate={handleSceneNavigate}
                    animateOnMount={revealedSceneCount === 3}
                  >
                    <AuditLeadCapture />
                  </JourneySceneFrame>
                ) : null}
              </div>
            </DesktopCanvas>
          </WalkthroughProvider>
        </RuntimeBootstrapGate>
      </DecisionSessionRuntimeProvider>
    </DecisionAnalyticsProvider>
  );
}
