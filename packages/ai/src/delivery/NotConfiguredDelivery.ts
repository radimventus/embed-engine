/**
 * Not-configured Delivery — valid AID-01 mode for Published Embed
 * without a Delivery edge (and Local without private credentials).
 */

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";
import { AdapterFailure } from "../adapter/AdapterFailure";
import type { AIAdapter } from "../adapter/port";
import type { AIDelivery } from "./AIDelivery";
import { createDirectAdapterDelivery } from "./DirectAdapterDelivery";

export type NotConfiguredReason =
  | "missing_delivery_url"
  | "missing_local_credentials"
  | "disabled";

const DELIVERY_NOT_CONFIGURED_UX =
  "AI Delivery není nakonfigurovaná. Kontaktujte provozovatele.";

export function createNotConfiguredDelivery(
  reason: NotConfiguredReason = "disabled",
): AIDelivery {
  const diagnostic =
    reason === "missing_local_credentials"
      ? null
      : DELIVERY_NOT_CONFIGURED_UX;

  const adapter: AIAdapter & { readonly id: string } = {
    id: "not-configured",
    async chat(_request: ChatRequest): Promise<ChatResponse> {
      throw new AdapterFailure(
        "missing_api_key",
        "AI Delivery is not configured for this host.",
        diagnostic !== null ? { diagnostic } : undefined,
      );
    },
  };

  return createDirectAdapterDelivery(adapter);
}
