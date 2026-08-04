/**
 * CAP-CE-02 — Offer Checkout Runtime (in-memory UI state).
 * No backend · no Office · prepared for PT-03 payment integrations.
 */

import type { OfferPackage, OfferPackageId, PublicOffer } from '../offer/offerModel';
import { getOfferPackage } from '../offer/offerModel';

export type CheckoutStep = 'select' | 'checkout' | 'confirm' | 'success';

export type CheckoutContactForm = {
  readonly companyName: string;
  readonly contactName: string;
  readonly email: string;
  readonly phone: string;
  readonly ico: string;
  readonly note: string;
};

export type CheckoutOrderDraft = {
  readonly offerSlug: string;
  readonly partnerName: string;
  readonly packageId: OfferPackageId;
  readonly packageName: string;
  readonly priceCzk: number;
  readonly licenseLabel: string;
  readonly trialDays: number;
  readonly contact: CheckoutContactForm;
  readonly termsAccepted: boolean;
};

export type CheckoutConfirmedOrder = CheckoutOrderDraft & {
  readonly orderId: string;
  readonly confirmedAt: string;
};

export type OfferCheckoutState = {
  readonly step: CheckoutStep;
  readonly selectedPackageId: OfferPackageId | null;
  readonly contact: CheckoutContactForm;
  readonly termsAccepted: boolean;
  readonly order: CheckoutConfirmedOrder | null;
  readonly formError: string | null;
};

export type OfferCheckoutAction =
  | { readonly type: 'select-package'; readonly packageId: OfferPackageId }
  | { readonly type: 'begin-checkout' }
  | {
      readonly type: 'patch-contact';
      readonly patch: Partial<CheckoutContactForm>;
    }
  | { readonly type: 'set-terms'; readonly accepted: boolean }
  | { readonly type: 'submit-checkout' }
  | { readonly type: 'back-to-select' }
  | { readonly type: 'back-to-checkout' }
  | { readonly type: 'confirm-order'; readonly orderId: string; readonly confirmedAt: string }
  | { readonly type: 'reset' };

export function emptyCheckoutContact(
  offer: PublicOffer,
): CheckoutContactForm {
  return {
    companyName: offer.partnerName,
    contactName: offer.contactName ?? '',
    email: '',
    phone: '',
    ico: '',
    note: '',
  };
}

export function createInitialCheckoutState(
  offer: PublicOffer,
): OfferCheckoutState {
  return {
    step: 'select',
    selectedPackageId: null,
    contact: emptyCheckoutContact(offer),
    termsAccepted: false,
    order: null,
    formError: null,
  };
}

export function validateCheckoutContact(
  contact: CheckoutContactForm,
  termsAccepted: boolean,
): string | null {
  if (contact.companyName.trim().length === 0) {
    return 'Vyplňte název společnosti.';
  }
  if (contact.contactName.trim().length === 0) {
    return 'Vyplňte jméno kontaktní osoby.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
    return 'Zadejte platný e-mail.';
  }
  if (contact.phone.trim().length < 9) {
    return 'Zadejte telefonní číslo.';
  }
  if (!termsAccepted) {
    return 'Pro pokračování potvrďte obchodní podmínky.';
  }
  return null;
}

export function buildOrderDraft(
  offer: PublicOffer,
  packageId: OfferPackageId,
  contact: CheckoutContactForm,
  termsAccepted: boolean,
): CheckoutOrderDraft {
  const pkg = getOfferPackage(packageId);
  return {
    offerSlug: offer.slug,
    partnerName: offer.partnerName,
    packageId: pkg.id,
    packageName: pkg.name,
    priceCzk: pkg.priceCzk,
    licenseLabel: pkg.housesLabel,
    trialDays: pkg.trialDays,
    contact: {
      companyName: contact.companyName.trim(),
      contactName: contact.contactName.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      ico: contact.ico.trim(),
      note: contact.note.trim(),
    },
    termsAccepted,
  };
}

export function selectedPackageFromState(
  state: OfferCheckoutState,
): OfferPackage | null {
  if (state.selectedPackageId === null) return null;
  return getOfferPackage(state.selectedPackageId);
}

export function reduceOfferCheckout(
  state: OfferCheckoutState,
  action: OfferCheckoutAction,
  offer: PublicOffer,
): OfferCheckoutState {
  switch (action.type) {
    case 'select-package':
      return {
        ...state,
        selectedPackageId: action.packageId,
        formError: null,
        order: null,
        step: state.step === 'success' ? 'select' : state.step,
      };
    case 'begin-checkout':
      if (state.selectedPackageId === null) {
        return {
          ...state,
          formError: 'Nejprve vyberte balíček.',
        };
      }
      return {
        ...state,
        step: 'checkout',
        formError: null,
        order: null,
      };
    case 'patch-contact':
      return {
        ...state,
        contact: { ...state.contact, ...action.patch },
        formError: null,
      };
    case 'set-terms':
      return {
        ...state,
        termsAccepted: action.accepted,
        formError: null,
      };
    case 'submit-checkout': {
      if (state.selectedPackageId === null) {
        return { ...state, formError: 'Nejprve vyberte balíček.' };
      }
      const error = validateCheckoutContact(
        state.contact,
        state.termsAccepted,
      );
      if (error !== null) {
        return { ...state, formError: error };
      }
      return {
        ...state,
        step: 'confirm',
        formError: null,
      };
    }
    case 'back-to-select':
      return {
        ...state,
        step: 'select',
        formError: null,
        order: null,
      };
    case 'back-to-checkout':
      return {
        ...state,
        step: 'checkout',
        formError: null,
      };
    case 'confirm-order': {
      if (state.selectedPackageId === null) {
        return { ...state, formError: 'Nejprve vyberte balíček.' };
      }
      const draft = buildOrderDraft(
        offer,
        state.selectedPackageId,
        state.contact,
        state.termsAccepted,
      );
      return {
        ...state,
        step: 'success',
        formError: null,
        order: {
          ...draft,
          orderId: action.orderId,
          confirmedAt: action.confirmedAt,
        },
      };
    }
    case 'reset':
      return createInitialCheckoutState(offer);
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

export function createClientOrderId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `OFF-${stamp}-${rand}`;
}
