/**
 * CAP-CE-01 — Offer model / route helpers.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  OFFER_PACKAGES,
  formatOfferPriceCzk,
  getOfferPackage,
  isOfferPackageId,
} from './offerModel';
import {
  DEFAULT_OFFER_SLUG,
  parseOfferSlugFromPath,
  resolvePublicOffer,
} from './offerRegistry';

describe('CAP-CE-01 offer model', () => {
  it('exposes Pilot · Starter · Studio Partner', () => {
    assert.deepEqual(
      OFFER_PACKAGES.map((item) => item.id),
      ['pilot', 'starter', 'studio-partner'],
    );
    assert.equal(getOfferPackage('starter').recommended, true);
    assert.equal(getOfferPackage('pilot').trialDays, 90);
    assert.equal(isOfferPackageId('pilot'), true);
    assert.equal(isOfferPackageId('office'), false);
    assert.match(formatOfferPriceCzk(4970), /4/);
  });

  it('resolves public offers by slug', () => {
    const offer = resolvePublicOffer(DEFAULT_OFFER_SLUG);
    assert.ok(offer !== null);
    assert.equal(offer?.partnerName, 'Domy s energií');
    assert.equal(resolvePublicOffer('missing-partner'), null);
  });

  it('parses /offer/{slug} paths', () => {
    assert.equal(parseOfferSlugFromPath('/offer/domy-s-energi'), 'domy-s-energi');
    assert.equal(parseOfferSlugFromPath('/offer/domy-s-energi/'), 'domy-s-energi');
    assert.equal(parseOfferSlugFromPath('/blokki'), 'blokki');
    assert.equal(parseOfferSlugFromPath('/'), null);
  });
});
