/**
 * PE-09 — Pilot Offer & Checkout: packages, comparison, checkout, timeline.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  listPartnerTimeline,
  resetOfficeEventCatalogForTests,
} from './officeEventCatalog.ts';
import {
  createPartner,
  getPartner,
  resetPartnerRegistryForTests,
} from './officePartnerRegistry.ts';
import { resetPartnerEnvironmentLifecycleForTests } from './officePartnerEnvironmentLifecycle.ts';
import {
  confirmSalesOrder,
  getSalesCase,
  markOfferViewed,
  resetSalesRegistryForTests,
  selectSalesPackage,
} from './officeSalesRegistry.ts';
import {
  buildPackageComparison,
  formatCzk,
  getSalesPackage,
  OFFICE_SALES_PACKAGES,
} from './officeSalesModel.ts';

describe('PE-09 Pilot Offer & Checkout', () => {
  function resetAll() {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetSalesRegistryForTests();
    resetPartnerEnvironmentLifecycleForTests();
  }

  it('exposes Pilot, Starter and Studio Partner with comparison matrix', () => {
    assert.deepEqual(
      OFFICE_SALES_PACKAGES.map((pkg) => pkg.id),
      ['pilot', 'starter', 'studio-partner'],
    );
    assert.equal(getSalesPackage('starter').recommended, true);
    assert.equal(getSalesPackage('pilot').name, 'Pilot');
    assert.equal(getSalesPackage('studio-partner').name, 'Studio Partner');

    const comparison = buildPackageComparison();
    assert.ok(comparison.length >= 5);
    assert.ok(comparison.every((row) => row.values.pilot.length > 0));
    assert.ok(comparison.every((row) => row.values.starter.length > 0));
    assert.ok(
      comparison.every((row) => row.values['studio-partner'].length > 0),
    );
    assert.match(formatCzk(4_970), /4.?970/);
  });

  it('records OfferViewed, PackageSelected and OrderConfirmed on checkout', () => {
    resetAll();
    const partner = createPartner({
      name: 'Offer Co',
      status: 'lead',
      nextStep: 'Připravit nabídku',
      company: {
        legalName: 'Offer Co',
        ico: '',
        city: '',
        country: 'Česko',
      },
      contact: {
        name: 'Offer',
        email: 'offer@pilot.local',
        phone: '',
        role: 'Jednatel',
      },
    });

    markOfferViewed(partner.id);
    selectSalesPackage(partner.id, 'starter');
    const confirmed = confirmSalesOrder(partner.id);

    assert.equal(confirmed?.offer.packageId, 'starter');
    assert.equal(confirmed?.offer.priceCzk, 14_970);
    assert.equal(confirmed?.order?.packageId, 'starter');
    assert.equal(confirmed?.order?.status, 'confirmed');
    assert.equal(confirmed?.stage, 'order_confirmed');
    assert.equal(getPartner(partner.id)?.status, 'active');

    const kinds = listPartnerTimeline(partner.id).map((event) => event.kind);
    assert.ok(kinds.includes('offer.viewed'));
    assert.ok(kinds.includes('package.selected'));
    assert.ok(kinds.includes('order.confirmed'));
    assert.ok(kinds.includes('partner.activated'));

    const labels = listPartnerTimeline(partner.id).map((event) => event.label);
    assert.ok(labels.includes('OfferViewed'));
    assert.ok(labels.includes('PackageSelected'));
    assert.ok(labels.includes('OrderConfirmed'));
    assert.ok(labels.includes('PartnerActivated'));
  });

  it('normalizes legacy package ids into PE-09 packages', () => {
    resetAll();
    selectSalesPackage('p-nord', 'starter-3');
    assert.equal(getSalesCase('p-nord')?.offer.packageId, 'starter');
    selectSalesPackage('p-nord', 'pilot-1');
    assert.equal(getSalesCase('p-nord')?.offer.packageId, 'pilot');
    selectSalesPackage('p-nord', 'pilot-max');
    assert.equal(getSalesCase('p-nord')?.offer.packageId, 'studio-partner');
  });
});
