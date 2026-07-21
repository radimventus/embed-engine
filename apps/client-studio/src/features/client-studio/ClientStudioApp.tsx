import { useEffect, useRef, useState } from 'react';
import type { Runtime } from '@embed-engine/core';
import { createRuntime } from '@embed-engine/core';
import { createDispositionLayoutComposer } from '@embed-engine/object-house';

import { AppShell } from '../../components/layout/AppShell';
import { ClientStudioPage } from './ClientStudioPage';
import { ClientStudioSidebar } from './ClientStudioSidebar';
import { LegacyCommandRuntimeHost } from './legacy/LegacyCommandRuntimeHost';
import { isLegacyCommandRuntimeEnabled } from './legacy/isLegacyCommandRuntimeEnabled';

/**
 * Composition root for Client Studio (S-002).
 *
 * Default: Cognitive Runtime only (RI-001 → Experience Binding → Surfaces).
 * Legacy CommandRuntime is unreachable unless explicitly enabled.
 */
export function ClientStudioApp() {
  const cognitiveRuntimeRef = useRef<Runtime | null>(null);
  const [cognitiveReady, setCognitiveReady] = useState(false);
  const [legacyEnabled] = useState(() => isLegacyCommandRuntimeEnabled());

  if (cognitiveRuntimeRef.current === null) {
    cognitiveRuntimeRef.current = createRuntime({
      storyComposer: createDispositionLayoutComposer(),
    });
  }

  const cognitiveRuntime = cognitiveRuntimeRef.current;

  useEffect(() => {
    let cancelled = false;

    void cognitiveRuntime.load({ objectId: 'house-modern-01' }).then(() => {
      if (!cancelled) {
        setCognitiveReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cognitiveRuntime]);

  if (legacyEnabled) {
    return (
      <LegacyCommandRuntimeHost
        cognitiveRuntime={cognitiveReady ? cognitiveRuntime : null}
      />
    );
  }

  return (
    <AppShell
      sidebar={<ClientStudioSidebar />}
      showStatusBar={false}
      header={<></>}
    >
      <ClientStudioPage cognitiveRuntime={cognitiveReady ? cognitiveRuntime : null} />
    </AppShell>
  );
}
