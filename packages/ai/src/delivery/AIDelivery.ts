/**
 * AI Delivery Port (AID-01 / WP-B).
 *
 * Vendor-neutral boundary between AI Runtime and Delivery.
 * No vendor SDKs, HTTP transport, Gateway, REST, or API keys here.
 */

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";

/**
 * Internal Runtime ↔ Delivery port.
 * Completes one transport chat call (pre-ACC ChatRequest/Response).
 */
export type AIDelivery = {
  readonly chat: (request: ChatRequest) => Promise<ChatResponse>;
};

/** Optional metadata for diagnostics / audit (opaque; not vendor protocol). */
export type AIDeliveryMeta = {
  readonly deliveryId: string;
  readonly model: string | null;
};

export function readDeliveryMeta(delivery: AIDelivery): AIDeliveryMeta {
  const meta = delivery as AIDelivery & {
    readonly id?: unknown;
    readonly model?: unknown;
  };
  return {
    deliveryId: typeof meta.id === "string" ? meta.id : "unknown",
    model: typeof meta.model === "string" ? meta.model : null,
  };
}
