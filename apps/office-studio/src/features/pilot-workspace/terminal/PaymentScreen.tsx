import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';

import { usePilotWorkspaceContext } from '../../../office/PilotWorkspaceContext';
import { formatCommercialPilotPriceCzk } from '../../../office/commercialPilotProgramCatalog';
import {
  buildCommercialProformaForCase,
  downloadCommercialProformaPdf,
  formatCommercialDateCs,
  openCommercialProformaPdf,
  type CommercialProforma,
} from '../../../office/commercialPaymentExperience';
import type { PilotWorkspaceCase } from '../../../office/pilotWorkspaceModel';

type PaymentScreenProps = {
  readonly activeCase: PilotWorkspaceCase;
};

/**
 * PT-CJ-04 — Payment Experience.
 * Proforma preview + SPD QR from proforma · confirm → CONIS Studio.
 */
export function PaymentScreen({ activeCase }: PaymentScreenProps) {
  const {
    navigateCommercialJourneyStep,
    partnerAuthorityError,
    partnerAuthorityReady,
    partnerAuthorityRevision,
    partnerAuthorityStatus,
  } = usePilotWorkspaceContext();
  const proforma = useMemo(
    () =>
      partnerAuthorityReady
        ? buildCommercialProformaForCase(activeCase)
        : null,
    [activeCase, partnerAuthorityReady, partnerAuthorityRevision],
  );
  const [qrImageSrc, setQrImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (proforma === null) {
      setQrImageSrc(null);
      return;
    }
    let cancelled = false;
    void QRCode.toDataURL(proforma.qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 320,
      color: { dark: '#000000', light: '#ffffff' },
    }).then((url) => {
      if (!cancelled) setQrImageSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [proforma]);

  if (!partnerAuthorityReady) {
    return (
      <div
        className="office-cj-screen office-cj-screen--payment"
        data-testid="commercial-journey-screen"
        data-cj-step="payment"
        data-cj-customer-authority="loading"
      >
        <p className="office-cj-pilot__hint">
          {partnerAuthorityStatus === 'error'
            ? `Firemní údaje se nepodařilo načíst: ${
                partnerAuthorityError ?? 'neznámá chyba'
              }`
            : 'Načítám firemní údaje…'}
        </p>
      </div>
    );
  }

  if (proforma === null) {
    return (
      <div
        className="office-cj-screen office-cj-screen--payment"
        data-testid="commercial-journey-screen"
        data-cj-step="payment"
      >
        <p className="office-cj-pilot__hint">Vyberte pilotní program.</p>
      </div>
    );
  }

  return (
    <div
      className="office-cj-screen office-cj-screen--payment"
      data-testid="commercial-journey-screen"
      data-cj-step="payment"
      data-cj-payment="true"
    >
      <header className="office-cj-order__head">
        <h2 className="office-cj-pilot__title" data-testid="cj-payment-title">
          Platba
        </h2>
      </header>

      <ProformaPreview
        proforma={proforma}
        onOpen={() => openCommercialProformaPdf(proforma)}
        onDownload={() => downloadCommercialProformaPdf(proforma)}
      />

      <section className="office-cj-payment__qr-panel" data-testid="cj-qr-panel">
        <div className="office-cj-payment__qr-frame" data-testid="cj-qr-code">
          {qrImageSrc === null ? (
            <p className="office-cj-pilot__hint">Připravuji QR…</p>
          ) : (
            <img
              className="office-cj-payment__qr-image"
              src={qrImageSrc}
              alt="QR platba"
              width={320}
              height={320}
            />
          )}
        </div>
        <p className="office-cj-payment__qr-note" data-testid="cj-qr-amount">
          {formatCommercialPilotPriceCzk(proforma.amountCzk)}
        </p>
      </section>

      <button
        type="button"
        className="office-cj-pilot__continue"
        data-testid="cj-payment-confirm-qr"
        onClick={() => navigateCommercialJourneyStep('conis_studio')}
      >
        Potvrdit provedení QR platby
      </button>
    </div>
  );
}

function ProformaPreview({
  proforma,
  onOpen,
  onDownload,
}: {
  readonly proforma: CommercialProforma;
  readonly onOpen: () => void;
  readonly onDownload: () => void;
}) {
  return (
    <section className="office-cj-payment__proforma" data-testid="cj-proforma">
      <div className="office-cj-order__panel-bar">
        <h3 className="office-cj-order__section-title">Proforma faktura</h3>
        <div className="office-cj-payment__proforma-actions">
          <button
            type="button"
            className="office-cj-order__edit"
            data-testid="cj-proforma-open"
            onClick={onOpen}
          >
            Otevřít PDF
          </button>
          <button
            type="button"
            className="office-cj-order__edit"
            data-testid="cj-proforma-download"
            onClick={onDownload}
          >
            Stáhnout PDF
          </button>
        </div>
      </div>
      <dl className="office-cj-summary" data-testid="cj-proforma-preview">
        <div>
          <dt>Číslo</dt>
          <dd data-testid="cj-proforma-number">{proforma.number}</dd>
        </div>
        <div>
          <dt>Společnost</dt>
          <dd>{proforma.companyName}</dd>
        </div>
        <div>
          <dt>Program</dt>
          <dd>{proforma.packageName}</dd>
        </div>
        <div>
          <dt>Částka</dt>
          <dd>{formatCommercialPilotPriceCzk(proforma.amountCzk)}</dd>
        </div>
        <div>
          <dt>Splatnost</dt>
          <dd>{formatCommercialDateCs(proforma.dueDate)}</dd>
        </div>
        <div>
          <dt>Banka</dt>
          <dd data-testid="cj-payment-bank">{proforma.bankName}</dd>
        </div>
        <div>
          <dt>Účet</dt>
          <dd data-testid="cj-payment-account">{proforma.accountNumber}</dd>
        </div>
        <div>
          <dt>IBAN</dt>
          <dd data-testid="cj-payment-iban">{proforma.iban}</dd>
        </div>
        <div>
          <dt>Variabilní symbol</dt>
          <dd data-testid="cj-payment-vs">{proforma.variableSymbol}</dd>
        </div>
      </dl>
    </section>
  );
}
