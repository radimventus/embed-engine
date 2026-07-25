/**
 * PT-004 / PT-005 — LLM Foundation + Prompt Builder public surface.
 * @embed-engine/ai
 *
 * Vendor-neutral contracts, MockProvider, PromptBuilder.
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
  OpenAIProvider,
  OPENAI_PROVIDER_ID,
  type OpenAIProviderOptions,
} from "./providers/OpenAIProvider";

export {
  AIService,
  createAIService,
  type AIServiceOptions,
} from "./services/AIService";

export {
  createPromptBuilder,
  promptPackageToChatRequest,
  PromptBuilder,
  DEFAULT_PARTNER_IDENTITY,
  assemblePromptPackage,
  createSystemPromptFactory,
  DEFAULT_SYSTEM_PROMPT_LINES,
  buildObjectContext,
  buildConversationContext,
  DEFAULT_CONVERSATION_WINDOW,
  emptyDecisionMemory,
  mergeDecisionMemory,
  emptyKnowledgeContext,
  PROMPT_SECTION_ORDER,
  type PromptBuilderInput,
  type PromptBuilderOptions,
  type PromptPackage,
  type PromptSection,
  type PromptSectionId,
  type DecisionMemory,
  type MemoryItem,
  type MemoryValue,
  type KnowledgeContext,
  type KnowledgeEntry,
  type ObjectContextInput,
  type ConversationContextInput,
} from "./prompt";

export {
  createConversationAnalyzer,
  createAnalysisService,
  createAnalyzerProvider,
  ConversationAnalyzer,
  AnalysisService,
  LlmAnalyzerProvider,
  deterministicAnalyze,
  emptyAnalysisResult,
  ANALYZER_SYSTEM_PROMPT,
  type AnalysisRequest,
  type AnalysisResult,
  type AnalyzerProvider,
  type AnalyzerProviderOptions,
  type ConversationAnalyzerOptions,
  type AnalysisServiceOptions,
  type AnalyzeAndMergeResult,
} from "./analyzer";
