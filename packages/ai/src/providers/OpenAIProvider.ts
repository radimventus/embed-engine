/**
 * Compat re-export — OpenAI Adapter lives under `adapter/openai/`.
 * @deprecated Import from `@embed-engine/ai` or `adapter/openai`.
 */

export {
  OpenAIAdapter,
  OpenAIProvider,
  OPENAI_ADAPTER_ID,
  OPENAI_PROVIDER_ID,
  type OpenAIAdapterOptions,
  type OpenAIProviderOptions,
} from "../adapter/openai";
