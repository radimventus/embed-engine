import { formatOfferPriceCzk } from '../offer/offerModel';
import {
  formatOfferDateCs,
  proformaStatusLabel,
  type OfferProformaDocument,
} from '../payment/paymentModel';

type ProformaExperienceProps = {
  readonly proforma: OfferProformaDocument;
  readonly onContinue: () => void;
};

/**
 * CAP-CE-03 — Proforma Experience screen.
 */
export function ProformaExperience({
  proforma,
  onContinue,
}: ProformaExperienceProps) {
  return (
    <section
      className="offer-proforma"
      data-testid="offer-proforma"
      aria-labelledby="offer-proforma-title"
    >
      <div className="offer-section-head">
        <p className="offer-section-eyebrow">Proforma</p>
        <h2 id="offer-proforma-title" className="offer-section-title">
          Proforma faktura
        </h2>
        <p className="offer-section-lead">
          Objednávka je potvrzena. Níže je vystavená proforma — pokračujte k QR
          platbě.
        </p>
      </div>

      <div className="offer-proforma__panel">
        <p className="offer-proforma__number" data-testid="offer-proforma-number">
          Číslo proformy · <strong>{proforma.number}</strong>
        </p>

        <dl className="offer-summary__rows">
          <div>
            <dt>Partner</dt>
            <dd>{proforma.partnerName}</dd>
          </div>
          <div>
            <dt>Společnost</dt>
            <dd>{proforma.companyName}</dd>
          </div>
          <div>
            <dt>Balíček</dt>
            <dd>{proforma.packageName}</dd>
          </div>
          <div>
            <dt>Částka</dt>
            <dd data-testid="offer-proforma-amount">
              {formatOfferPriceCzk(proforma.amountCzk)}
            </dd>
          </div>
          <div>
            <dt>Datum vystavení</dt>
            <dd>{formatOfferDateCs(proforma.issuedAt)}</dd>
          </div>
          <div>
            <dt>Datum splatnosti</dt>
            <dd>{formatOfferDateCs(proforma.dueDate)}</dd>
          </div>
          <div>
            <dt>Stav</dt>
            <dd data-testid="offer-proforma-status">
              {proformaStatusLabel(proforma.status)}
            </dd>
          </div>
          {proforma.ico !== null ? (
            <div>
              <dt>IČO</dt>
              <dd>{proforma.ico}</dd>
            </div>
          ) : null}
        </dl>

        <div className="offer-actions">
          <a
            className="offer-btn offer-btn--ghost"
            data-testid="offer-proforma-pdf"
            href={proforma.pdfDataUrl}
            download={`${proforma.number}.pdf`}
          >
            Stáhnout proformu PDF
          </a>
          <button
            type="button"
            className="offer-btn offer-btn--primary"
            data-testid="offer-proforma-continue"
            onClick={onContinue}
          >
            Pokračovat k QR platbě
          </button>
        </div>
      </div>
    </section>
  );
}
