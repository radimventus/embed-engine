import type { OfferPackage, OfferPackageId } from '../offer/offerModel';
import { PackageCard } from './PackageCard';

type PackageSelectionProps = {
  readonly packages: readonly OfferPackage[];
  readonly selectedId: OfferPackageId | null;
  readonly onSelect: (id: OfferPackageId) => void;
};

/**
 * CAP-CE-01 — three package cards, single selection.
 */
export function PackageSelection({
  packages,
  selectedId,
  onSelect,
}: PackageSelectionProps) {
  return (
    <section
      className="offer-packages"
      data-testid="offer-package-selection"
      aria-labelledby="offer-packages-title"
    >
      <div className="offer-section-head">
        <p className="offer-section-eyebrow">Balíčky</p>
        <h2 id="offer-packages-title" className="offer-section-title">
          Vyberte variantu spolupráce
        </h2>
        <p className="offer-section-lead">
          Jedna volba. Stejná obchodní cesta, kterou jsme připravili na schůzce.
        </p>
      </div>
      <div className="offer-packages__grid" role="group" aria-label="Balíčky">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            selected={selectedId === pkg.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
