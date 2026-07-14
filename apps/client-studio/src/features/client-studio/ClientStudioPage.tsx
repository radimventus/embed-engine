import { ClientStudioHeader } from './ClientStudioHeader';
import { DesktopCanvas } from './DesktopCanvas';
import { AIAdvisor } from './sections/AIAdvisor/AIAdvisor';
import { Hero } from './sections/Hero/Hero';
import { LeadCapture } from './sections/LeadCapture/LeadCapture';
import { PriorityEngine } from './sections/PriorityEngine/PriorityEngine';
import { PropertyExplorer } from './sections/PropertyExplorer/PropertyExplorer';

export function ClientStudioPage() {
  return (
    <DesktopCanvas>
      <ClientStudioHeader />
      <Hero />
      <PropertyExplorer />
      <PriorityEngine />
      <AIAdvisor />
      <LeadCapture />
    </DesktopCanvas>
  );
}
