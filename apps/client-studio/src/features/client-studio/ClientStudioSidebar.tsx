import { useState } from 'react';

const HOUSE_MENU_ITEMS = [
  'MODERN 01',
  'MODERN 02',
  'MODERN 03',
  'MODERN 04',
  'MODERN 05',
  'MODERN 06',
] as const;

const SIDEBAR_COLLAPSED_WIDTH_PX = 48;
const SIDEBAR_EXPANDED_WIDTH_PX = 220;

/**
 * Hamburger sits on the same vertical axis as the canvas header:
 * canvas `pt-section` (24px) + `h-header` (72px) centered.
 */
export function ClientStudioSidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className="flex h-full min-h-screen shrink-0 flex-col bg-embed-brand-navy transition-[width] duration-200 ease-out"
      style={{
        width: expanded ? SIDEBAR_EXPANDED_WIDTH_PX : SIDEBAR_COLLAPSED_WIDTH_PX,
      }}
    >
      <div
        className={`flex h-header shrink-0 -translate-y-[3px] items-center ${expanded ? 'justify-start px-4' : 'justify-center'}`}
      >
        <button
          type="button"
          aria-label={expanded ? 'Zavřít menu' : 'Otevřít menu'}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="flex flex-col items-center justify-center gap-1.5 p-2"
        >
          <span className="block h-px w-5 bg-embed-background-primary" />
          <span className="block h-px w-5 bg-embed-background-primary" />
          <span className="block h-px w-5 bg-embed-background-primary" />
        </button>
      </div>

      {expanded ? (
        <nav aria-label="Domy" className="mt-section flex flex-col px-2">
          {HOUSE_MENU_ITEMS.map((house) => (
            <button
              key={house}
              type="button"
              className="w-full rounded-md px-3 py-2.5 text-left text-sm tracking-wide text-embed-background-primary transition-opacity duration-150 ease-out hover:bg-embed-background-primary/10 hover:opacity-95"
            >
              {house}
            </button>
          ))}
        </nav>
      ) : null}
    </aside>
  );
}
