import type { ReactNode } from 'react';

import { HeaderHoverMenu } from './HeaderHoverMenu';

type HeaderSaveMenuProps = {
  readonly icon: ReactNode;
};

const PDF_HINT =
  'Doporučujeme nejprve nastavit priority ve střední části stránky, aby export obsahoval vaše preference.';

/**
 * Print / Save-as-PDF for the current Experience page (CAP UX 57).
 * Browser print dialog is the delivery path until Builder owns export.
 */
export function exportExperiencePageAsPdf(): void {
  window.print();
}

/**
 * Uložit — hover panel with PDF action (CAP UX 57).
 */
export function HeaderSaveMenu({ icon }: HeaderSaveMenuProps) {
  return (
    <HeaderHoverMenu label="Uložit" icon={icon} panelTestId="header-save-panel">
      <button
        type="button"
        role="menuitem"
        className="w-full cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-semibold underline decoration-white/50 underline-offset-2 hover:decoration-white"
        style={{
          borderStyle: 'none',
          backgroundColor: 'transparent',
          color: '#FFFFFF',
        }}
        onClick={() => {
          exportExperiencePageAsPdf();
        }}
      >
        Uložit tuto stránku jako PDF
      </button>
      <p className="mt-2.5 text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.8)' }}>
        {PDF_HINT}
      </p>
    </HeaderHoverMenu>
  );
}
