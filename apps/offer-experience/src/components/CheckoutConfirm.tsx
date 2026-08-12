import { formatOfferPriceCzk } from '../offer/offerModel';
import type { CheckoutOrderDraft } from '../checkout/checkoutRuntime';

type CheckoutConfirmProps = {
  readonly draft: CheckoutOrderDraft;
  readonly formError: string | null;
  readonly isConfirming: boolean;
  readonly onBack: () => void;
  readonly onConfirm: () => void;
};

/**
 * CAP-CE-02 — final confirmation before success.
 */
export function CheckoutConfirm({
  draft,
  formError,
  isConfirming,
  onBack,
  onConfirm,
}: CheckoutConfirmProps) {
  return (
    <section
      className="offer-confirm"
      data-testid="offer-checkout-confirm"
      aria-labelledby="offer-confirm-title"
    >
      <div className="offer-section-head">
        <p className="offer-section-eyebrow">Potvrzení</p>
        <h2 id="offer-confirm-title" className="offer-section-title">
          Zkontrolujte objednávku
        </h2>
        <p className="offer-section-lead">
          Po potvrzení vystavíme proformu a pokračujeme k QR platbě.
        </p>
      </div>

      <div className="offer-confirm__panel">
        <dl className="offer-summary__rows">
          <div>
            <dt>Balíček</dt>
            <dd>{draft.packageName}</dd>
          </div>
          <div>
            <dt>Cena</dt>
            <dd>{formatOfferPriceCzk(draft.priceCzk)}</dd>
          </div>
          <div>
            <dt>Licence</dt>
            <dd>{draft.licenseLabel}</dd>
          </div>
          <div>
            <dt>Období</dt>
            <dd>{draft.trialDays} dní</dd>
          </div>
          <div>
            <dt>Společnost</dt>
            <dd>{draft.contact.companyName}</dd>
          </div>
          <div>
            <dt>Kontakt</dt>
            <dd>
              {draft.contact.contactName}
              <br />
              {draft.contact.email}
              <br />
              {draft.contact.phone}
            </dd>
          </div>
          {draft.contact.ico.length > 0 ? (
            <div>
              <dt>IČO</dt>
              <dd>{draft.contact.ico}</dd>
            </div>
          ) : null}
        </dl>

        {formError !== null ? (
          <p className="offer-form-error" data-testid="offer-confirm-error" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="offer-actions">
          <button
            type="button"
            className="offer-btn offer-btn--ghost"
            data-testid="offer-confirm-back"
            onClick={onBack}
            disabled={isConfirming}
          >
            Upravit údaje
          </button>
          <button
            type="button"
            className="offer-btn offer-btn--primary"
            data-testid="offer-confirm-submit"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'Ukládáme objednávku…' : 'Potvrdit objednávku'}
          </button>
        </div>
      </div>
    </section>
  );
}
