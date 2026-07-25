/**
 * Embed Delivery bootstrap — OpenAI Adapter wiring (CAP-AI-ADAPTER-01).
 *
 * Lives under adapter/openai so Delivery stays vendor-neutral.
 * Experience passes config only — never constructs OpenAIAdapter.
 */

import type { ChatRequest } from "../../models/ChatRequest";
import type { ChatResponse } from "../../models/ChatResponse";
import type { AIDelivery } from "../../delivery/AIDelivery";
import { createDirectAdapterDelivery } from "../../delivery/DirectAdapterDelivery";
import { OpenAIAdapter } from "./OpenAIAdapter";
import { missingOpenAIApiKeyFailure } from "./errors";

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
        throw missingOpenAIApiKeyFailure();
      },
    });
  }

  const model = config.model?.trim();
  return createDirectAdapterDelivery(
    new OpenAIAdapter({
      apiKey,
      ...(model !== undefined && model.length > 0 ? { model } : {}),
    }),
  );
}
