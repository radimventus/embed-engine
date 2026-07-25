/**
 * PT-004 — LLM Foundation public surface.
 * @embed-engine/ai
 *
 * Vendor-neutral contracts + MockProvider.
 * No vendor SDKs in this package.
 */

export type { SystemPrompt } from "./models/SystemPrompt";
export { createSystemPrompt } from "./models/SystemPrompt";

export type {
  ConversationContext,
  ObjectContext,
  PromptContext,
} from "./models/PromptContext";

export type {
  ChatMessage,
  ChatRequest,
  ChatRole,
} from "./models/ChatRequest";

export type {
  ChatResponse,
  FinishReason,
  TokenUsage,
} from "./models/ChatResponse";

export type { LLMProvider } from "./providers/LLMProvider";

export {
  MockProvider,
  MOCK_PROVIDER_ID,
  MOCK_RESPONSE_CONTENT,
  type MockProviderOptions,
} from "./providers/MockProvider";

export {
  AIService,
  createAIService,
  type AIServiceOptions,
} from "./services/AIService";
