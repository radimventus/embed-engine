import type { ReactExperienceModel } from '@embed-engine/model';

import { DecisionSessionRuntimeProvider } from './runtime/DecisionSessionRuntimeProvider';
import { DesktopCanvas } from './DesktopCanvas';
import {
  ChapterSpacer,
  RuntimeBootstrapGate,
} from './foundation';
import { LegacyCommandExperience } from './legacy/LegacyCommandExperience';
import { AIAdvisor } from './sections/AIAdvisor/AIAdvisor';
import { Hero } from './sections/Hero/Hero';
import { AuditLeadCapture } from './sections/AuditLeadCapture/AuditLeadCapture';
import { PriorityEngine } from './sections/PriorityEngine/PriorityEngine';
import { PriorityExperienceProvider } from './sections/PriorityEngine/PriorityExperienceProvider';
import { PropertyExplorer } from './sections/PropertyExplorer/PropertyExplorer';
import { SpatialTerminal } from './sections/SpatialTerminal/SpatialTerminal';
import { WalkthroughProvider } from '../walkthrough';
import { PILOT_FLAGS } from './pilot/pilotVocabulary';

type ClientStudioPageProps = {
  /** LEGACY only — set when CommandRuntime host is explicitly enabled. */
  legacyExperience?: ReactExperienceModel | null;
  onLegacySelectChoice?: (decisionId: string, choiceId: string) => void;
  onLegacyContinue?: () => void;
};

/**
 * Decision Session Experience host (ED-DA-04 / CSCB-01).
 *
 * Provider tree is Context transport only:
 * DecisionSessionRuntimeProvider → WalkthroughProvider → PriorityExperienceProvider.
 * Cognitive Interpretation / Story providers are not mounted on the live path.
 *
 * Runtime is bootstrapped exactly once via DecisionSessionRuntimeProvider.
 */
export function ClientStudioPage({
  legacyExperience = null,
  onLegacySelectChoice,
  onLegacyContinue,
}: ClientStudioPageProps) {
  return (
    <DecisionSessionRuntimeProvider>
      <RuntimeBootstrapGate>
        <WalkthroughProvider>
          <DesktopCanvas>
            {legacyExperience !== null &&
            onLegacySelectChoice !== undefined &&
            onLegacyContinue !== undefined ? (
              <LegacyCommandExperience
                experience={legacyExperience}
                onSelectChoice={onLegacySelectChoice}
                onContinue={onLegacyContinue}
              />
            ) : null}
            <Hero />
            <ChapterSpacer />
            <PropertyExplorer />
            <ChapterSpacer />
            <SpatialTerminal />
            <ChapterSpacer />
            <PriorityExperienceProvider>
              <PriorityEngine />
              {PILOT_FLAGS.showAiAdvisor ? (
                <>
                  <ChapterSpacer />
                  <AIAdvisor />
                </>
              ) : null}
            </PriorityExperienceProvider>
            <ChapterSpacer />
            <AuditLeadCapture />
          </DesktopCanvas>
        </WalkthroughProvider>
      </RuntimeBootstrapGate>
    </DecisionSessionRuntimeProvider>
  );
}
