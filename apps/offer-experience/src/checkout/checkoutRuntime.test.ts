/**
 * CAP-CE-02 — Checkout runtime tests.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildOrderConfirmedTimelineEvent,
  buildPaymentSessionRequest,
  buildProformaRequest,
  buildQrPaymentPayload,
} from './checkoutExtensions';
import {
  buildOrderDraft,
  createInitialCheckoutState,
  reduceOfferCheckout,
  validateCheckoutContact,
} from './checkoutRuntime';
import { resolvePublicOffer } from '../offer/offerRegistry';

const offer = resolvePublicOffer('domy-s-energi')!;

describe('CAP-CE-02 checkout runtime', () => {
  it('moves select → checkout → confirm → success', () => {
    let state = createInitialCheckoutState(offer);

    state = reduceOfferCheckout(
      state,
      { type: 'select-package', packageId: 'starter' },
      offer,
    );
    assert.equal(state.selectedPackageId, 'starter');

    state = reduceOfferCheckout(state, { type: 'begin-checkout' }, offer);
    assert.equal(state.step, 'checkout');

    state = reduceOfferCheckout(
      state,
      {
        type: 'patch-contact',
        patch: {
          contactName: 'Jana Energetická',
          email: 'jana@domysenergii.cz',
          phone: '+420777200300',
        },
      },
      offer,
    );
    state = reduceOfferCheckout(
      state,
      { type: 'set-terms', accepted: true },
      offer,
    );
    state = reduceOfferCheckout(state, { type: 'submit-checkout' }, offer);
    assert.equal(state.step, 'confirm');
    assert.equal(state.formError, null);

    state = reduceOfferCheckout(
      state,
      {
        type: 'confirm-order',
        orderId: 'OFF-TEST-001',
        confirmedAt: '2026-08-04T10:00:00.000Z',
      },
      offer,
    );
    assert.equal(state.step, 'success');
    assert.equal(state.order?.orderId, 'OFF-TEST-001');
    assert.equal(state.order?.packageId, 'starter');
    assert.equal(state.order?.priceCzk, 14_970);
  });

  it('blocks checkout submit without terms / valid contact', () => {
    let state = createInitialCheckoutState(offer);
    state = reduceOfferCheckout(
      state,
      { type: 'select-package', packageId: 'pilot' },
      offer,
    );
    state = reduceOfferCheckout(state, { type: 'begin-checkout' }, offer);
    state = reduceOfferCheckout(state, { type: 'submit-checkout' }, offer);
    assert.equal(state.step, 'checkout');
    assert.match(state.formError ?? '', /e-mail|telefon|podmínky|jméno/i);

    assert.match(
      validateCheckoutContact(
        {
          ...state.contact,
          email: 'jana@example.com',
          phone: '+420777200300',
        },
        false,
      ) ?? '',
      /podmínky/i,
    );
  });

  it('builds PT-03 extension payloads without Office coupling', () => {
    const draft = buildOrderDraft(
      offer,
      'studio-partner',
      {
        companyName: 'Domy s energií s.r.o.',
        contactName: 'Jana',
        email: 'jana@example.com',
        phone: '+420777200300',
        ico: '06123456',
        note: '',
      },
      true,
    );
    const order = {
      ...draft,
      orderId: 'OFF-ABC',
      confirmedAt: '2026-08-04T10:00:00.000Z',
    };

    assert.equal(buildProformaRequest(order).orderId, 'OFF-ABC');
    assert.equal(buildProformaRequest(order).amountCzk, 29_970);
    assert.equal(buildQrPaymentPayload(order).currency, 'CZK');
    assert.equal(
      buildPaymentSessionRequest(order, {
        returnUrl: 'https://conis.cz/ok',
        cancelUrl: 'https://conis.cz/cancel',
      }).orderId,
      'OFF-ABC',
    );
    assert.equal(
      buildOrderConfirmedTimelineEvent(order).type,
      'offer.order.confirmed',
    );
  });
});
