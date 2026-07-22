import type { ReactExperienceModel } from '@embed-engine/model';

import { DecisionSessionRuntimeProvider } from './runtime/DecisionSessionRuntimeProvider';
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
  /** LEGACY only — set when CommandRuntime host is explicitly enabled. */
  legacyExperience?: ReactExperienceModel | null;
  onLegacySelectChoice?: (decisionId: string, choiceId: string) => void;
  onLegacyContinue?: () => void;
};

/**
 * Decision Session Experience host (ED-DA-04).
 *
 * Provider tree is Context transport only:
 * DecisionSessionRuntimeProvider → WalkthroughProvider → PriorityExperienceProvider.
 * Cognitive Interpretation / Story providers are not mounted on the live path.
 */
export function ClientStudioPage({
  legacyExperience = null,
  onLegacySelectChoice,
  onLegacyContinue,
}: ClientStudioPageProps) {
  return (
    <DecisionSessionRuntimeProvider>
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
    </DecisionSessionRuntimeProvider>
  );
}
