import type { ReactNode } from 'react';

import { PlatformStatusBadge } from '@embed-engine/platform-shell';

type WorkspaceProps = {
  readonly children?: ReactNode;
};

/**
 * PR-001 / PR-002 — Manager title-bar dle HTML click modelu.
 */
export function Workspace({ children }: WorkspaceProps) {
  return (
    <main className="platform-studio-pad mx-auto w-full max-w-[1520px]">
      <header className="platform-title-bar">
        <div>
          <h1 className="platform-type-h1">Manager Studio</h1>
          <p className="platform-type-helper" style={{ marginTop: 4 }}>
            Analýza konverzního trychtýře a klíčových rozhodovacích faktorů
            zákazníků.
          </p>
        </div>
        <PlatformStatusBadge tone="info">Živá data z Runtime</PlatformStatusBadge>
      </header>
      {children}
    </main>
  );
}
