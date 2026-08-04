/**
 * PT-13 — Offer Experience → Automation bridge.
 * Maps commercial extension events into Business Events.
 * Used at app host wiring — not from React leaf UI.
 */

import {
  buildBusinessEvent,
  type BusinessEvent,
} from '../domain/businessEvents';
import type { AutomationRuntime } from '../runtime/automationRuntime';

export type OfferAutomationTimelineLike =
  | { readonly type: 'offer.order.confirmed'; readonly occurredAt: string; readonly orderId: string; readonly packageId: string; readonly amountCzk: number; readonly partnerName: string }
  | { readonly type: 'offer.proforma.issued'; readonly occurredAt: string; readonly orderId: string; readonly proformaId: string; readonly amountCzk: number }
  | { readonly type: 'offer.payment.waiting'; readonly occurredAt: string; readonly orderId: string; readonly variableSymbol: string }
  | { readonly type: 'offer.payment.received'; readonly occurredAt: string; readonly orderId: string; readonly proformaId: string; readonly amountCzk: number; readonly partnerName: string; readonly packageId: string }
  | { readonly type: 'offer.builder.ready'; readonly occurredAt: string; readonly orderId: string; readonly partnerName: string; readonly packageId: string; readonly companyName: string };

export function mapOfferTimelineToBusinessEvents(
  event: OfferAutomationTimelineLike,
): readonly BusinessEvent[] {
  switch (event.type) {
    case 'offer.order.confirmed':
      return [
        buildBusinessEvent({
          kind: 'OfferAccepted',
          occurredAt: event.occurredAt,
          source: 'offer-experience',
          correlationId: event.orderId,
          payload: {
            orderId: event.orderId,
            packageId: event.packageId,
            amountCzk: event.amountCzk,
            partnerName: event.partnerName,
          },
        }),
        buildBusinessEvent({
          kind: 'OrderConfirmed',
          occurredAt: event.occurredAt,
          source: 'offer-experience',
          correlationId: event.orderId,
          payload: {
            orderId: event.orderId,
            packageId: event.packageId,
            amountCzk: event.amountCzk,
            partnerName: event.partnerName,
          },
        }),
      ];
    case 'offer.proforma.issued':
      return [
        buildBusinessEvent({
          kind: 'ProformaGenerated',
          occurredAt: event.occurredAt,
          source: 'offer-experience',
          correlationId: event.orderId,
          payload: {
            orderId: event.orderId,
            proformaId: event.proformaId,
            amountCzk: event.amountCzk,
          },
        }),
      ];
    case 'offer.payment.waiting':
      return [];
    case 'offer.payment.received':
      return [
        buildBusinessEvent({
          kind: 'PaymentConfirmed',
          occurredAt: event.occurredAt,
          source: 'offer-experience',
          correlationId: event.orderId,
          payload: {
            orderId: event.orderId,
            proformaId: event.proformaId,
            amountCzk: event.amountCzk,
            partnerName: event.partnerName,
            packageId: event.packageId,
          },
        }),
      ];
    case 'offer.builder.ready':
      return [
        buildBusinessEvent({
          kind: 'PilotReady',
          occurredAt: event.occurredAt,
          source: 'offer-experience',
          correlationId: event.orderId,
          payload: {
            orderId: event.orderId,
            partnerName: event.partnerName,
            packageId: event.packageId,
            companyName: event.companyName,
          },
        }),
      ];
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

export type OfferAutomationIntegrationSurface = {
  readonly emitTimelineEvent?: (
    event: OfferAutomationTimelineLike,
  ) => Promise<void> | void;
  readonly onPaymentReceived?: (
    event: Extract<OfferAutomationTimelineLike, { type: 'offer.payment.received' }>,
  ) => Promise<void> | void;
  readonly onBuilderReady?: (
    event: Extract<OfferAutomationTimelineLike, { type: 'offer.builder.ready' }>,
  ) => Promise<void> | void;
};

/**
 * Host wiring: pass returned surface into Offer checkout/payment integrations.
 * PaymentConfirmed is published via timeline only (avoid duplicate with onPaymentReceived).
 */
export function createOfferAutomationIntegrations(
  runtime: AutomationRuntime,
): OfferAutomationIntegrationSurface {
  const publishMapped = async (event: OfferAutomationTimelineLike) => {
    for (const businessEvent of mapOfferTimelineToBusinessEvents(event)) {
      await runtime.publish(businessEvent);
    }
  };

  return {
    emitTimelineEvent: publishMapped,
    onBuilderReady: publishMapped,
  };
}
