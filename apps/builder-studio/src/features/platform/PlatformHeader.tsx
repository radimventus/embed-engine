import { useEffect, useId, useRef, useState } from 'react';

import {
  ACTIVE_PLATFORM_STUDIO_ID,
  PLATFORM_STUDIOS,
  type PlatformStudioId,
} from './platformStudios';

type PlatformHeaderProps = {
  readonly activeStudioId?: PlatformStudioId;
  readonly userLabel?: string;
};

/**
 * EPIC-BX-01 — shared Platform Header (Click Model).
 * Studio switcher opens from the active Studio label.
 */
export function PlatformHeader({
  activeStudioId = ACTIVE_PLATFORM_STUDIO_ID,
  userLabel = 'uživatel',
}: PlatformHeaderProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const active =
    PLATFORM_STUDIOS.find((studio) => studio.id === activeStudioId) ??
    PLATFORM_STUDIOS[0];

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (
        rootRef.current !== null &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <header className="flex h-builder-header shrink-0 items-center justify-between border-b border-builder-lineSoft bg-white px-[30px]">
      <div className="flex items-center gap-6" ref={rootRef}>
        <p className="text-2xl font-bold tracking-tight text-builder-ink">
          CONIS
        </p>
        <div className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-2 rounded-[10px] border border-transparent px-2.5 py-1.5 text-sm font-semibold text-builder-ink hover:border-builder-line hover:bg-builder-hover"
          >
            <span className="text-builder-muted" aria-hidden>
              {open ? '▲' : '▼'}
            </span>
            <span>{active.label}</span>
          </button>
          {open && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Studia"
              className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[220px] overflow-hidden rounded-[12px] border border-builder-line bg-white py-1 shadow-[0_12px_32px_rgba(35,51,76,0.12)]"
            >
              {PLATFORM_STUDIOS.map((studio) => {
                const isActive = studio.id === activeStudioId;
                return (
                  <li key={studio.id} role="option" aria-selected={isActive}>
                    {studio.available && studio.href !== null && !isActive ? (
                      <a
                        href={studio.href}
                        className="block px-4 py-2.5 text-sm font-medium text-builder-ink hover:bg-builder-panel"
                        onClick={() => setOpen(false)}
                      >
                        {studio.label}
                      </a>
                    ) : (
                      <span
                        className={`block px-4 py-2.5 text-sm font-medium ${
                          isActive
                            ? 'bg-builder-panel text-builder-navy'
                            : 'cursor-not-allowed text-builder-muted'
                        }`}
                        title={
                          !studio.available
                            ? 'Studio zatím není dostupné'
                            : undefined
                        }
                      >
                        {studio.label}
                        {isActive ? ' · aktivní' : ''}
                        {!studio.available ? ' · brzy' : ''}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-builder-muted">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-builder-panel text-[12px] font-semibold text-builder-navy"
          aria-hidden
        >
          {userLabel.slice(0, 1).toUpperCase()}
        </span>
        <span className="font-medium text-builder-ink">{userLabel}</span>
      </div>
    </header>
  );
}
