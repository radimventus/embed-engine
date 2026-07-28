import type { ReactExperienceModel } from '@embed-engine/model';
import type { DecisionSessionRuntime } from '@embed-engine/runtime';

import {
  DecisionAnalyticsProvider,
  JourneySurfaceObserver,
} from './analytics';
import { DecisionSessionRuntimeProvider } from './runtime/DecisionSessionRuntimeProvider';
import { DesktopCanvas } from './DesktopCanvas';
import {
  DecisionJourneyIndicator,
  GuidedJourneyRoot,
  JourneySceneFrame,
  RuntimeBootstrapGate,
  decisionJourneyScenes,
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
import { PILOT_FLAGS, PILOT_SECTION_IDS } from './pilot/pilotVocabulary';

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
  const activeSceneId = useActiveSection(scenes.map((scene) => scene.id));

  return (
    <DecisionAnalyticsProvider>
      <DecisionSessionRuntimeProvider runtime={runtime}>
        <RuntimeBootstrapGate>
          <WalkthroughProvider>
            <GuidedJourneyRoot />
            <JourneySurfaceObserver />
            <DesktopCanvas>
              <div
                className="relative"
                data-guided-journey="decision-journey"
                data-current-scene={activeSceneId ?? ''}
              >
                <DecisionJourneyIndicator
                  scenes={scenes}
                  activeSceneId={activeSceneId}
                />
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
                  sceneId={PILOT_SECTION_IDS.hero}
                  nextSceneId={scenes[1]?.id}
                >
                  <Hero />
                </JourneySceneFrame>
                <JourneySceneFrame
                  sceneId={PILOT_SECTION_IDS.walkthrough}
                  previousSceneId={scenes[0]?.id}
                  nextSceneId={scenes[2]?.id}
                >
                  <SpatialTerminal />
                </JourneySceneFrame>
                <PriorityExperienceProvider>
                  <JourneySceneFrame
                    sceneId={PILOT_SECTION_IDS.priority}
                    previousSceneId={scenes[1]?.id}
                    nextSceneId={PILOT_FLAGS.showAiAdvisor ? scenes[3]?.id : scenes.at(-1)?.id}
                  >
                    <PriorityEngine />
                  </JourneySceneFrame>
                  {PILOT_FLAGS.showAiAdvisor ? (
                    <JourneySceneFrame
                      sceneId={PILOT_SECTION_IDS.aiAdvisor}
                      previousSceneId={scenes[2]?.id}
                      nextSceneId={scenes[4]?.id}
                    >
                      <AIAdvisor />
                    </JourneySceneFrame>
                  ) : null}
                </PriorityExperienceProvider>
                <JourneySceneFrame
                  sceneId={PILOT_SECTION_IDS.audit}
                  previousSceneId={scenes.at(-2)?.id}
                >
                  <AuditLeadCapture />
                </JourneySceneFrame>
              </div>
            </DesktopCanvas>
          </WalkthroughProvider>
        </RuntimeBootstrapGate>
      </DecisionSessionRuntimeProvider>
    </DecisionAnalyticsProvider>
  );
}
