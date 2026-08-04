import { useCallback, useMemo, useState } from 'react';

import { OfferHero } from './components/OfferHero';
import { OfferLayout } from './components/OfferLayout';
import { OfferSummary } from './components/OfferSummary';
import { PackageSelection } from './components/PackageSelection';
import {
  OFFER_PACKAGES,
  getOfferPackage,
  type OfferPackageId,
} from './offer/offerModel';
import {
  DEFAULT_OFFER_SLUG,
  parseOfferSlugFromPath,
  resolvePublicOffer,
} from './offer/offerRegistry';

function useOfferSlug(): string | null {
  return useMemo(() => {
    if (typeof window === 'undefined') return DEFAULT_OFFER_SLUG;
    const fromPath = parseOfferSlugFromPath(window.location.pathname);
    if (fromPath !== null) return fromPath;
    // Local convenience: bare host opens reference offer.
    if (
      window.location.pathname === '/' ||
      window.location.pathname === '' ||
      window.location.pathname === '/index.html'
    ) {
      return DEFAULT_OFFER_SLUG;
    }
    return null;
  }, []);
}

/**
 * CAP-CE-01 — Public Offer Experience root.
 */
export function OfferExperienceApp() {
  const slug = useOfferSlug();
  const offer = slug !== null ? resolvePublicOffer(slug) : null;
  const [selectedId, setSelectedId] = useState<OfferPackageId | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const selected = selectedId !== null ? getOfferPackage(selectedId) : null;

  const handleSelect = useCallback((id: OfferPackageId) => {
    setSelectedId(id);
    setConfirmed(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedId === null) return;
    setConfirmed(true);
  }, [selectedId]);

  if (offer === null) {
    return (
      <OfferLayout>
        <main className="offer-missing" data-testid="offer-missing">
          <p className="offer-logo" aria-label="CONIS">
            CON<span className="offer-logo__accent">I</span>S
          </p>
          <h1>Nabídka není k dispozici</h1>
          <p>
            Odkaz může být neplatný nebo nabídka ještě nebyla připravena.
            Kontaktujte prosím svého obchodního partnera CONIS.
          </p>
        </main>
      </OfferLayout>
    );
  }

  return (
    <OfferLayout>
      <main className="offer-page" data-testid="offer-page" data-offer-slug={offer.slug}>
        <OfferHero
          partnerName={offer.partnerName}
          greeting={offer.greeting}
          intro={offer.intro}
          heroImageUrl={offer.heroImageUrl}
        />
        <PackageSelection
          packages={OFFER_PACKAGES}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
        <OfferSummary
          selected={selected}
          confirmed={confirmed}
          onConfirm={handleConfirm}
        />
        <footer className="offer-footer">
          <span>CONIS · inteligentní vrstva pro web, která zvyšuje konverzi.</span>
          <span>Nabídka · {offer.partnerName}</span>
        </footer>
      </main>
    </OfferLayout>
  );
}
