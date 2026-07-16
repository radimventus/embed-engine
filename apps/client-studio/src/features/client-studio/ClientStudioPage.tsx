import { ClientStudioHeader } from './ClientStudioHeader';
import { DesktopCanvas } from './DesktopCanvas';
import { AIAdvisor } from './sections/AIAdvisor/AIAdvisor';
import { DecisionReportPreview } from './sections/DecisionReportPreview/DecisionReportPreview';
import { Hero } from './sections/Hero/Hero';
import { AuditLeadCapture } from './sections/AuditLeadCapture/AuditLeadCapture';
import { PriorityEngine } from './sections/PriorityEngine/PriorityEngine';
import { PropertyExplorer } from './sections/PropertyExplorer/PropertyExplorer';
import { WalkthroughProvider } from '../walkthrough';

export function ClientStudioPage() {
  return (
    <WalkthroughProvider>
      <DesktopCanvas>
        <ClientStudioHeader />
        <Hero />
        <div
          aria-hidden="true"
          className="h-[30px] w-full shrink-0 bg-embed-background-secondary"
        />
        <PropertyExplorer />
        <PriorityEngine />
        <DecisionReportPreview />
        <AIAdvisor />
        <AuditLeadCapture />
      </DesktopCanvas>
    </WalkthroughProvider>
  );
}
