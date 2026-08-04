/**
 * CAP-CE-01 / CAP-CE-02 — Public Offer Experience architecture guards.
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
  it('wires checkout form, confirmation, success and extension slots', () => {
    const app = read('src/OfferExperienceApp.tsx');
    const runtime = read('src/checkout/checkoutRuntime.ts');
    const extensions = read('src/checkout/checkoutExtensions.ts');
    const form = read('src/components/CheckoutForm.tsx');
    const confirm = read('src/components/CheckoutConfirm.tsx');
    const success = read('src/components/CheckoutSuccess.tsx');

    assert.match(app, /useOfferCheckout/);
    assert.match(app, /CheckoutForm/);
    assert.match(app, /CheckoutConfirm/);
    assert.match(app, /CheckoutSuccess/);
    assert.match(runtime, /CheckoutStep/);
    assert.match(runtime, /'select' \| 'checkout' \| 'confirm' \| 'success'/);
    assert.match(form, /offer-terms-checkbox/);
    assert.match(confirm, /offer-confirm-submit/);
    assert.match(success, /offer-extension-slots/);
    assert.match(extensions, /OfferProformaRequest/);
    assert.match(extensions, /OfferQrPaymentPayload/);
    assert.match(extensions, /OfferPaymentSessionRequest/);
    assert.match(extensions, /OfferTimelineEvent/);
    assert.doesNotMatch(runtime, /office-studio/);
    assert.doesNotMatch(extensions, /PlatformShell/);
  });
});
