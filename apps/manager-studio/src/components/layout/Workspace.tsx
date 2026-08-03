import type { ReactNode } from 'react';

import type { StudioBrandProjection } from '@embed-engine/platform-access';
import { PlatformStatusBadge } from '@embed-engine/platform-shell';

type WorkspaceProps = {
  readonly brand?: StudioBrandProjection;
  /** PE-03 — sample project label from Pilot Workspace when ready. */
  readonly sampleProjectLabel?: string;
  readonly children?: ReactNode;
};

/**
 * PR-001 / PR-002 — Manager title-bar dle HTML click modelu.
 * PE-02 — partner company / hero cue from Brand Projection.
 * PE-03 — Pilot Workspace sample project cue when provisioned.
 */
export function Workspace({
  brand,
  sampleProjectLabel,
  children,
}: WorkspaceProps) {
  const helper =
    brand !== undefined
      ? sampleProjectLabel !== undefined
        ? `${brand.companyName} · ${brand.heroLabel} · ${sampleProjectLabel}`
        : `${brand.companyName} · ${brand.heroLabel}`
      : sampleProjectLabel !== undefined
        ? `Pilot Workspace · ${sampleProjectLabel}`
        : 'Analýza konverzního trychtýře a klíčových rozhodovacích faktorů zákazníků.';

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
            {helper}
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
