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
  it('exposes the approved 30-day Pilot catalog', () => {
    assert.deepEqual(
      OFFER_PACKAGES.map((item) => item.id),
      ['pilot', 'starter', 'studio-partner'],
    );
    assert.equal(getOfferPackage('starter').recommended, true);
    assert.deepEqual(
      OFFER_PACKAGES.map((item) => item.name),
      ['PILOT', 'PILOT TIP', 'PILOT MAX'],
    );
    assert.deepEqual(
      OFFER_PACKAGES.map((item) => item.priceCzk),
      [9_970, 19_970, 59_970],
    );
    assert.deepEqual(
      OFFER_PACKAGES.map((item) => item.trialDays),
      [30, 30, 30],
    );
    assert.equal(isOfferPackageId('pilot'), true);
    assert.equal(isOfferPackageId('office'), false);
    assert.match(formatOfferPriceCzk(9_970), /9/);
  });

  it('resolves public offers by slug', () => {
    const offer = resolvePublicOffer(DEFAULT_OFFER_SLUG);
    assert.ok(offer !== null);
    assert.equal(offer?.partnerName, 'Domy s energií');
    const synthesized = resolvePublicOffer('nova-firma');
    assert.ok(synthesized !== null);
    assert.equal(synthesized?.slug, 'nova-firma');
    assert.equal(synthesized?.partnerName, 'Nova Firma');
  });

  it('parses /offer/{slug} paths', () => {
    assert.equal(parseOfferSlugFromPath('/offer/domy-s-energi'), 'domy-s-energi');
    assert.equal(parseOfferSlugFromPath('/offer/domy-s-energi/'), 'domy-s-energi');
    assert.equal(parseOfferSlugFromPath('/blokki'), 'blokki');
    assert.equal(parseOfferSlugFromPath('/'), null);
  });
});
