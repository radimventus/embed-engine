/**
 * Embed Delivery bootstrap (WP-B).
 *
 * Owns Adapter selection for Embed hosts. Experience passes config only —
 * never constructs OpenAIProvider.
 */

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";
import { OpenAIProvider } from "../providers/OpenAIProvider";
import type { AIDelivery } from "./AIDelivery";
import { createDirectAdapterDelivery } from "./DirectAdapterDelivery";

export type EmbedAIDeliveryConfig = {
  /** When missing/empty → same missing-key failure as previous Experience bootstrap. */
  readonly apiKey?: string;
  readonly model?: string;
};

/**
 * Build Delivery for Embed Experience (Local / Demo / Published).
 * Missing API key keeps the historical fail-fast message for UX parity.
 */
export function createEmbedAIDelivery(
  config: EmbedAIDeliveryConfig = {},
): AIDelivery {
  const apiKey = config.apiKey?.trim() ?? "";
  if (apiKey.length === 0) {
    return createDirectAdapterDelivery({
      async chat(_request: ChatRequest): Promise<ChatResponse> {
        throw new Error(
          "OpenAIProvider: missing API key. Set OPENAI_API_KEY or pass apiKey.",
        );
      },
    });
  }

  const model = config.model?.trim();
  return createDirectAdapterDelivery(
    new OpenAIProvider({
      apiKey,
      ...(model !== undefined && model.length > 0 ? { model } : {}),
    }),
  );
}
