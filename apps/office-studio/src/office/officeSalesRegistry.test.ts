import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  listPartnerTimeline,
  resetOfficeEventCatalogForTests,
} from './officeEventCatalog.ts';
import {
  resetPartnerRegistryForTests,
} from './officePartnerRegistry.ts';
import {
  confirmSalesOrder,
  getSalesCase,
  listWaitingPaymentCases,
  moveToWaitingPayment,
  resetSalesRegistryForTests,
  selectSalesPackage,
  sendPersonalizedOffer,
  updatePersonalizedOffer,
} from './officeSalesRegistry.ts';
import { filterSalesCases } from './officeSalesFilters.ts';
import { listSalesCases } from './officeSalesRegistry.ts';

describe('officeSalesRegistry (OF-03)', () => {
  it('personalizes offer and selects package', () => {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetSalesRegistryForTests();

    const updated = updatePersonalizedOffer('p-nord', {
      title: 'Nordhaus Pilot Offer',
      personalNote: 'Personalizovaný pilot pro Nordhaus.',
    });
    assert.equal(updated?.offer.title, 'Nordhaus Pilot Offer');

    const withPackage = selectSalesPackage('p-nord', 'starter-3');
    assert.equal(withPackage?.offer.packageId, 'starter-3');
    assert.equal(withPackage?.stage, 'offer_sent');
    assert.ok(
      listPartnerTimeline('p-nord').some(
        (event) => event.kind === 'package.selected',
      ),
    );
  });

  it('sends offer, confirms order and moves to Waiting Payment', () => {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetSalesRegistryForTests();

    selectSalesPackage('p-nord', 'pilot-1');
    sendPersonalizedOffer('p-nord');
    assert.equal(getSalesCase('p-nord')?.stage, 'offer_sent');
    assert.equal(getSalesCase('p-nord')?.offer.status, 'sent');

    confirmSalesOrder('p-nord');
    assert.equal(getSalesCase('p-nord')?.stage, 'order_confirmed');
    assert.ok(getSalesCase('p-nord')?.order !== null);

    moveToWaitingPayment('p-nord');
    assert.equal(getSalesCase('p-nord')?.stage, 'waiting_payment');
    assert.equal(getSalesCase('p-nord')?.order?.status, 'waiting_payment');
    assert.ok(
      listWaitingPaymentCases().some(
        (entry) => entry.partnerId === 'p-nord',
      ),
    );
    assert.ok(
      listPartnerTimeline('p-nord').some(
        (event) => event.kind === 'payment.waiting',
      ),
    );
  });

  it('filters sales pipeline by stage', () => {
    resetPartnerRegistryForTests();
    resetSalesRegistryForTests();
    const waiting = filterSalesCases(listSalesCases(), '', 'waiting_payment');
    assert.ok(waiting.every((entry) => entry.stage === 'waiting_payment'));
  });
});
