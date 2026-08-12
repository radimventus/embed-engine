/**
 * CAP-CE-02 / CAP-CE-03 — Checkout + Payment runtime tests.
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
import {
  buildBuilderReadyEvent,
  buildOfficeHandoffRequest,
  buildPaymentReceivedEvent,
} from '../payment/paymentExtensions';
import {
  buildLocalQrPaymentCard,
  buildSpdQrPayload,
  issueLocalProforma,
} from '../payment/paymentModel';
import { resolvePublicOffer } from '../offer/offerRegistry';

const offer = resolvePublicOffer('domy-s-energi')!;

function confirmedOrder() {
  const draft = buildOrderDraft(
    offer,
    'starter',
    {
      companyName: 'Domy s energií s.r.o.',
      contactName: 'Jana Energetická',
      email: 'jana@domysenergii.cz',
      phone: '+420777200300',
      ico: '06123456',
      note: '',
    },
    true,
  );
  return {
    ...draft,
    orderId: 'OFF-TEST-001',
    confirmedAt: '2026-08-04T10:00:00.000Z',
  };
}

describe('CAP-CE-02 checkout runtime', () => {
  it('moves select → checkout → confirm → proforma', () => {
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
      {
        type: 'set-terms',
        accepted: true,
        acceptedAt: '2026-08-04T09:59:00.000Z',
      },
      offer,
    );
    state = reduceOfferCheckout(state, { type: 'submit-checkout' }, offer);
    assert.equal(state.step, 'confirm');
    assert.equal(state.formError, null);
    assert.equal(state.termsAcceptedAt, '2026-08-04T09:59:00.000Z');

    state = reduceOfferCheckout(
      state,
      {
        type: 'confirm-order',
        orderId: 'OFF-TEST-001',
        confirmedAt: '2026-08-04T10:00:00.000Z',
      },
      offer,
    );
    assert.equal(state.step, 'proforma');
    assert.equal(state.order?.orderId, 'OFF-TEST-001');
    assert.equal(state.order?.packageId, 'starter');
    assert.equal(state.order?.priceCzk, 14_970);
    assert.ok(state.payment.proforma !== null);
    assert.equal(state.payment.lifecycle, 'waiting_payment');
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
    const order = confirmedOrder();

    assert.equal(buildProformaRequest(order).orderId, 'OFF-TEST-001');
    assert.equal(buildProformaRequest(order).amountCzk, 14_970);
    assert.equal(buildQrPaymentPayload(order).currency, 'CZK');
    assert.equal(
      buildPaymentSessionRequest(order, {
        returnUrl: 'https://conis.cz/ok',
        cancelUrl: 'https://conis.cz/cancel',
      }).orderId,
      'OFF-TEST-001',
    );
    assert.equal(
      buildOrderConfirmedTimelineEvent(order).type,
      'offer.order.confirmed',
    );
  });
});

describe('CAP-CE-03 payment runtime', () => {
  it('moves proforma → qr → payment received → pilot ready', () => {
    const order = confirmedOrder();
    let state = createInitialCheckoutState(offer);
    state = reduceOfferCheckout(
      state,
      { type: 'select-package', packageId: 'starter' },
      offer,
    );
    state = reduceOfferCheckout(
      state,
      {
        type: 'patch-contact',
        patch: order.contact,
      },
      offer,
    );
    state = reduceOfferCheckout(
      state,
      {
        type: 'set-terms',
        accepted: true,
        acceptedAt: '2026-08-04T09:59:00.000Z',
      },
      offer,
    );
    state = reduceOfferCheckout(
      state,
      {
        type: 'confirm-order',
        orderId: order.orderId,
        confirmedAt: order.confirmedAt,
      },
      offer,
    );

    assert.equal(state.step, 'proforma');
    assert.match(state.payment.proforma?.number ?? '', /^PF-/);

    state = reduceOfferCheckout(
      state,
      {
        type: 'payment',
        action: { type: 'open-qr', order },
      },
      offer,
    );
    assert.equal(state.step, 'qr');
    assert.equal(state.payment.lifecycle, 'waiting_payment');
    assert.equal(state.payment.proforma?.status, 'awaiting_payment');
    assert.ok(state.payment.qr?.qrPayload.includes('SPD*1.0'));
    assert.ok(state.payment.qr?.accountNumber.includes('/'));

    state = reduceOfferCheckout(
      state,
      {
        type: 'payment',
        action: {
          type: 'mark-payment-received',
          paidAt: '2026-08-04T11:00:00.000Z',
        },
      },
      offer,
    );
    assert.equal(state.step, 'complete');
    assert.equal(state.payment.lifecycle, 'payment_received');
    assert.equal(state.payment.proforma?.status, 'paid');
    assert.equal(state.payment.paidAt, '2026-08-04T11:00:00.000Z');

    state = reduceOfferCheckout(
      state,
      { type: 'payment', action: { type: 'mark-pilot-ready' } },
      offer,
    );
    assert.equal(state.payment.lifecycle, 'pilot_ready');
  });

  it('builds PaymentReceived · BuilderReady · Office handoff payloads', () => {
    const order = confirmedOrder();
    const proforma = issueLocalProforma(order, order.confirmedAt, 'PF-LOCAL');
    const qr = buildLocalQrPaymentCard(order);
    assert.match(qr.qrPayload, /ACC:CZ/);
    assert.equal(
      buildSpdQrPayload({
        iban: qr.iban,
        amountCzk: qr.amountCzk,
        variableSymbol: qr.variableSymbol,
        message: qr.message,
      }),
      qr.qrPayload,
    );

    const paidAt = '2026-08-04T12:00:00.000Z';
    const received = buildPaymentReceivedEvent({ order, proforma, paidAt });
    assert.equal(received.type, 'offer.payment.received');
    assert.equal(received.proformaId, 'PF-LOCAL');

    const builder = buildBuilderReadyEvent({
      order,
      occurredAt: paidAt,
    });
    assert.equal(builder.type, 'offer.builder.ready');

    const handoff = buildOfficeHandoffRequest({ order, proforma, paidAt });
    assert.equal(handoff.lifecycle, 'pilot_ready');
    assert.equal(handoff.contactEmail, order.contact.email);
    assert.equal(handoff.amountCzk, 14_970);
  });
});
