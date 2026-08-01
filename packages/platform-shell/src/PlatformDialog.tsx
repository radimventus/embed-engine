import { createPortal } from 'react-dom';
import {
  useEffect,
  useId,
  useRef,
  type FormEvent,
  type ReactNode,
} from 'react';

type PlatformDialogProps = {
  readonly open: boolean;
  readonly title: string;
  readonly description?: string;
  readonly children?: ReactNode;
  readonly primaryLabel: string;
  readonly secondaryLabel?: string;
  readonly busy?: boolean;
  readonly primaryDisabled?: boolean;
  readonly onClose: () => void;
  readonly onPrimary: () => void;
  /** Defaults to `onClose` (secondary ≠ close when set — e.g. Discard vs Cancel). */
  readonly onSecondary?: () => void;
  /** When true, primary action submits an inner form. */
  readonly asForm?: boolean;
};

/**
 * VR-FIX-03 / PR-003B — Dialog portaled to document.body (opaque overlay).
 */
export function PlatformDialog({
  open,
  title,
  description,
  children,
  primaryLabel,
  secondaryLabel = 'Zrušit',
  busy = false,
  primaryDisabled = false,
  onClose,
  onPrimary,
  onSecondary,
  asForm = false,
}: PlatformDialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.activeElement as HTMLElement | null;
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [open, busy, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const runPrimary = () => {
    if (!busy && !primaryDisabled) {
      onPrimary();
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    runPrimary();
  };

  const header = (
    <div className="platform-dialog__header">
      <div>
        <h2 id={titleId} className="platform-dialog__title">
          {title}
        </h2>
        {description !== undefined && description.length > 0 && (
          <p id={descId} className="platform-dialog__desc">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        className="platform-dialog__close"
        aria-label="Zavřít"
        disabled={busy}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );

  const runSecondary = () => {
    if (!busy) {
      (onSecondary ?? onClose)();
    }
  };

  const actions = (
    <div className="platform-dialog__actions">
      <button
        type="button"
        className="platform-btn"
        disabled={busy}
        onClick={runSecondary}
      >
        {secondaryLabel}
      </button>
      <button
        type={asForm ? 'submit' : 'button'}
        className="platform-btn platform-btn--primary"
        disabled={busy || primaryDisabled}
        onClick={asForm ? undefined : runPrimary}
      >
        {primaryLabel}
      </button>
    </div>
  );

  const node = (
    <div
      className="platform-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={
          description !== undefined && description.length > 0
            ? descId
            : undefined
        }
        className="platform-dialog"
      >
        {asForm ? (
          <form onSubmit={handleSubmit}>
            {header}
            {children !== undefined && children !== null && (
              <div className="platform-dialog__body">{children}</div>
            )}
            {actions}
          </form>
        ) : (
          <>
            {header}
            {children !== undefined && children !== null && (
              <div className="platform-dialog__body">{children}</div>
            )}
            {actions}
          </>
        )}
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
