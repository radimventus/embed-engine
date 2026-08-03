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
};

/**
 * PE-07 — Delivery Preview before „Odeslat pilot“ (no SMTP).
 */
export function PilotDeliveryPreviewDialog({
  preview,
  onConfirm,
  onCancel,
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
        description="Kontrola balíčku před odesláním pilota"
      >
        <h2
          id="pilot-delivery-preview-title"
          className="office-partner-detail__name"
        >
          Odeslat pilot
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
            <dt>Dostupná Studia</dt>
            <dd>{preview.accessibleStudios.join(' · ')}</dd>
          </div>
          <div>
            <dt>Stav pozvánky</dt>
            <dd>
              {invite !== null ? (
                <PlatformStatusBadge tone="info">
                  {invite.status}
                </PlatformStatusBadge>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt>Informace o pozvánce</dt>
            <dd data-testid="delivery-preview-invite-info">
              {invite !== null
                ? `token ${invite.token} · odesláno ${invite.sendCount}× · platná do ${new Date(invite.expiresAt).toLocaleString('cs-CZ')}`
                : '—'}
            </dd>
          </div>
          <div>
            <dt>Stav aktivace</dt>
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
            <dt>Partner Workspace</dt>
            <dd>
              <a
                href={preview.workspaceHref}
                data-testid="delivery-preview-workspace-link"
              >
                {preview.workspaceHref}
              </a>
            </dd>
          </div>
          <div>
            <dt>PDF prezentace</dt>
            <dd data-testid="delivery-preview-pdf">{preview.pdf.name}</dd>
          </div>
        </dl>
        <p className="office-dashboard__hint">
          MVP: odeslání je lokální (bez SMTP). Timeline zapíše PilotPrepared a
          PilotDelivered. Odkaz otevírá InviteShell přes ?invite=.
        </p>
        <div className="office-partner-actions" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="platform-btn platform-btn--sm"
            onClick={onCancel}
            data-testid="delivery-preview-cancel"
          >
            Zrušit
          </button>
          <button
            type="button"
            className="platform-btn platform-btn--sm"
            onClick={onConfirm}
            data-testid="delivery-preview-confirm"
          >
            Odeslat pilot
          </button>
        </div>
      </PlatformCard>
    </div>
  );
}
