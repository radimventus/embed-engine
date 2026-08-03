import type { ReactNode } from 'react';

import type { StudioBrandProjection } from '@embed-engine/platform-access';
import { PlatformStatusBadge } from '@embed-engine/platform-shell';

type WorkspaceProps = {
  readonly brand?: StudioBrandProjection;
  readonly children?: ReactNode;
};

/**
 * PR-001 / PR-002 — Manager title-bar dle HTML click modelu.
 * PE-02 — partner company / hero cue from Brand Projection.
 */
export function Workspace({ brand, children }: WorkspaceProps) {
  return (
    <main className="platform-studio-pad mx-auto w-full max-w-[1520px]">
      <header className="platform-title-bar">
        <div>
          <h1 className="platform-type-h1">Manager Studio</h1>
          <p
            className="platform-type-helper"
            style={{ marginTop: 4 }}
            data-testid="manager-partner-brand"
          >
            {brand !== undefined
              ? `${brand.companyName} · ${brand.heroLabel}`
              : 'Analýza konverzního trychtýře a klíčových rozhodovacích faktorů zákazníků.'}
          </p>
        </div>
        <PlatformStatusBadge tone="info">
          Živá data z provozního jádra
        </PlatformStatusBadge>
      </header>
      {children}
    </main>
  );
}
