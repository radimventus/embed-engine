import { PlatformDialog } from './PlatformDialog';

type PlatformConfirmDialogProps = {
  readonly open: boolean;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly busy?: boolean;
  readonly destructive?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
};

/**
 * VR-FIX-03 — Confirm dialog (Save / Discard / Delete / Rollback).
 */
export function PlatformConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Potvrdit',
  cancelLabel = 'Zrušit',
  busy = false,
  destructive = false,
  onConfirm,
  onCancel,
}: PlatformConfirmDialogProps) {
  return (
    <PlatformDialog
      open={open}
      title={title}
      description={description}
      primaryLabel={confirmLabel}
      secondaryLabel={cancelLabel}
      busy={busy}
      onClose={onCancel}
      onPrimary={onConfirm}
    >
      {destructive ? (
        <p className="platform-type-helper">
          Tuto akci nelze snadno vrátit zpět.
        </p>
      ) : null}
    </PlatformDialog>
  );
}
