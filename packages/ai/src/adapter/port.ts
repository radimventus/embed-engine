/**
 * AI Adapter Contract (AID-01).
 *
 * Vendor-neutral port between AI Delivery and concrete Adapters.
 * Delivery may depend on this port only — never on OpenAI / HTTP / keys.
 */

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";

/**
 * Sole bridge from Delivery to any language-model Adapter.
 * Implementations are swappable — Delivery must not know which.
 */
export interface AIAdapter {
  chat(request: ChatRequest): Promise<ChatResponse>;
}

/**
 * @deprecated Prefer {@link AIAdapter}. Kept for public API / analyzer compat.
 */
export type LLMProvider = AIAdapter;
