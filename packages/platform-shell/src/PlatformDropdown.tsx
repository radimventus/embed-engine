import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

type DropdownProps = {
  readonly label: ReactNode;
  readonly ariaLabel: string;
  readonly align?: 'left' | 'right';
  readonly children: ReactNode;
};

export function PlatformDropdown({
  label,
  ariaLabel,
  align = 'left',
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

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
    <div className="platform-dropdown" ref={rootRef}>
      <button
        type="button"
        className="platform-menu-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <span className="platform-menu-button__chevron" aria-hidden>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div
          id={listId}
          role="menu"
          className={`platform-menu-panel${align === 'right' ? ' platform-menu-panel--right' : ''}`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}
