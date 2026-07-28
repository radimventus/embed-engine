import type { ReactNode } from 'react';

import type { AssetUiState } from '../../model';

type UiStatePanelProps = {
  readonly state: AssetUiState;
  readonly emptyMessage?: string;
  readonly errorMessage?: string;
  readonly children?: ReactNode;
};

/**
 * Presentational UI state shell for asset collections.
 */
export function UiStatePanel({
  state,
  emptyMessage = 'Zatím žádné soubory. Nahrajte první asset.',
  errorMessage = 'Kategorie je ve stavu Error (mock).',
  children,
}: UiStatePanelProps) {
  if (state === 'Loading') {
    return (
      <div className="rounded-[10px] border border-dashed border-builder-panelBorder bg-builder-panel/40 px-4 py-6 text-sm text-builder-navy">
        Načítání mock dat…
      </div>
    );
  }

  if (state === 'Error') {
    return (
      <div className="space-y-3">
        <div className="rounded-[10px] border border-builder-draftBorder bg-builder-draftBg px-4 py-3 text-sm text-builder-draft">
          {errorMessage}
        </div>
        {children}
      </div>
    );
  }

  if (state === 'Empty') {
    return (
      <div className="rounded-[10px] border border-dashed border-builder-sectionBorder bg-white px-4 py-6 text-sm text-builder-muted">
        {emptyMessage}
      </div>
    );
  }

  return <>{children}</>;
}
