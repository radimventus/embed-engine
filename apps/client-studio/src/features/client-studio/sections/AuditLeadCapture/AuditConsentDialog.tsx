import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { AUDIT_ACCENT, AUDIT_ON_ACCENT } from './audit-panel';

type AuditConsentDialogProps = {
  readonly open: boolean;
  readonly privacyHref?: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
};

/** Audit-scoped use of the CONIS modal pattern: portaled, dimmed and focus-restoring. */
export function AuditConsentDialog({
  open,
  privacyHref,
  onCancel,
  onConfirm,
}: AuditConsentDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [open, onCancel]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-[#001930]/60 p-4"
      role="presentation"
      data-testid="audit-consent-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-[420px] rounded-[18px] bg-white p-6 text-[#001930] shadow-[0_20px_48px_rgba(0,25,48,0.18)]"
        data-testid="audit-consent-dialog"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="m-0 text-xl font-semibold">
            Souhlasíte s podmínkami?
          </h2>
          <button
            type="button"
            aria-label="Zavřít"
            onClick={onCancel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#001930]/15 bg-white text-lg"
          >
            ×
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#001930]/70">
          Pro odeslání poptávky je potřeba souhlasit se{' '}
          <a
            href={privacyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
            data-testid="audit-consent-privacy-link"
          >
            zpracováním osobních údajů
          </a>
          .
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[10px] border border-[#001930]/20 px-4 py-2.5 text-sm font-semibold"
          >
            Zrušit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-[10px] px-4 py-2.5 text-sm font-semibold"
            style={{ backgroundColor: AUDIT_ACCENT, color: AUDIT_ON_ACCENT }}
          >
            Souhlasím a pokračovat
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
