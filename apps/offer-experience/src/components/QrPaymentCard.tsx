import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

import { formatOfferPriceCzk } from '../offer/offerModel';
import {
  OFFER_PAYMENT_ACCOUNT,
  paymentLifecycleLabel,
  type OfferPaymentLifecycle,
  type OfferQrPaymentCard,
} from '../payment/paymentModel';

type PaymentStatusStripProps = {
  readonly lifecycle: OfferPaymentLifecycle;
};

/**
 * CAP-CE-03 — commercial payment status (Čeká na platbu → …).
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
 * CAP-CE-03 — partner QR payment page (SPD bank QR).
 */
export function QrPaymentCard({
  qr,
  lifecycle,
  onConfirmPaid,
}: QrPaymentCardProps) {
  const [qrImageSrc, setQrImageSrc] = useState<string | null>(qr.imageDataUrl);

  useEffect(() => {
    let cancelled = false;

    if (qr.imageDataUrl !== null) {
      setQrImageSrc(qr.imageDataUrl);
      return () => {
        cancelled = true;
      };
    }

    void QRCode.toDataURL(qr.qrPayload, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0b1f33', light: '#ffffff' },
    }).then((dataUrl) => {
      if (!cancelled) setQrImageSrc(dataUrl);
    });

    return () => {
      cancelled = true;
    };
  }, [qr.imageDataUrl, qr.qrPayload]);

  return (
    <section
      className="offer-qr"
      data-testid="offer-qr-payment"
      aria-labelledby="offer-qr-title"
    >
      <div className="offer-section-head">
        <p className="offer-section-eyebrow">Platba</p>
        <h2 id="offer-qr-title" className="offer-section-title">
          Úhrada proformy
        </h2>
        <p className="offer-section-lead">
          Naskenujte QR kód v bankovní aplikaci, nebo zadejte platební údaje
          níže. Po odeslání platby potvrďte úhradu — ozveme se vám po připsání
          platby na účet.
        </p>
      </div>

      <PaymentStatusStrip lifecycle={lifecycle} />

      <div className="offer-qr__panel">
        <div className="offer-qr__layout">
          <div
            className="offer-qr__code"
            data-testid="offer-qr-code"
            role="img"
            aria-label="QR kód pro platbu"
          >
            {qrImageSrc !== null ? (
              <img src={qrImageSrc} alt="QR kód pro úhradu proformy" />
            ) : (
              <div
                className="offer-qr__code-loading"
                data-testid="offer-qr-loading"
                aria-hidden="true"
              />
            )}
          </div>

          <dl className="offer-summary__rows offer-qr__details">
            <div>
              <dt>Banka</dt>
              <dd>{OFFER_PAYMENT_ACCOUNT.bankName}</dd>
            </div>
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
              <dt>Zpráva pro příjemce</dt>
              <dd>{qr.message}</dd>
            </div>
            <div>
              <dt>Stav</dt>
              <dd data-testid="offer-qr-status">
                {paymentLifecycleLabel(lifecycle)}
              </dd>
            </div>
          </dl>
        </div>

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
