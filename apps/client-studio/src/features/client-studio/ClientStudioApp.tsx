import { useState } from 'react';
import type { DecisionSessionRuntime } from '@embed-engine/runtime';

import { AppShell } from '../../components/layout/AppShell';
import { ClientStudioHeader } from './ClientStudioHeader';
import { ClientStudioPage } from './ClientStudioPage';
import { ClientStudioSidebar } from './ClientStudioSidebar';
import { LegacyCommandRuntimeHost } from './legacy/LegacyCommandRuntimeHost';
import { isLegacyCommandRuntimeEnabled } from './legacy/isLegacyCommandRuntimeEnabled';

type ClientStudioAppProps = {
  /**
   * Optional Runtime injected by Embed Delivery Layer.
   * When omitted (standalone SPA), the Provider creates the Runtime once.
   */
  readonly runtime?: DecisionSessionRuntime;
};

/**
 * Composition root for Client Studio (ED-DA-04 / CSCB-01).
 *
 * Single AppShell entry for the default Decision Session path.
 * Legacy CommandRuntime is unreachable unless explicitly enabled.
 */
export function ClientStudioApp({ runtime }: ClientStudioAppProps = {}) {
  const [legacyEnabled] = useState(() => isLegacyCommandRuntimeEnabled());

  if (legacyEnabled) {
    return <LegacyCommandRuntimeHost />;
  }

  return (
    <AppShell
      sidebar={<ClientStudioSidebar />}
      header={<ClientStudioHeader />}
      showStatusBar={false}
    >
      <ClientStudioPage runtime={runtime} />
    </AppShell>
  );
}
