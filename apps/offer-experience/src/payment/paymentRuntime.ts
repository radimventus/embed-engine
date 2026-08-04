/**
 * CAP-CE-03 — Payment Experience reducer (in-memory UI runtime).
 */

import type { CheckoutConfirmedOrder } from '../checkout/checkoutRuntime';
import {
  buildLocalQrPaymentCard,
  createEmptyPaymentState,
  issueLocalProforma,
  type OfferPaymentRuntimeState,
  type OfferProformaDocument,
  type OfferQrPaymentCard,
} from './paymentModel';

export type OfferPaymentAction =
  | {
      readonly type: 'issue-proforma';
      readonly order: CheckoutConfirmedOrder;
      readonly issuedAt: string;
      readonly proforma?: OfferProformaDocument;
    }
  | {
      readonly type: 'open-qr';
      readonly order: CheckoutConfirmedOrder;
      readonly qr?: OfferQrPaymentCard;
    }
  | { readonly type: 'mark-payment-received'; readonly paidAt: string }
  | { readonly type: 'mark-pilot-ready' }
  | { readonly type: 'reset-payment' };

export function reduceOfferPayment(
  state: OfferPaymentRuntimeState,
  action: OfferPaymentAction,
): OfferPaymentRuntimeState {
  switch (action.type) {
    case 'issue-proforma': {
      const proforma =
        action.proforma ?? issueLocalProforma(action.order, action.issuedAt);
      return {
        ...state,
        step: 'proforma',
        lifecycle: 'waiting_payment',
        proforma: {
          ...proforma,
          status: 'issued',
        },
        qr: null,
        paidAt: null,
        error: null,
      };
    }
    case 'open-qr': {
      if (state.proforma === null) {
        return {
          ...state,
          error: 'Nejprve vystavte proformu.',
        };
      }
      const qr = action.qr ?? buildLocalQrPaymentCard(action.order);
      return {
        ...state,
        step: 'qr',
        lifecycle: 'waiting_payment',
        proforma: {
          ...state.proforma,
          status: 'awaiting_payment',
        },
        qr,
        error: null,
      };
    }
    case 'mark-payment-received': {
      if (state.proforma === null || state.qr === null) {
        return {
          ...state,
          error: 'Platbu nelze potvrdit bez proformy a QR karty.',
        };
      }
      return {
        ...state,
        step: 'complete',
        lifecycle: 'payment_received',
        paidAt: action.paidAt,
        proforma: {
          ...state.proforma,
          status: 'paid',
        },
        error: null,
      };
    }
    case 'mark-pilot-ready': {
      if (state.lifecycle !== 'payment_received' || state.paidAt === null) {
        return {
          ...state,
          error: 'Pilot Ready vyžaduje uhrazenou platbu.',
        };
      }
      return {
        ...state,
        lifecycle: 'pilot_ready',
        error: null,
      };
    }
    case 'reset-payment':
      return createEmptyPaymentState();
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
