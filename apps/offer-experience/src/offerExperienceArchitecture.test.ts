/**
 * CAP-CE-01 / CAP-CE-02 / CAP-CE-03 — Public Offer Experience architecture guards.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

function read(relative: string): string {
  return readFileSync(join(root, relative), 'utf8');
}

describe('CAP-CE-01 Public Offer Experience', () => {
  it('ships a public route and dedicated layout without Office Shell', () => {
    const app = read('src/OfferExperienceApp.tsx');
    const layout = read('src/components/OfferLayout.tsx');
    const pkg = read('package.json');
    const vite = read('vite.config.ts');

    assert.match(app, /OfferLayout/);
    assert.match(app, /OfferHero/);
    assert.match(app, /PackageSelection/);
    assert.match(app, /OfferSummary/);
    assert.match(app, /parseOfferSlugFromPath/);
    assert.match(layout, /data-offer-layout/);
    assert.doesNotMatch(app, /PlatformShell/);
    assert.doesNotMatch(app, /PlatformAccessRoot/);
    assert.doesNotMatch(app, /office-studio/);
    assert.doesNotMatch(layout, /platform-nav-rail/);
    assert.match(pkg, /@embed-engine\/offer-experience/);
    assert.match(vite, /4192/);
  });

  it('implements package selection, summary and confirm CTA', () => {
    const selection = read('src/components/PackageSelection.tsx');
    const summary = read('src/components/OfferSummary.tsx');
    const hero = read('src/components/OfferHero.tsx');
    const css = read('src/index.css');

    assert.match(selection, /offer-package-selection/);
    assert.match(summary, /offer-continue-checkout/);
    assert.match(hero, /offer-logo/);
    assert.match(hero, /offer-hero-image/);
    assert.match(css, /--offer-gold-intense/);
    assert.match(css, /offer-shell__watermark/);
    assert.doesNotMatch(css, /platform-header/);
  });
});

describe('CAP-CE-02 Offer Checkout Runtime', () => {
  it('wires checkout form, confirmation and payment entry', () => {
    const app = read('src/OfferExperienceApp.tsx');
    const runtime = read('src/checkout/checkoutRuntime.ts');
    const extensions = read('src/checkout/checkoutExtensions.ts');
    const form = read('src/components/CheckoutForm.tsx');
    const confirm = read('src/components/CheckoutConfirm.tsx');

    assert.match(app, /useOfferCheckout/);
    assert.match(app, /CheckoutForm/);
    assert.match(app, /CheckoutConfirm/);
    assert.match(app, /ProformaExperience/);
    assert.match(runtime, /CheckoutStep/);
    assert.match(runtime, /'select'/);
    assert.match(runtime, /'checkout'/);
    assert.match(runtime, /'confirm'/);
    assert.match(runtime, /'proforma'/);
    assert.match(runtime, /'qr'/);
    assert.match(runtime, /'complete'/);
    assert.match(form, /offer-terms-checkbox/);
    assert.match(confirm, /offer-confirm-submit/);
    assert.match(extensions, /OfferProformaRequest/);
    assert.match(extensions, /OfferQrPaymentPayload/);
    assert.match(extensions, /OfferPaymentSessionRequest/);
    assert.match(extensions, /OfferTimelineEvent/);
    assert.doesNotMatch(runtime, /office-studio/);
    assert.doesNotMatch(extensions, /PlatformShell/);
  });
});

describe('CAP-CE-03 Offer Payment Experience', () => {
  it('wires proforma, QR, payment states and partner-facing complete', () => {
    const app = read('src/OfferExperienceApp.tsx');
    const model = read('src/payment/paymentModel.ts');
    const runtime = read('src/payment/paymentRuntime.ts');
    const extensions = read('src/payment/paymentExtensions.ts');
    const proforma = read('src/components/ProformaExperience.tsx');
    const qr = read('src/components/QrPaymentCard.tsx');
    const complete = read('src/components/PaymentComplete.tsx');
    const pkg = read('package.json');
    const css = read('src/index.css');

    assert.match(app, /ProformaExperience/);
    assert.match(app, /QrPaymentCard/);
    assert.match(app, /PaymentComplete/);
    assert.match(app, /continueToQr/);
    assert.match(app, /confirmPaymentReceived/);
    assert.doesNotMatch(app, /markPilotReady/);
    assert.doesNotMatch(app, /PlatformShell/);
    assert.doesNotMatch(app, /office-studio/);

    assert.match(model, /waiting_payment/);
    assert.match(model, /payment_received/);
    assert.match(model, /pilot_ready/);
    assert.match(model, /Čeká na platbu/);
    assert.match(runtime, /issue-proforma/);
    assert.match(runtime, /open-qr/);
    assert.match(runtime, /mark-payment-received/);
    assert.match(runtime, /mark-pilot-ready/);

    assert.match(proforma, /offer-proforma/);
    assert.match(proforma, /offer-proforma-number/);
    assert.match(qr, /offer-qr-payment/);
    assert.match(qr, /offer-qr-code/);
    assert.match(qr, /offer-payment-status/);
    assert.match(qr, /QRCode\.toDataURL/);
    assert.doesNotMatch(qr, /mock/i);
    assert.doesNotMatch(qr, /SPD payload/);
    assert.doesNotMatch(qr, /párování přijde/);
    assert.match(complete, /offer-payment-complete/);
    assert.match(complete, /offer-complete-next-steps/);
    assert.doesNotMatch(complete, /offer-handoff-slots/);
    assert.doesNotMatch(complete, /PaymentReceived|BuilderReady|Office handoff/);
    assert.doesNotMatch(complete, /handoff payload|runtime rozhraní|offer\.payment\.received/);
    assert.doesNotMatch(complete, /Pilot Ready|Označit Pilot/);
    assert.doesNotMatch(css, /offer-qr__mock/);
    assert.doesNotMatch(css, /offer-extension-slots/);

    assert.match(extensions, /OfferPaymentReceivedEvent/);
    assert.match(extensions, /OfferBuilderReadyEvent/);
    assert.match(extensions, /OfferOfficeHandoffRequest/);
    assert.match(extensions, /handoffToOffice/);
    assert.doesNotMatch(extensions, /PlatformShell/);
    assert.doesNotMatch(model, /@embed-engine\/platform/);
    assert.doesNotMatch(pkg, /platform-shell/);
    assert.doesNotMatch(pkg, /office-studio/);
    assert.match(pkg, /"qrcode"/);
  });

  it('keeps partner-facing offer copy free of implementation jargon', () => {
    const offerModel = read('src/offer/offerModel.ts');
    const registry = read('src/offer/offerRegistry.ts');
    const hero = read('src/components/OfferHero.tsx');
    const packages = read('src/components/PackageSelection.tsx');

    assert.doesNotMatch(offerModel, /\(MVP\)/);
    assert.doesNotMatch(offerModel, /Embed Experience/);
    assert.doesNotMatch(offerModel, /Client · Manager · Sales/);
    assert.doesNotMatch(registry, /CONIS Embed/);
    assert.doesNotMatch(hero, /mock|placeholder|runtime|demo/i);
    assert.doesNotMatch(packages, /mock|placeholder|runtime|MVP/i);
  });
});
