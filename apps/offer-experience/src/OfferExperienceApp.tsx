import { useMemo } from 'react';

import { CheckoutConfirm } from './components/CheckoutConfirm';
import { CheckoutForm } from './components/CheckoutForm';
import { CheckoutStepper } from './components/CheckoutStepper';
import { CheckoutSuccess } from './components/CheckoutSuccess';
import { OfferHero } from './components/OfferHero';
import { OfferLayout } from './components/OfferLayout';
import { OfferSummary } from './components/OfferSummary';
import { PackageSelection } from './components/PackageSelection';
import { buildOrderDraft } from './checkout/checkoutRuntime';
import { useOfferCheckout } from './checkout/useOfferCheckout';
import { OFFER_PACKAGES, type PublicOffer } from './offer/offerModel';
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

function OfferCheckoutExperience({ offer }: { readonly offer: PublicOffer }) {
  const checkout = useOfferCheckout(offer);
  const { state, selectedPackage } = checkout;
  const confirmDraft =
    state.selectedPackageId !== null
      ? buildOrderDraft(
          offer,
          state.selectedPackageId,
          state.contact,
          state.termsAccepted,
        )
      : null;

  return (
    <main
      className="offer-page"
      data-testid="offer-page"
      data-offer-slug={offer.slug}
      data-checkout-step={state.step}
    >
      <CheckoutStepper step={state.step} />

      {state.step === 'select' ? (
        <>
          <OfferHero
            partnerName={offer.partnerName}
            greeting={offer.greeting}
            intro={offer.intro}
            heroImageUrl={offer.heroImageUrl}
          />
          <PackageSelection
            packages={OFFER_PACKAGES}
            selectedId={state.selectedPackageId}
            onSelect={checkout.selectPackage}
          />
          <OfferSummary
            selected={selectedPackage}
            onContinue={checkout.beginCheckout}
          />
        </>
      ) : null}

      {state.step === 'checkout' && selectedPackage !== null ? (
        <CheckoutForm
          selected={selectedPackage}
          contact={state.contact}
          termsAccepted={state.termsAccepted}
          formError={state.formError}
          onPatch={checkout.patchContact}
          onTermsChange={checkout.setTermsAccepted}
          onBack={checkout.backToSelect}
          onContinue={checkout.submitCheckout}
        />
      ) : null}

      {state.step === 'confirm' && confirmDraft !== null ? (
        <CheckoutConfirm
          draft={confirmDraft}
          onBack={checkout.backToCheckout}
          onConfirm={checkout.confirmOrder}
        />
      ) : null}

      {state.step === 'success' && state.order !== null ? (
        <CheckoutSuccess order={state.order} onReset={checkout.reset} />
      ) : null}

      <footer className="offer-footer">
        <span>CONIS · inteligentní vrstva pro web, která zvyšuje konverzi.</span>
        <span>Nabídka · {offer.partnerName}</span>
      </footer>
    </main>
  );
}

/**
 * CAP-CE-01 / CAP-CE-02 — Public Offer Experience + Checkout Runtime.
 */
export function OfferExperienceApp() {
  const slug = useOfferSlug();
  const offer = slug !== null ? resolvePublicOffer(slug) : null;

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
      <OfferCheckoutExperience offer={offer} />
    </OfferLayout>
  );
}
