import type { OfferPackage } from '../offer/offerModel';
import { formatOfferPriceCzk } from '../offer/offerModel';

type OfferSummaryProps = {
  readonly selected: OfferPackage | null;
  readonly onContinue: () => void;
};

/**
 * CAP-CE-01/02 — package summary CTA enters checkout runtime.
 */
export function OfferSummary({ selected, onContinue }: OfferSummaryProps) {
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
          Pokračovat k objednávce
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
          data-testid="offer-continue-checkout"
          disabled={!enabled}
          onClick={onContinue}
        >
          Pokračovat k objednávce
        </button>
      </div>
    </section>
  );
}
