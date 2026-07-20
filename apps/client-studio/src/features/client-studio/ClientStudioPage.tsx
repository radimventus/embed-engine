import type { Runtime } from '@embed-engine/core';
import type { ReactExperienceModel } from '@embed-engine/model';

import { CognitiveRuntimeProvider } from './cognitive/CognitiveRuntimeContext';
import { ClientStudioHeader } from './ClientStudioHeader';
import { DesktopCanvas } from './DesktopCanvas';
import { HouseDecisionExperience } from './house-decision/HouseDecisionExperience';
import { AIAdvisor } from './sections/AIAdvisor/AIAdvisor';
import { Hero } from './sections/Hero/Hero';
import { AuditLeadCapture } from './sections/AuditLeadCapture/AuditLeadCapture';
import { PriorityEngine } from './sections/PriorityEngine/PriorityEngine';
import { PropertyExplorer } from './sections/PropertyExplorer/PropertyExplorer';
import { WalkthroughProvider } from '../walkthrough';

type ClientStudioPageProps = {
  cognitiveRuntime: Runtime | null;
  experience: ReactExperienceModel | null;
  onSelectChoice: (decisionId: string, choiceId: string) => void;
  onContinue: () => void;
};

export function ClientStudioPage({
  cognitiveRuntime,
  experience,
  onSelectChoice,
  onContinue,
}: ClientStudioPageProps) {
  return (
    <CognitiveRuntimeProvider runtime={cognitiveRuntime}>
      <WalkthroughProvider>
        <DesktopCanvas>
          <ClientStudioHeader />
          {experience ? (
            <>
              <HouseDecisionExperience
                experience={experience}
                onSelectChoice={onSelectChoice}
                onContinue={onContinue}
              />
              <div
                aria-hidden="true"
                className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]"
              />
            </>
          ) : null}
          <Hero />
          <div aria-hidden="true" className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]" />
          <PropertyExplorer />
          <div aria-hidden="true" className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]" />
          {cognitiveRuntime ? <PriorityEngine runtime={cognitiveRuntime} /> : null}
          <div aria-hidden="true" className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]" />
          <AIAdvisor />
          <div aria-hidden="true" className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]" />
          <AuditLeadCapture />
        </DesktopCanvas>
      </WalkthroughProvider>
    </CognitiveRuntimeProvider>
  );
}
