import { useCallback, useMemo, useReducer } from 'react';

import type { OfferPackageId, PublicOffer } from '../offer/offerModel';
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
  readonly reset: () => void;
};

/**
 * CAP-CE-02 — React binding for Offer Checkout Runtime.
 */
export function useOfferCheckout(
  offer: PublicOffer,
  integrations: OfferCheckoutIntegrations = {},
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
    dispatch({ type: 'confirm-order', orderId, confirmedAt });
    void notifyCheckoutExtensions(
      { ...draft, orderId, confirmedAt },
      integrations,
    );
  }, [
    integrations,
    offer,
    state.contact,
    state.selectedPackageId,
    state.termsAccepted,
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
    reset,
  };
}
