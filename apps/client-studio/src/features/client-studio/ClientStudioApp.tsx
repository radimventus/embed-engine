import { useState } from 'react';

import { AppShell } from '../../components/layout/AppShell';
import { ClientStudioPage } from './ClientStudioPage';
import { ClientStudioSidebar } from './ClientStudioSidebar';
import { LegacyCommandRuntimeHost } from './legacy/LegacyCommandRuntimeHost';
import { isLegacyCommandRuntimeEnabled } from './legacy/isLegacyCommandRuntimeEnabled';

/**
 * Composition root for Client Studio (ED-DA-04).
 *
 * Default: Decision Session Runtime Context Providers only.
 * Legacy CommandRuntime is unreachable unless explicitly enabled.
 */
export function ClientStudioApp() {
  const [legacyEnabled] = useState(() => isLegacyCommandRuntimeEnabled());

  if (legacyEnabled) {
    return <LegacyCommandRuntimeHost />;
  }

  return (
    <AppShell
      sidebar={<ClientStudioSidebar />}
      showStatusBar={false}
      header={<></>}
    >
      <ClientStudioPage />
    </AppShell>
  );
}
