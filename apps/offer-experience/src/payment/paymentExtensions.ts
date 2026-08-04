/**
 * CAP-CE-03 — Integration points for PaymentReceived · BuilderReady ·
 * Timeline · Office handoff. Interfaces only — no backend.
 */

import type { CheckoutConfirmedOrder } from '../checkout/checkoutRuntime';
import type {
  OfferPaymentLifecycle,
  OfferProformaDocument,
  OfferQrPaymentCard,
} from './paymentModel';

export type OfferPaymentReceivedEvent = {
  readonly type: 'offer.payment.received';
  readonly occurredAt: string;
  readonly orderId: string;
  readonly proformaId: string;
  readonly amountCzk: number;
  readonly partnerName: string;
  readonly packageId: string;
};

export type OfferBuilderReadyEvent = {
  readonly type: 'offer.builder.ready';
  readonly occurredAt: string;
  readonly orderId: string;
  readonly partnerName: string;
  readonly packageId: string;
  readonly companyName: string;
};

export type OfferPaymentTimelineEvent =
  | {
      readonly type: 'offer.proforma.issued';
      readonly occurredAt: string;
      readonly orderId: string;
      readonly proformaId: string;
      readonly amountCzk: number;
    }
  | {
      readonly type: 'offer.payment.waiting';
      readonly occurredAt: string;
      readonly orderId: string;
      readonly variableSymbol: string;
    }
  | OfferPaymentReceivedEvent
  | OfferBuilderReadyEvent;

export type OfferOfficeHandoffRequest = {
  readonly orderId: string;
  readonly proformaId: string;
  readonly partnerName: string;
  readonly companyName: string;
  readonly contactEmail: string;
  readonly contactName: string;
  readonly packageId: string;
  readonly packageName: string;
  readonly amountCzk: number;
  readonly paidAt: string;
  readonly lifecycle: Extract<OfferPaymentLifecycle, 'pilot_ready'>;
};

export type OfferOfficeHandoffResult = {
  readonly handoffId: string;
  readonly accepted: boolean;
  readonly workspaceHint: string | null;
};

export type OfferPaymentIntegrations = {
  readonly issueProforma?: (
    order: CheckoutConfirmedOrder,
  ) => Promise<OfferProformaDocument>;
  readonly createQrPayment?: (
    order: CheckoutConfirmedOrder,
    proforma: OfferProformaDocument,
  ) => Promise<OfferQrPaymentCard>;
  readonly onPaymentReceived?: (
    event: OfferPaymentReceivedEvent,
  ) => Promise<void> | void;
  readonly onBuilderReady?: (
    event: OfferBuilderReadyEvent,
  ) => Promise<void> | void;
  readonly emitTimelineEvent?: (
    event: OfferPaymentTimelineEvent,
  ) => Promise<void> | void;
  readonly handoffToOffice?: (
    request: OfferOfficeHandoffRequest,
  ) => Promise<OfferOfficeHandoffResult>;
};

export function buildPaymentReceivedEvent(input: {
  readonly order: CheckoutConfirmedOrder;
  readonly proforma: OfferProformaDocument;
  readonly paidAt: string;
}): OfferPaymentReceivedEvent {
  return {
    type: 'offer.payment.received',
    occurredAt: input.paidAt,
    orderId: input.order.orderId,
    proformaId: input.proforma.proformaId,
    amountCzk: input.order.priceCzk,
    partnerName: input.order.partnerName,
    packageId: input.order.packageId,
  };
}

export function buildBuilderReadyEvent(input: {
  readonly order: CheckoutConfirmedOrder;
  readonly occurredAt: string;
}): OfferBuilderReadyEvent {
  return {
    type: 'offer.builder.ready',
    occurredAt: input.occurredAt,
    orderId: input.order.orderId,
    partnerName: input.order.partnerName,
    packageId: input.order.packageId,
    companyName: input.order.contact.companyName,
  };
}

export function buildOfficeHandoffRequest(input: {
  readonly order: CheckoutConfirmedOrder;
  readonly proforma: OfferProformaDocument;
  readonly paidAt: string;
}): OfferOfficeHandoffRequest {
  return {
    orderId: input.order.orderId,
    proformaId: input.proforma.proformaId,
    partnerName: input.order.partnerName,
    companyName: input.order.contact.companyName,
    contactEmail: input.order.contact.email,
    contactName: input.order.contact.contactName,
    packageId: input.order.packageId,
    packageName: input.order.packageName,
    amountCzk: input.order.priceCzk,
    paidAt: input.paidAt,
    lifecycle: 'pilot_ready',
  };
}

/**
 * Optional notify after local payment milestones.
 * Default no-op keeps Commercial Experience offline-ready.
 */
export async function notifyPaymentExtensions(
  integrations: OfferPaymentIntegrations,
  events: {
    readonly timeline?: OfferPaymentTimelineEvent;
    readonly paymentReceived?: OfferPaymentReceivedEvent;
    readonly builderReady?: OfferBuilderReadyEvent;
    readonly officeHandoff?: OfferOfficeHandoffRequest;
  },
): Promise<void> {
  if (events.timeline !== undefined) {
    await integrations.emitTimelineEvent?.(events.timeline);
  }
  if (events.paymentReceived !== undefined) {
    await integrations.onPaymentReceived?.(events.paymentReceived);
  }
  if (events.builderReady !== undefined) {
    await integrations.onBuilderReady?.(events.builderReady);
  }
  if (events.officeHandoff !== undefined) {
    await integrations.handoffToOffice?.(events.officeHandoff);
  }
}
