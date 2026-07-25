/**
 * AI Adapter boundary (AID-01).
 *
 * - Adapter Contract: {@link AIAdapter} (`port.ts`)
 * - OpenAI Adapter: `adapter/openai/`
 * - Mock Adapter: `adapter/mock/`
 *
 * Delivery may import the Adapter port + DirectAdapterDelivery wiring.
 * Concrete vendor bootstrap (`createEmbedAIDelivery`) lives under openai/.
 */

export const AI_ADAPTER_BOUNDARY = "AID-01/adapter" as const;

export type { AIAdapter, LLMProvider } from "./port";

export {
  AdapterFailure,
  isAdapterFailure,
  type AdapterFailureCode,
} from "./AdapterFailure";

export {
  MockAdapter,
  MockProvider,
  MOCK_ADAPTER_ID,
  MOCK_PROVIDER_ID,
  MOCK_RESPONSE_CONTENT,
  type MockAdapterOptions,
  type MockProviderOptions,
} from "./mock";

export {
  OpenAIAdapter,
  OpenAIProvider,
  OPENAI_ADAPTER_ID,
  OPENAI_PROVIDER_ID,
  createEmbedAIDelivery,
  type OpenAIAdapterOptions,
  type OpenAIProviderOptions,
  type EmbedAIDeliveryConfig,
} from "./openai";
