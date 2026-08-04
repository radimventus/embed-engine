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
  readonly onReset: () => void;
};

/**
 * CAP-CE-03 — partner confirmation after payment (commercial language only).
 */
export function PaymentComplete({
  order,
  proforma,
  paidAt,
  lifecycle,
  onReset,
}: PaymentCompleteProps) {
  const partnerReady =
    lifecycle === 'payment_received' || lifecycle === 'pilot_ready';

  return (
    <section
      className="offer-complete"
      data-testid="offer-payment-complete"
      data-lifecycle={lifecycle}
      aria-labelledby="offer-complete-title"
    >
      <div className="offer-section-head">
        <p className="offer-section-eyebrow">
          {partnerReady ? 'Připraveno' : 'Potvrzení'}
        </p>
        <h2 id="offer-complete-title" className="offer-section-title">
          {partnerReady
            ? 'Děkujeme — objednávka je přijata'
            : 'Platba je potvrzena'}
        </h2>
        <p className="offer-section-lead">
          {partnerReady
            ? 'Platbu jsme zaevidovali. Do dvou pracovních dnů vás kontaktujeme s dalšími kroky spuštění.'
            : 'Děkujeme za úhradu. Potvrzujeme přijetí objednávky a připravujeme spuštění spolupráce.'}
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
            <dt>Úhrada potvrzena</dt>
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
            <dt>Co bude následovat</dt>
            <dd data-testid="offer-complete-next-steps">
              Ověříme připsání platby, připravíme váš provozní přístup a ozveme
              se na {order.contact.email} s konkrétním termínem spuštění.
            </dd>
          </div>
        </dl>

        <div className="offer-actions">
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
