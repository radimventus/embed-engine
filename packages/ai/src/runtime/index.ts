/**
 * AI Runtime boundary (AID-01).
 *
 * WP-A: physical package boundary only. Orchestration still lives in
 * `services/`, `prompt/`, `memory/`, `analyzer/`, `recommendation/`,
 * `diagnostics/`, and `recorder/` until a later move CAP.
 *
 * This barrel re-exports the Runtime façade for in-package consumers that
 * prefer the architectural path. Public `@embed-engine/ai` root exports
 * remain unchanged and continue to point at the existing modules.
 */

export const AI_RUNTIME_BOUNDARY = "AID-01/runtime" as const;

export {
  AIService,
  createAIService,
  createAIServiceFromDelivery,
  DEFAULT_CONVERSATION_TIMEOUT_MS,
  type AIServiceOptions,
  type SendMessageInput,
  type SendMessageResult,
} from "../services/AIService";

export {
  ConversationError,
  conversationUserMessage,
  mapConversationError,
  type ConversationErrorCode,
} from "../services/ConversationError";
