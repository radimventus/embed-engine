import type { Runtime } from '@embed-engine/core';
import type { ReactExperienceModel } from '@embed-engine/model';

import { DecisionStoryProvider } from './cognitive/DecisionStoryProvider';
import { ExperienceBindingProvider } from './cognitive/ExperienceBindingProvider';
import { InterpretationProvider } from './cognitive/InterpretationProvider';
import { ClientStudioHeader } from './ClientStudioHeader';
import { DesktopCanvas } from './DesktopCanvas';
import { LegacyCommandExperience } from './legacy/LegacyCommandExperience';
import { AIAdvisor } from './sections/AIAdvisor/AIAdvisor';
import { Hero } from './sections/Hero/Hero';
import { AuditLeadCapture } from './sections/AuditLeadCapture/AuditLeadCapture';
import { PriorityEngine } from './sections/PriorityEngine/PriorityEngine';
import { PriorityExperienceProvider } from './sections/PriorityEngine/PriorityExperienceProvider';
import { PropertyExplorer } from './sections/PropertyExplorer/PropertyExplorer';
import { WalkthroughProvider } from '../walkthrough';

type ClientStudioPageProps = {
  cognitiveRuntime: Runtime | null;
  /** LEGACY only — set when CommandRuntime host is explicitly enabled. */
  legacyExperience?: ReactExperienceModel | null;
  onLegacySelectChoice?: (decisionId: string, choiceId: string) => void;
  onLegacyContinue?: () => void;
};

/**
 * Cognitive Experience host (RI-003).
 * Surfaces read Session snapshots via ExperienceBindingProvider only.
 * Priority → Experience presentation shared via PriorityExperienceProvider.
 */
export function ClientStudioPage({
  cognitiveRuntime,
  legacyExperience = null,
  onLegacySelectChoice,
  onLegacyContinue,
}: ClientStudioPageProps) {
  return (
    <ExperienceBindingProvider runtime={cognitiveRuntime}>
      <InterpretationProvider>
        <DecisionStoryProvider>
          <WalkthroughProvider>
            <DesktopCanvas>
              <ClientStudioHeader />
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
              <div
                aria-hidden="true"
                className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]"
              />
              <PropertyExplorer />
              <div
                aria-hidden="true"
                className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]"
              />
              <PriorityExperienceProvider>
                <PriorityEngine />
                <div
                  aria-hidden="true"
                  className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]"
                />
                <AIAdvisor />
              </PriorityExperienceProvider>
              <div
                aria-hidden="true"
                className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]"
              />
              <AuditLeadCapture />
            </DesktopCanvas>
          </WalkthroughProvider>
        </DecisionStoryProvider>
      </InterpretationProvider>
    </ExperienceBindingProvider>
  );
}
