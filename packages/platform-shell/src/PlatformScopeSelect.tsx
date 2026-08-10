import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

export type PlatformScopeSelectOption = {
  readonly value: string;
  readonly label: string;
};

type PlatformScopeSelectProps = {
  readonly value: string;
  readonly options: readonly PlatformScopeSelectOption[];
  readonly onChange: (value: string) => void;
  readonly ariaLabel: string;
  readonly disabled?: boolean;
};

/**
 * Deterministic, keyboard-accessible scope selector.
 * The options panel is anchored below the trigger rather than using a native
 * select popup, so the experience is consistent across Studio sidebars.
 */
export function PlatformScopeSelect({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
}: PlatformScopeSelectProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const selectedOption = options[selectedIndex] ?? null;

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const openAtSelectedOption = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const selectOption = (index: number) => {
    const option = options[index];
    if (option === undefined) return;
    onChange(option.value);
    close();
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (
        rootRef.current !== null &&
        !rootRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) {
        selectOption(activeIndex);
      } else {
        openAtSelectedOption();
      }
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    if (!open) {
      openAtSelectedOption();
      return;
    }
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    setActiveIndex((index) =>
      Math.min(Math.max(index + direction, 0), options.length - 1),
    );
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', width: '100%' }}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-activedescendant={
          open ? `${listboxId}-option-${activeIndex}` : undefined
        }
        disabled={disabled}
        onClick={() => (open ? close() : openAtSelectedOption())}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          display: 'flex',
          width: '100%',
          height: 44,
          alignItems: 'center',
          justifyContent: 'space-between',
          border: `1px solid ${
            focused || open ? 'var(--platform-blue)' : 'var(--platform-line)'
          }`,
          borderRadius: 12,
          background: 'var(--platform-surface)',
          padding: '0 14px',
          color: 'var(--platform-navy)',
          font: 'inherit',
          fontSize: 14,
          fontWeight: 600,
          textAlign: 'left',
          boxShadow:
            focused || open
              ? '0 0 0 1px var(--platform-blue)'
              : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <span>{selectedOption?.label ?? '—'}</span>
        <svg
          aria-hidden
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            zIndex: 20,
            width: '100%',
            overflow: 'hidden',
            border: '1px solid var(--platform-line)',
            borderRadius: 12,
            background: 'var(--platform-surface)',
            boxShadow: '0 4px 12px rgba(0, 25, 48, 0.1)',
          }}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            const active = index === activeIndex;
            return (
              <div
                id={`${listboxId}-option-${index}`}
                key={option.value}
                role="option"
                aria-selected={selected}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
                style={{
                  display: 'flex',
                  minHeight: 40,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  background:
                    active || selected
                      ? 'var(--platform-cream-light)'
                      : 'var(--platform-surface)',
                  padding: '0 14px',
                  color: 'var(--platform-navy)',
                  fontSize: 14,
                  fontWeight: selected ? 700 : 600,
                  cursor: 'pointer',
                }}
              >
                {option.label}
                {selected ? <span aria-hidden>✓</span> : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
