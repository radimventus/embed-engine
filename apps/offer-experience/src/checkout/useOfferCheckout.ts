import { useCallback, useMemo, useReducer } from 'react';

import type { OfferPackageId, PublicOffer } from '../offer/offerModel';
import {
  buildBuilderReadyEvent,
  buildOfficeHandoffRequest,
  buildPaymentReceivedEvent,
  notifyPaymentExtensions,
  type OfferPaymentIntegrations,
} from '../payment/paymentExtensions';
import {
  buildLocalQrPaymentCard,
  issueLocalProforma,
} from '../payment/paymentModel';
import {
  notifyCheckoutExtensions,
  type OfferCheckoutIntegrations,
} from './checkoutExtensions';
import {
  buildOrderDraft,
  createClientOrderId,
  createInitialCheckoutState,
  reduceOfferCheckout,
  selectedPackageFromState,
  type CheckoutContactForm,
  type OfferCheckoutAction,
  type OfferCheckoutState,
} from './checkoutRuntime';

export type { OfferCheckoutIntegrations } from './checkoutExtensions';
export type { OfferPaymentIntegrations } from '../payment/paymentExtensions';

export type UseOfferCheckoutResult = {
  readonly state: OfferCheckoutState;
  readonly selectedPackage: ReturnType<typeof selectedPackageFromState>;
  readonly selectPackage: (packageId: OfferPackageId) => void;
  readonly beginCheckout: () => void;
  readonly patchContact: (patch: Partial<CheckoutContactForm>) => void;
  readonly setTermsAccepted: (accepted: boolean) => void;
  readonly submitCheckout: () => void;
  readonly backToSelect: () => void;
  readonly backToCheckout: () => void;
  readonly confirmOrder: () => void;
  readonly continueToQr: () => void;
  readonly confirmPaymentReceived: () => void;
  readonly markPilotReady: () => void;
  readonly reset: () => void;
};

/**
 * CAP-CE-02 / CAP-CE-03 — React binding for Checkout + Payment Runtime.
 */
export function useOfferCheckout(
  offer: PublicOffer,
  integrations: OfferCheckoutIntegrations & OfferPaymentIntegrations = {},
): UseOfferCheckoutResult {
  const [state, dispatch] = useReducer(
    (current: OfferCheckoutState, action: OfferCheckoutAction) =>
      reduceOfferCheckout(current, action, offer),
    offer,
    createInitialCheckoutState,
  );

  const selectedPackage = useMemo(
    () => selectedPackageFromState(state),
    [state],
  );

  const selectPackage = useCallback((packageId: OfferPackageId) => {
    dispatch({ type: 'select-package', packageId });
  }, []);

  const beginCheckout = useCallback(() => {
    dispatch({ type: 'begin-checkout' });
  }, []);

  const patchContact = useCallback((patch: Partial<CheckoutContactForm>) => {
    dispatch({ type: 'patch-contact', patch });
  }, []);

  const setTermsAccepted = useCallback((accepted: boolean) => {
    dispatch({ type: 'set-terms', accepted });
  }, []);

  const submitCheckout = useCallback(() => {
    dispatch({ type: 'submit-checkout' });
  }, []);

  const backToSelect = useCallback(() => {
    dispatch({ type: 'back-to-select' });
  }, []);

  const backToCheckout = useCallback(() => {
    dispatch({ type: 'back-to-checkout' });
  }, []);

  const confirmOrder = useCallback(() => {
    if (state.selectedPackageId === null) return;
    const orderId = createClientOrderId();
    const confirmedAt = new Date().toISOString();
    const draft = buildOrderDraft(
      offer,
      state.selectedPackageId,
      state.contact,
      state.termsAccepted,
    );
    const order = { ...draft, orderId, confirmedAt };

    void (async () => {
      const customProforma = integrations.issueProforma
        ? await integrations.issueProforma(order)
        : undefined;
      const proforma =
        customProforma ?? issueLocalProforma(order, confirmedAt);

      dispatch({
        type: 'confirm-order',
        orderId,
        confirmedAt,
        proforma,
      });

      await notifyCheckoutExtensions(order, integrations);
      await notifyPaymentExtensions(integrations, {
        timeline: {
          type: 'offer.proforma.issued',
          occurredAt: confirmedAt,
          orderId,
          proformaId: proforma.proformaId,
          amountCzk: order.priceCzk,
        },
      });
    })();
  }, [
    integrations,
    offer,
    state.contact,
    state.selectedPackageId,
    state.termsAccepted,
  ]);

  const continueToQr = useCallback(() => {
    if (state.order === null || state.payment.proforma === null) return;
    const order = state.order;
    const proforma = state.payment.proforma;

    void (async () => {
      const customQr = integrations.createQrPayment
        ? await integrations.createQrPayment(order, proforma)
        : undefined;
      const qr = customQr ?? buildLocalQrPaymentCard(order);

      dispatch({
        type: 'payment',
        action: {
          type: 'open-qr',
          order,
          qr,
        },
      });

      await notifyPaymentExtensions(integrations, {
        timeline: {
          type: 'offer.payment.waiting',
          occurredAt: new Date().toISOString(),
          orderId: order.orderId,
          variableSymbol: qr.variableSymbol,
        },
      });
    })();
  }, [integrations, state.order, state.payment.proforma]);

  const confirmPaymentReceived = useCallback(() => {
    if (state.order === null || state.payment.proforma === null) return;
    const paidAt = new Date().toISOString();
    const order = state.order;
    const proforma = state.payment.proforma;
    dispatch({
      type: 'payment',
      action: { type: 'mark-payment-received', paidAt },
    });
    const paymentReceived = buildPaymentReceivedEvent({
      order,
      proforma,
      paidAt,
    });
    void notifyPaymentExtensions(integrations, {
      timeline: paymentReceived,
      paymentReceived,
    });
  }, [integrations, state.order, state.payment.proforma]);

  const markPilotReady = useCallback(() => {
    if (
      state.order === null ||
      state.payment.proforma === null ||
      state.payment.paidAt === null
    ) {
      return;
    }
    const order = state.order;
    const proforma = state.payment.proforma;
    const paidAt = state.payment.paidAt;
    dispatch({ type: 'payment', action: { type: 'mark-pilot-ready' } });
    const occurredAt = new Date().toISOString();
    const builderReady = buildBuilderReadyEvent({ order, occurredAt });
    const officeHandoff = buildOfficeHandoffRequest({
      order,
      proforma,
      paidAt,
    });
    void notifyPaymentExtensions(integrations, {
      timeline: builderReady,
      builderReady,
      officeHandoff,
    });
  }, [
    integrations,
    state.order,
    state.payment.paidAt,
    state.payment.proforma,
  ]);

  const reset = useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

  return {
    state,
    selectedPackage,
    selectPackage,
    beginCheckout,
    patchContact,
    setTermsAccepted,
    submitCheckout,
    backToSelect,
    backToCheckout,
    confirmOrder,
    continueToQr,
    confirmPaymentReceived,
    markPilotReady,
    reset,
  };
}
