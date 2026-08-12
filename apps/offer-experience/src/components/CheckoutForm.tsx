import type { OfferPackage } from '../offer/offerModel';
import { formatOfferPriceCzk } from '../offer/offerModel';
import type { CheckoutContactForm } from '../checkout/checkoutRuntime';

type CheckoutFormProps = {
  readonly selected: OfferPackage;
  readonly contact: CheckoutContactForm;
  readonly termsAccepted: boolean;
  readonly formError: string | null;
  readonly onPatch: (patch: Partial<CheckoutContactForm>) => void;
  readonly onTermsChange: (accepted: boolean) => void;
  readonly onBack: () => void;
  readonly onContinue: () => void;
};

/**
 * CAP-CE-02 — order form + terms acceptance.
 */
export function CheckoutForm({
  selected,
  contact,
  termsAccepted,
  formError,
  onPatch,
  onTermsChange,
  onBack,
  onContinue,
}: CheckoutFormProps) {
  return (
    <section
      className="offer-checkout"
      data-testid="offer-checkout-form"
      aria-labelledby="offer-checkout-title"
    >
      <div className="offer-section-head">
        <p className="offer-section-eyebrow">Objednávka</p>
        <h2 id="offer-checkout-title" className="offer-section-title">
          Údaje pro potvrzení
        </h2>
        <p className="offer-section-lead">
          Balíček <strong>{selected.name}</strong> ·{' '}
          {formatOfferPriceCzk(selected.priceCzk)} · {selected.housesLabel} ·{' '}
          {selected.trialDays} dní
        </p>
      </div>

      <form
        className="offer-checkout__form"
        onSubmit={(event) => {
          event.preventDefault();
          onContinue();
        }}
      >
        <label className="offer-field">
          <span>Společnost</span>
          <input
            data-testid="offer-field-company"
            value={contact.companyName}
            onChange={(event) => onPatch({ companyName: event.target.value })}
            autoComplete="organization"
            required
          />
        </label>
        <label className="offer-field">
          <span>Kontaktní osoba</span>
          <input
            data-testid="offer-field-contact"
            value={contact.contactName}
            onChange={(event) => onPatch({ contactName: event.target.value })}
            autoComplete="name"
            required
          />
        </label>
        <div className="offer-checkout__row">
          <label className="offer-field">
            <span>E-mail</span>
            <input
              data-testid="offer-field-email"
              type="email"
              value={contact.email}
              onChange={(event) => onPatch({ email: event.target.value })}
              autoComplete="email"
              required
            />
          </label>
          <label className="offer-field">
            <span>Telefon</span>
            <input
              data-testid="offer-field-phone"
              type="tel"
              value={contact.phone}
              onChange={(event) => onPatch({ phone: event.target.value })}
              autoComplete="tel"
              required
            />
          </label>
        </div>
        <label className="offer-field">
          <span>IČO (volitelné)</span>
          <input
            data-testid="offer-field-ico"
            value={contact.ico}
            onChange={(event) => onPatch({ ico: event.target.value })}
            inputMode="numeric"
          />
        </label>
        <label className="offer-field">
          <span>Poznámka (volitelné)</span>
          <textarea
            data-testid="offer-field-note"
            value={contact.note}
            onChange={(event) => onPatch({ note: event.target.value })}
            rows={3}
          />
        </label>

        <label className="offer-terms" data-testid="offer-terms">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => onTermsChange(event.target.checked)}
            data-testid="offer-terms-checkbox"
          />
          <span>
            Potvrzuji{' '}
            <a
              href="/legal/01_obchodni-podminky.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              obchodní podmínky CONIS
            </a>{' '}
            a souhlasím s vystavením objednávky vybraného balíčku.
          </span>
        </label>

        {formError !== null ? (
          <p className="offer-form-error" data-testid="offer-form-error" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="offer-actions">
          <button
            type="button"
            className="offer-btn offer-btn--ghost"
            data-testid="offer-checkout-back"
            onClick={onBack}
          >
            Zpět k balíčkům
          </button>
          <button
            type="submit"
            className="offer-btn offer-btn--primary"
            data-testid="offer-checkout-continue"
          >
            Pokračovat k potvrzení
          </button>
        </div>
      </form>
    </section>
  );
}
