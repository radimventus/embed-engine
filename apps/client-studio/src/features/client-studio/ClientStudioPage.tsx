import { ClientStudioHeader } from './ClientStudioHeader';
import { DesktopCanvas } from './DesktopCanvas';
import { AIAdvisor } from './sections/AIAdvisor/AIAdvisor';
import { Hero } from './sections/Hero/Hero';
import { HouseNavigator } from './sections/HouseNavigator/HouseNavigator';
import { LeadCapture } from './sections/LeadCapture/LeadCapture';
import { MediaExplorer } from './sections/MediaExplorer/MediaExplorer';
import { PriorityEngine } from './sections/PriorityEngine/PriorityEngine';

export function ClientStudioPage() {
  return (
    <DesktopCanvas>
      <ClientStudioHeader />
      <Hero />
      <MediaExplorer />
      <HouseNavigator />
      <PriorityEngine />
      <AIAdvisor />
      <LeadCapture />
    </DesktopCanvas>
  );
}
