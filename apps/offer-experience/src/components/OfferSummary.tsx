import type { OfferPackage } from '../offer/offerModel';
import { formatOfferPriceCzk } from '../offer/offerModel';

type OfferSummaryProps = {
  readonly selected: OfferPackage | null;
  readonly confirmed: boolean;
  readonly onConfirm: () => void;
};

/**
 * CAP-CE-01 — summary + confirm CTA (UI only).
 */
export function OfferSummary({
  selected,
  confirmed,
  onConfirm,
}: OfferSummaryProps) {
  const enabled = selected !== null;

  return (
    <section
      className="offer-summary"
      data-testid="offer-summary"
      aria-labelledby="offer-summary-title"
    >
      <div className="offer-section-head">
        <p className="offer-section-eyebrow">Shrnutí</p>
        <h2 id="offer-summary-title" className="offer-section-title">
          Potvrzení objednávky
        </h2>
      </div>

      <div className="offer-summary__panel">
        {selected === null ? (
          <p className="offer-summary__empty" data-testid="offer-summary-empty">
            Nejprve vyberte balíček výše.
          </p>
        ) : (
          <dl className="offer-summary__rows" data-testid="offer-summary-rows">
            <div>
              <dt>Balíček</dt>
              <dd>{selected.name}</dd>
            </div>
            <div>
              <dt>Cena</dt>
              <dd>{formatOfferPriceCzk(selected.priceCzk)}</dd>
            </div>
            <div>
              <dt>Licence</dt>
              <dd>{selected.housesLabel}</dd>
            </div>
            <div>
              <dt>Období</dt>
              <dd>{selected.trialDays} dní</dd>
            </div>
          </dl>
        )}

        <button
          type="button"
          className="offer-summary__cta"
          data-testid="offer-confirm-cta"
          disabled={!enabled}
          onClick={onConfirm}
        >
          Potvrdit objednávku
        </button>

        {confirmed ? (
          <p className="offer-summary__ack" data-testid="offer-confirm-ack">
            Objednávka je připravena k dalšímu kroku. (Bez platby — UI foundation.)
          </p>
        ) : null}
      </div>
    </section>
  );
}
