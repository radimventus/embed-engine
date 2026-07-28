import { useState, type ReactNode } from 'react';
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

/**
 * Header action with hover panel. Leave the whole control to dismiss.
 */
export function HeaderHoverMenu({
  label,
  icon,
  panelTestId,
  children,
}: HeaderHoverMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      data-header-hover-menu={label}
    >
      <button
        type="button"
        className={TRIGGER_CLASS}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {icon}
        <span>{label}</span>
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
