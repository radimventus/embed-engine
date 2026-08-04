import { formatOfferPriceCzk } from '../offer/offerModel';
import type { CheckoutConfirmedOrder } from '../checkout/checkoutRuntime';
import {
  formatOfferDateCs,
  type OfferPaymentLifecycle,
  type OfferProformaDocument,
} from '../payment/paymentModel';
import { PaymentStatusStrip } from './QrPaymentCard';

type PaymentCompleteProps = {
  readonly order: CheckoutConfirmedOrder;
  readonly proforma: OfferProformaDocument;
  readonly paidAt: string;
  readonly lifecycle: OfferPaymentLifecycle;
  readonly onMarkPilotReady: () => void;
  readonly onReset: () => void;
};

/**
 * CAP-CE-03 — Payment Complete + Pilot Ready handoff cue.
 */
export function PaymentComplete({
  order,
  proforma,
  paidAt,
  lifecycle,
  onMarkPilotReady,
  onReset,
}: PaymentCompleteProps) {
  const pilotReady = lifecycle === 'pilot_ready';

  return (
    <section
      className="offer-complete"
      data-testid="offer-payment-complete"
      data-lifecycle={lifecycle}
      aria-labelledby="offer-complete-title"
    >
      <div className="offer-section-head">
        <p className="offer-section-eyebrow">
          {pilotReady ? 'Pilot Ready' : 'Payment Complete'}
        </p>
        <h2 id="offer-complete-title" className="offer-section-title">
          {pilotReady ? 'Pilot je připraven k předání' : 'Platba je potvrzena'}
        </h2>
        <p className="offer-section-lead">
          {pilotReady
            ? 'Děkujeme. Obchodní cesta je dokončena — Office handoff je připraven přes runtime rozhraní.'
            : 'Děkujeme za úhradu. Potvrzujeme přijetí platby a připravujeme pilotní prostředí.'}
        </p>
      </div>

      <PaymentStatusStrip lifecycle={lifecycle} />

      <div className="offer-complete__panel">
        <p className="offer-success__id" data-testid="offer-complete-order-id">
          Objednávka · <strong>{order.orderId}</strong>
        </p>
        <dl className="offer-summary__rows">
          <div>
            <dt>Proforma</dt>
            <dd>{proforma.number}</dd>
          </div>
          <div>
            <dt>Uhrazeno</dt>
            <dd data-testid="offer-complete-paid-at">
              {formatOfferDateCs(paidAt)}
            </dd>
          </div>
          <div>
            <dt>Částka</dt>
            <dd>{formatOfferPriceCzk(order.priceCzk)}</dd>
          </div>
          <div>
            <dt>Balíček</dt>
            <dd>{order.packageName}</dd>
          </div>
          <div>
            <dt>Partner</dt>
            <dd>{order.partnerName}</dd>
          </div>
          <div>
            <dt>Příprava pilotu</dt>
            <dd data-testid="offer-complete-pilot-info">
              {pilotReady
                ? 'Pilot Ready — handoff payload je připraven pro Office.'
                : 'Po potvrzení Pilot Ready připravíme předání do provozního prostředí.'}
            </dd>
          </div>
        </dl>

        <div
          className="offer-extension-slots"
          data-testid="offer-handoff-slots"
        >
          <article data-extension="payment-received">
            <h3>PaymentReceived</h3>
            <p>Event `offer.payment.received` — připraveno k napojení.</p>
          </article>
          <article data-extension="builder-ready">
            <h3>BuilderReady</h3>
            <p>Event `offer.builder.ready` — připraveno k napojení.</p>
          </article>
          <article data-extension="timeline">
            <h3>Timeline</h3>
            <p>Timeline eventy commercial cesty — bez e-mailu / Office UI.</p>
          </article>
          <article data-extension="office-handoff">
            <h3>Office handoff</h3>
            <p>
              Rozhraní `handoffToOffice` — PT-04 bez refaktoringu UI.
            </p>
          </article>
        </div>

        <div className="offer-actions">
          {!pilotReady ? (
            <button
              type="button"
              className="offer-btn offer-btn--primary"
              data-testid="offer-complete-pilot-ready"
              onClick={onMarkPilotReady}
            >
              Označit Pilot Ready
            </button>
          ) : null}
          <button
            type="button"
            className="offer-btn offer-btn--ghost"
            data-testid="offer-complete-reset"
            onClick={onReset}
          >
            Zpět na nabídku
          </button>
        </div>
      </div>
    </section>
  );
}
