import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  listPartnerTimeline,
  resetOfficeEventCatalogForTests,
} from './officeEventCatalog.ts';
import {
  getHandoff,
  receivePayment,
  resetHandoffRegistryForTests,
} from './officeHandoffRegistry.ts';
import {
  getPartner,
  resetPartnerRegistryForTests,
} from './officePartnerRegistry.ts';
import {
  moveToWaitingPayment,
  resetSalesRegistryForTests,
  confirmSalesOrder,
  selectSalesPackage,
  sendPersonalizedOffer,
} from './officeSalesRegistry.ts';

describe('officeHandoffRegistry (OF-05)', () => {
  it('PaymentReceived moves partner to Implementation and bootstraps Builder', () => {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetSalesRegistryForTests();
    resetHandoffRegistryForTests();

    selectSalesPackage('p-dse', 'pilot');
    sendPersonalizedOffer('p-dse');
    confirmSalesOrder('p-dse');
    moveToWaitingPayment('p-dse');

    const summary = receivePayment('p-dse');
    assert.ok(summary !== null);
    assert.equal(summary?.status, 'builder_ready');
    assert.equal(getPartner('p-dse')?.status, 'implementation');
    assert.ok(summary?.workspace !== null);
    assert.ok(summary?.workspace?.project.id);
    assert.ok(summary?.workspace?.project.object.id);
    assert.equal(getHandoff('p-dse')?.status, 'builder_ready');

    const timeline = listPartnerTimeline('p-dse');
    assert.ok(timeline.some((event) => event.kind === 'payment.received'));
    assert.ok(
      timeline.some((event) => event.kind === 'builder.workspace.created'),
    );
    assert.ok(timeline.some((event) => event.kind === 'builder.ready'));
    assert.ok(timeline.some((event) => event.label === 'PaymentReceived'));
    assert.ok(
      timeline.some((event) => event.label === 'BuilderWorkspaceCreated'),
    );
    assert.ok(timeline.some((event) => event.label === 'BuilderReady'));
  });
});
