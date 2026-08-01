import type { ReactNode } from 'react';

import { PlatformEmptyState, PlatformStatusBadge } from '@embed-engine/platform-shell';
import { usePlatformSession } from '@embed-engine/platform-access';

type WorkspaceProps = {
  readonly children?: ReactNode;
};

/**
 * VR-FIX-06 — Manager working surface + click-model title-bar.
 */
export function Workspace({ children }: WorkspaceProps) {
  const { bootstrap } = usePlatformSession();
  const projectName = bootstrap?.project?.name ?? 'Projekt';
  const companyName = bootstrap?.company.name ?? 'Firma';

  return (
    <main className="platform-studio-pad mx-auto w-full max-w-[1520px]">
      <header className="platform-title-bar">
        <div>
          <h1 className="platform-type-h1">Manager Studio</h1>
          <p className="platform-type-helper" style={{ marginTop: 4 }}>
            {companyName} · {projectName}
          </p>
        </div>
        <PlatformStatusBadge tone="info">Živá data z Runtime</PlatformStatusBadge>
      </header>
      {children ?? (
        <PlatformEmptyState
          title="Vyberte modul"
          description="Navigace vlevo otevře Launch, Platformu, Zákazníky nebo Provoz."
        />
      )}
    </main>
  );
}
