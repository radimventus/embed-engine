/**
 * Not-configured Delivery — valid AID-01 mode for Published Embed
 * without a Delivery edge (and Local without private credentials).
 */

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";
import { AdapterFailure } from "../adapter/AdapterFailure";
import type { AIDelivery } from "./AIDelivery";
import { createDirectAdapterDelivery } from "./DirectAdapterDelivery";

export function createNotConfiguredDelivery(): AIDelivery {
  return createDirectAdapterDelivery({
    async chat(_request: ChatRequest): Promise<ChatResponse> {
      throw new AdapterFailure(
        "missing_api_key",
        "AI Delivery is not configured for this host.",
      );
    },
  });
}
