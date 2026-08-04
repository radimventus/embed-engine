import {
  PlatformCard,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

import {
  activationStatusLabel,
  type PilotDeliveryPreview,
} from '../../office/officePilotDeliveryModel';

type PilotDeliveryPreviewDialogProps = {
  readonly preview: PilotDeliveryPreview;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly busy?: boolean;
};

/**
 * PT-CJ-00 — Delivery Preview before „Odeslat nabídku“.
 */
export function PilotDeliveryPreviewDialog({
  preview,
  onConfirm,
  onCancel,
  busy = false,
}: PilotDeliveryPreviewDialogProps) {
  const invite = preview.invite;

  return (
    <div
      className="office-partners__dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pilot-delivery-preview-title"
      data-testid="pilot-delivery-preview"
    >
      <PlatformCard
        title="Delivery Preview"
        description="Kontrola balíčku před odesláním nabídky"
      >
        <h2
          id="pilot-delivery-preview-title"
          className="office-partner-detail__name"
        >
          Odeslat nabídku
        </h2>
        <dl className="office-partner-dl" data-testid="delivery-preview-fields">
          <div>
            <dt>Partner</dt>
            <dd>{preview.partnerName}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{preview.email}</dd>
          </div>
          <div>
            <dt>Pilotní projekt</dt>
            <dd>{preview.projectName}</dd>
          </div>
          <div>
            <dt>Hero</dt>
            <dd data-testid="delivery-preview-hero">{preview.heroLabel || '—'}</dd>
          </div>
          <div>
            <dt>Web partnera</dt>
            <dd data-testid="delivery-preview-website">
              {preview.websiteUrl || '—'}
            </dd>
          </div>
          <div>
            <dt>Dostupná Studia</dt>
            <dd>{preview.accessibleStudios.join(' · ')}</dd>
          </div>
          <div>
            <dt>Login</dt>
            <dd data-testid="delivery-preview-login">{preview.loginEmail}</dd>
          </div>
          <div>
            <dt>Heslo</dt>
            <dd data-testid="delivery-preview-password">
              {preview.loginPassword}
            </dd>
          </div>
          <div>
            <dt>Stav účtu</dt>
            <dd data-testid="delivery-preview-activation">
              <PlatformStatusBadge
                tone={
                  preview.activationStatus === 'activated' ? 'pass' : 'info'
                }
              >
                {activationStatusLabel(preview.activationStatus)}
              </PlatformStatusBadge>
            </dd>
          </div>
          <div>
            <dt>CONIS Studio</dt>
            <dd>
              <a
                href={preview.studioLoginHref}
                data-testid="delivery-preview-workspace-link"
              >
                {preview.studioLoginHref}
              </a>
            </dd>
          </div>
          <div>
            <dt>PDF nabídka</dt>
            <dd data-testid="delivery-preview-pdf">{preview.pdf.name}</dd>
          </div>
          <div>
            <dt>Pozvánka</dt>
            <dd data-testid="delivery-preview-invite-info">
              {invite !== null
                ? `${invite.status} · odesláno ${invite.sendCount}×`
                : '—'}
            </dd>
          </div>
        </dl>
        <p className="office-dashboard__hint">
          Systém vytvoří personalizované PDF (Hero + web), odešle pozvánkový
          e-mail přes SMTP a uloží komunikaci do Conversation a Timeline.
        </p>
        <div className="office-partner-actions" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="platform-btn platform-btn--sm"
            onClick={onCancel}
            disabled={busy}
            data-testid="delivery-preview-cancel"
          >
            Zrušit
          </button>
          <button
            type="button"
            className="platform-btn platform-btn--sm"
            onClick={onConfirm}
            disabled={busy}
            data-testid="delivery-preview-confirm"
          >
            {busy ? 'Odesílám…' : 'Odeslat nabídku'}
          </button>
        </div>
      </PlatformCard>
    </div>
  );
}
