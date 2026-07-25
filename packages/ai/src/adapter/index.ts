/**
 * AI Adapter boundary (AID-01).
 *
 * WP-A placeholder — concrete Adapters (OpenAI, Mock) remain under
 * `src/providers/` until `refactor(ai): extract OpenAI adapter`.
 *
 * Future home for:
 * - Adapter port (today: LLMProvider)
 * - adapter/openai/
 * - adapter/mock/
 */

export const AI_ADAPTER_BOUNDARY = "AID-01/adapter" as const;
