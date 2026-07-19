import { useRef } from 'react';
import { Runtime, type SceneGraph } from '@embed-engine/core';

import { ClientStudioHeader } from './ClientStudioHeader';
import { DesktopCanvas } from './DesktopCanvas';
import { AIAdvisor } from './sections/AIAdvisor/AIAdvisor';
import { Hero } from './sections/Hero/Hero';
import { AuditLeadCapture } from './sections/AuditLeadCapture/AuditLeadCapture';
import { PriorityEngine } from './sections/PriorityEngine/PriorityEngine';
import { PropertyExplorer } from './sections/PropertyExplorer/PropertyExplorer';
import { WalkthroughProvider } from '../walkthrough';

/** Temporary placeholder — replaced when real Client Studio scene graph is wired. */
const PLACEHOLDER_SCENE_GRAPH: SceneGraph = {
  start: 'start',
  scenes: {
    start: { id: 'start' },
  },
};

export function ClientStudioPage() {
  const runtimeRef = useRef<Runtime | null>(null);

  if (runtimeRef.current === null) {
    runtimeRef.current = new Runtime(PLACEHOLDER_SCENE_GRAPH);
  }

  const runtime = runtimeRef.current;

  return (
    <WalkthroughProvider>
      <DesktopCanvas>
        <ClientStudioHeader />
        <Hero />
        <div aria-hidden="true" className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]" />
        <PropertyExplorer />
        <div aria-hidden="true" className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]" />
        <PriorityEngine runtime={runtime} />
        <div aria-hidden="true" className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]" />
        <AIAdvisor />
        <div aria-hidden="true" className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]" />
        <AuditLeadCapture />
      </DesktopCanvas>
    </WalkthroughProvider>
  );
}
