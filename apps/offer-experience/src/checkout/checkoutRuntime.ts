/**
 * CAP-CE-02 / CAP-CE-03 — Offer Checkout + Payment Runtime (in-memory UI state).
 * No backend · no Office · prepared for payment / handoff integrations.
 */

import type { OfferPackage, OfferPackageId, PublicOffer } from '../offer/offerModel';
import { getOfferPackage } from '../offer/offerModel';
import {
  createEmptyPaymentState,
  type OfferPaymentRuntimeState,
  type OfferProformaDocument,
} from '../payment/paymentModel';
import {
  reduceOfferPayment,
  type OfferPaymentAction,
} from '../payment/paymentRuntime';

export type CheckoutStep =
  | 'select'
  | 'checkout'
  | 'confirm'
  | 'proforma'
  | 'qr'
  | 'complete';

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
  readonly termsAcceptedAt: string | null;
  readonly order: CheckoutConfirmedOrder | null;
  readonly payment: OfferPaymentRuntimeState;
  readonly formError: string | null;
};

export type OfferCheckoutAction =
  | { readonly type: 'select-package'; readonly packageId: OfferPackageId }
  | { readonly type: 'begin-checkout' }
  | {
      readonly type: 'patch-contact';
      readonly patch: Partial<CheckoutContactForm>;
    }
  | {
      readonly type: 'set-terms';
      readonly accepted: boolean;
      readonly acceptedAt: string | null;
    }
  | { readonly type: 'submit-checkout' }
  | { readonly type: 'set-confirmation-error'; readonly error: string | null }
  | { readonly type: 'back-to-select' }
  | { readonly type: 'back-to-checkout' }
  | {
      readonly type: 'confirm-order';
      readonly orderId: string;
      readonly confirmedAt: string;
      readonly proforma?: OfferProformaDocument;
    }
  | { readonly type: 'payment'; readonly action: OfferPaymentAction }
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
    termsAcceptedAt: null,
    order: null,
    payment: createEmptyPaymentState(),
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

function syncStepFromPayment(
  payment: OfferPaymentRuntimeState,
): CheckoutStep {
  switch (payment.step) {
    case 'proforma':
      return 'proforma';
    case 'qr':
      return 'qr';
    case 'complete':
      return 'complete';
    default: {
      const _exhaustive: never = payment.step;
      return _exhaustive;
    }
  }
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
        payment: createEmptyPaymentState(),
        step:
          state.step === 'proforma' ||
          state.step === 'qr' ||
          state.step === 'complete'
            ? 'select'
            : state.step,
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
        payment: createEmptyPaymentState(),
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
        termsAcceptedAt: action.accepted ? action.acceptedAt : null,
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
    case 'set-confirmation-error':
      return { ...state, formError: action.error };
    case 'back-to-select':
      return {
        ...state,
        step: 'select',
        formError: null,
        order: null,
        payment: createEmptyPaymentState(),
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
      const order: CheckoutConfirmedOrder = {
        ...draft,
        orderId: action.orderId,
        confirmedAt: action.confirmedAt,
      };
      const payment = reduceOfferPayment(createEmptyPaymentState(), {
        type: 'issue-proforma',
        order,
        issuedAt: action.confirmedAt,
        proforma: action.proforma,
      });
      return {
        ...state,
        step: 'proforma',
        formError: null,
        order,
        payment,
      };
    }
    case 'payment': {
      if (state.order === null) {
        return {
          ...state,
          formError: 'Platba vyžaduje potvrzenou objednávku.',
        };
      }
      const payment = reduceOfferPayment(state.payment, action.action);
      return {
        ...state,
        payment,
        step: syncStepFromPayment(payment),
        formError: payment.error,
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
