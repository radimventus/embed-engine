import { ClientStudioHeader } from './ClientStudioHeader';
import { DesktopCanvas } from './DesktopCanvas';
import { AIAdvisor } from './sections/AIAdvisor/AIAdvisor';
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
        <PropertyExplorer />
        <PriorityEngine />
        <AIAdvisor />
        <AuditLeadCapture />
      </DesktopCanvas>
    </WalkthroughProvider>
  );
}
