import { formatOfferPriceCzk } from '../offer/offerModel';
import {
  paymentLifecycleLabel,
  type OfferPaymentLifecycle,
  type OfferQrPaymentCard,
} from '../payment/paymentModel';

type PaymentStatusStripProps = {
  readonly lifecycle: OfferPaymentLifecycle;
};

/**
 * CAP-CE-03 — Waiting Payment → Payment Received → Pilot Ready.
 */
export function PaymentStatusStrip({ lifecycle }: PaymentStatusStripProps) {
  const stages: readonly OfferPaymentLifecycle[] = [
    'waiting_payment',
    'payment_received',
    'pilot_ready',
  ];
  const activeIndex = stages.indexOf(lifecycle);

  return (
    <ol
      className="offer-payment-status"
      data-testid="offer-payment-status"
      data-lifecycle={lifecycle}
    >
      {stages.map((stage, index) => {
        const status =
          index < activeIndex
            ? 'done'
            : index === activeIndex
              ? 'active'
              : 'todo';
        return (
          <li
            key={stage}
            className={`offer-payment-status__item offer-payment-status__item--${status}`}
            data-lifecycle-step={stage}
          >
            <span className="offer-payment-status__dot" aria-hidden="true" />
            <span>{paymentLifecycleLabel(stage)}</span>
          </li>
        );
      })}
    </ol>
  );
}

type QrPaymentCardProps = {
  readonly qr: OfferQrPaymentCard;
  readonly lifecycle: OfferPaymentLifecycle;
  readonly onConfirmPaid: () => void;
};

/**
 * CAP-CE-03 — QR Payment Card (static / mock QR allowed).
 */
export function QrPaymentCard({
  qr,
  lifecycle,
  onConfirmPaid,
}: QrPaymentCardProps) {
  return (
    <section
      className="offer-qr"
      data-testid="offer-qr-payment"
      aria-labelledby="offer-qr-title"
    >
      <div className="offer-section-head">
        <p className="offer-section-eyebrow">QR platba</p>
        <h2 id="offer-qr-title" className="offer-section-title">
          Úhrada proformy
        </h2>
        <p className="offer-section-lead">
          Naskenujte QR kód v bankovní aplikaci, nebo použijte platební údaje
          níže. Po úhradě potvrďte platbu — automatické párování přijde později.
        </p>
      </div>

      <PaymentStatusStrip lifecycle={lifecycle} />

      <div className="offer-qr__panel">
        <div className="offer-qr__layout">
          <div
            className="offer-qr__mock"
            data-testid="offer-qr-code"
            role="img"
            aria-label="Mock QR kód pro platbu"
          >
            {qr.imageDataUrl !== null ? (
              <img src={qr.imageDataUrl} alt="QR platba" />
            ) : (
              <div className="offer-qr__mock-grid" aria-hidden="true">
                {Array.from({ length: 49 }, (_, index) => (
                  <span
                    key={index}
                    className={
                      index % 3 === 0 || index % 7 === 1
                        ? 'offer-qr__cell offer-qr__cell--on'
                        : 'offer-qr__cell'
                    }
                  />
                ))}
              </div>
            )}
            <p className="offer-qr__mock-caption">QR · mock</p>
          </div>

          <dl className="offer-summary__rows offer-qr__details">
            <div>
              <dt>Číslo účtu</dt>
              <dd data-testid="offer-qr-account">{qr.accountNumber}</dd>
            </div>
            <div>
              <dt>IBAN</dt>
              <dd>{qr.iban}</dd>
            </div>
            <div>
              <dt>Variabilní symbol</dt>
              <dd data-testid="offer-qr-vs">{qr.variableSymbol}</dd>
            </div>
            <div>
              <dt>Částka</dt>
              <dd data-testid="offer-qr-amount">
                {formatOfferPriceCzk(qr.amountCzk)}
              </dd>
            </div>
            <div>
              <dt>Stav platby</dt>
              <dd data-testid="offer-qr-status">
                {paymentLifecycleLabel(lifecycle)}
              </dd>
            </div>
          </dl>
        </div>

        <details className="offer-qr__payload">
          <summary>SPD payload (integrace)</summary>
          <code data-testid="offer-qr-payload">{qr.qrPayload}</code>
        </details>

        <div className="offer-actions">
          <button
            type="button"
            className="offer-btn offer-btn--primary"
            data-testid="offer-qr-confirm-paid"
            onClick={onConfirmPaid}
            disabled={lifecycle !== 'waiting_payment'}
          >
            Potvrdit úhradu
          </button>
        </div>
      </div>
    </section>
  );
}
