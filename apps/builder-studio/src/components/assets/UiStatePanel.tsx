import type { ReactNode } from 'react';

import { PlatformEmptyState, PlatformLoading } from '@embed-engine/platform-shell';

import type { AssetUiState } from '../../model';

type UiStatePanelProps = {
  readonly state: AssetUiState;
  readonly emptyMessage?: string;
  readonly errorMessage?: string;
  readonly children?: ReactNode;
};

/**
 * VR-FIX-06 — Asset collection states via Platform Shell grammar.
 */
export function UiStatePanel({
  state,
  emptyMessage = 'Zatím žádné soubory. Nahrajte první asset.',
  errorMessage = 'Kategorii se nepodařilo načíst. Zkuste to znovu.',
  children,
}: UiStatePanelProps) {
  if (state === 'Loading') {
    return <PlatformLoading label="Načítám soubory…" />;
  }

  if (state === 'Error') {
    return (
      <div className="space-y-3">
        <PlatformEmptyState
          icon="!"
          title="Chyba načtení"
          description={errorMessage}
        />
        {children}
      </div>
    );
  }

  if (state === 'Empty') {
    return (
      <PlatformEmptyState
        title="Žádné soubory"
        description={emptyMessage}
      />
    );
  }

  return <>{children}</>;
}
