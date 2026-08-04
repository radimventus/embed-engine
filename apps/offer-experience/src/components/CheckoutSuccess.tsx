import { formatOfferPriceCzk } from '../offer/offerModel';
import type { CheckoutConfirmedOrder } from '../checkout/checkoutRuntime';

type CheckoutSuccessProps = {
  readonly order: CheckoutConfirmedOrder;
  readonly onReset: () => void;
};

/**
 * CAP-CE-02 — success screen with PT-03 extension slots (UI placeholders).
 */
export function CheckoutSuccess({ order, onReset }: CheckoutSuccessProps) {
  return (
    <section
      className="offer-success"
      data-testid="offer-checkout-success"
      aria-labelledby="offer-success-title"
    >
      <div className="offer-section-head">
        <p className="offer-section-eyebrow">Hotovo</p>
        <h2 id="offer-success-title" className="offer-section-title">
          Objednávka je potvrzena
        </h2>
        <p className="offer-section-lead">
          Děkujeme. Obchodní krok je dokončen. Další fáze (proforma, QR a platba)
          budou připojeny bez změny této obrazovky.
        </p>
      </div>

      <div className="offer-success__panel">
        <p className="offer-success__id" data-testid="offer-success-order-id">
          Číslo objednávky · <strong>{order.orderId}</strong>
        </p>
        <dl className="offer-summary__rows">
          <div>
            <dt>Balíček</dt>
            <dd>{order.packageName}</dd>
          </div>
          <div>
            <dt>Cena</dt>
            <dd>{formatOfferPriceCzk(order.priceCzk)}</dd>
          </div>
          <div>
            <dt>Partner</dt>
            <dd>{order.partnerName}</dd>
          </div>
          <div>
            <dt>Kontakt</dt>
            <dd>{order.contact.email}</dd>
          </div>
        </dl>

        <div
          className="offer-extension-slots"
          data-testid="offer-extension-slots"
        >
          <article data-extension="proforma">
            <h3>Proforma</h3>
            <p>Připraveno pro napojení vystavení proformy (PT-03).</p>
          </article>
          <article data-extension="qr">
            <h3>QR platba</h3>
            <p>Připraveno pro QR payload / bankovní instrukce (PT-03).</p>
          </article>
          <article data-extension="payment">
            <h3>Platba</h3>
            <p>Připraveno pro platební session / return URL (PT-03).</p>
          </article>
          <article data-extension="timeline">
            <h3>Timeline</h3>
            <p>Připraveno pro event `offer.order.confirmed` (PT-03).</p>
          </article>
        </div>

        <div className="offer-actions">
          <button
            type="button"
            className="offer-btn offer-btn--ghost"
            data-testid="offer-success-reset"
            onClick={onReset}
          >
            Zpět na nabídku
          </button>
        </div>
      </div>
    </section>
  );
}
