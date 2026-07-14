import { ClientStudioHeader } from './ClientStudioHeader';
import { AIAdvisor } from './sections/AIAdvisor/AIAdvisor';
import { Hero } from './sections/Hero/Hero';
import { HouseNavigator } from './sections/HouseNavigator/HouseNavigator';
import { LeadCapture } from './sections/LeadCapture/LeadCapture';
import { MediaExplorer } from './sections/MediaExplorer/MediaExplorer';
import { PriorityEngine } from './sections/PriorityEngine/PriorityEngine';

export function ClientStudioPage() {
  return (
    <div className="min-h-full bg-embed-background-secondary p-3 md:p-6">
      <div className="mx-auto max-w-6xl border border-embed-border-default bg-embed-background-primary">
        <ClientStudioHeader />
        <Hero />
        <MediaExplorer />
        <HouseNavigator />
        <PriorityEngine />
        <AIAdvisor />
        <LeadCapture />
      </div>
    </div>
  );
}
