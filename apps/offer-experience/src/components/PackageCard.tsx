import type { OfferPackage, OfferPackageId } from '../offer/offerModel';
import { formatOfferPriceCzk } from '../offer/offerModel';

type PackageCardProps = {
  readonly pkg: OfferPackage;
  readonly selected: boolean;
  readonly onSelect: (id: OfferPackageId) => void;
};

export function PackageCard({ pkg, selected, onSelect }: PackageCardProps) {
  return (
    <button
      type="button"
      className={[
        'offer-package-card',
        selected ? 'offer-package-card--selected' : '',
        pkg.recommended ? 'offer-package-card--recommended' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-pressed={selected}
      data-testid={`offer-package-${pkg.id}`}
      data-selected={selected ? 'true' : 'false'}
      onClick={() => onSelect(pkg.id)}
    >
      {pkg.recommended ? (
        <span className="offer-package-card__badge">Doporučeno</span>
      ) : null}
      <h3 className="offer-package-card__name">{pkg.name}</h3>
      <p className="offer-package-card__price">
        {formatOfferPriceCzk(pkg.priceCzk)}
      </p>
      <p className="offer-package-card__license">{pkg.housesLabel}</p>
      <p className="offer-package-card__summary">{pkg.summary}</p>
      <ul className="offer-package-card__highlights">
        {pkg.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <span className="offer-package-card__select">
        {selected ? 'Vybráno' : 'Vybrat balíček'}
      </span>
    </button>
  );
}
