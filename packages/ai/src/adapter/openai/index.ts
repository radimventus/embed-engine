/**
 * OpenAI Adapter package surface.
 */

export {
  OpenAIAdapter,
  OpenAIProvider,
  OPENAI_ADAPTER_ID,
  OPENAI_PROVIDER_ID,
  type OpenAIAdapterOptions,
  type OpenAIProviderOptions,
} from "./OpenAIAdapter";

export {
  createEmbedAIDelivery,
  type EmbedAIDeliveryConfig,
} from "./createEmbedAIDelivery";

export {
  OPENAI_MISSING_API_KEY_MESSAGE,
  missingOpenAIApiKeyFailure,
  mapOpenAIHttpFailure,
  mapOpenAITransportFailure,
  invalidOpenAIResponseFailure,
} from "./errors";
