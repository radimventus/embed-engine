import { useEffect, useRef, useState, type ReactNode } from 'react';
import { palette } from '@embed-engine/design-tokens';

type HeaderHoverMenuProps = {
  readonly label: string;
  readonly icon: ReactNode;
  readonly panelTestId: string;
  readonly children: ReactNode;
};

/** Navy panel @ 70% — stays open across button → panel hover (CAP UX 57). */
const PANEL_BG = `rgba(0, 25, 48, 0.7)`;

const TRIGGER_CLASS =
  'inline-flex items-center gap-2 text-sm text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4 transition-colors hover:text-embed-brand-navy hover:decoration-embed-brand-navy';

function canHover(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
}

/**
 * Header action with hover panel (desktop) and tap toggle (touch).
 * Leave the whole control to dismiss on fine pointers.
 */
export function HeaderHoverMenu({
  label,
  icon,
  panelTestId,
  children,
}: HeaderHoverMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root !== null && !root.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        if (canHover()) {
          setOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (canHover()) {
          setOpen(false);
        }
      }}
      data-header-hover-menu={label}
    >
      <button
        type="button"
        className={TRIGGER_CLASS}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => {
          if (!canHover()) {
            setOpen((current) => !current);
          }
        }}
      >
        {icon}
        <span className="mobile:sr-only">{label}</span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-[60] min-w-[260px] pt-2"
          role="presentation"
        >
          <div
            role="menu"
            data-testid={panelTestId}
            className="rounded-[8px] px-4 py-3 text-left shadow-[0_8px_24px_rgba(0,25,48,0.18)]"
            style={{
              backgroundColor: PANEL_BG,
              color: palette.pureWhite,
              borderRadius: 8,
            }}
          >
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}
