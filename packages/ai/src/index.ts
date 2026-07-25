/**
 * PT-004 / PT-005 — LLM Foundation + Prompt Builder public surface.
 * @embed-engine/ai
 *
 * Vendor-neutral contracts, MockProvider, PromptBuilder.
 * No vendor SDKs in this package.
 *
 * WP-A: architectural boundaries under runtime/ delivery/ adapter/ contract/
 * (placeholders + Runtime re-exports). Root export list below is preserved.
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

export type { AIAdapter, LLMProvider } from "./adapter/port";

export {
  MockAdapter,
  MockProvider,
  MOCK_ADAPTER_ID,
  MOCK_PROVIDER_ID,
  MOCK_RESPONSE_CONTENT,
  type MockAdapterOptions,
  type MockProviderOptions,
} from "./adapter/mock";

export {
  OpenAIAdapter,
  OpenAIProvider,
  OPENAI_ADAPTER_ID,
  OPENAI_PROVIDER_ID,
  type OpenAIAdapterOptions,
  type OpenAIProviderOptions,
} from "./adapter/openai";

export {
  AdapterFailure,
  isAdapterFailure,
  type AdapterFailureCode,
} from "./adapter/AdapterFailure";
export {
  AIService,
  createAIService,
  createAIServiceFromDelivery,
  DEFAULT_CONVERSATION_TIMEOUT_MS,
  type AIServiceOptions,
  type SendMessageInput,
  type SendMessageResult,
} from "./services/AIService";

export {
  ConversationError,
  conversationUserMessage,
  mapConversationError,
  type ConversationErrorCode,
} from "./services/ConversationError";

export {
  AIDiagnostics,
  createAIDiagnostics,
  createDisabledDiagnostics,
  createLatencyTrace,
  createPromptTrace,
  createProviderTrace,
  createTokenTrace,
  createMemoryTrace,
  measurePromptPackage,
  countMemoryBuckets,
  countActiveResolved,
  readProviderMeta,
  type AIDiagnosticsOptions,
  type DiagnosticListener,
  type ConversationTrace,
  type LatencyTrace,
  type PromptTrace,
  type ProviderTrace,
  type TokenTrace,
  type MemoryTrace,
  type ConversationTurnTrace,
  type DiagnosticPhase,
  type DiagnosticEvent,
} from "./diagnostics";

export {
  ConversationRecorder,
  createConversationRecorder,
  createDisabledConversationRecorder,
  type ConversationRecorderOptions,
  type ConversationRecord,
  type ConversationExport,
} from "./recorder";

export {
  DecisionRecommendationEngine,
  createDecisionRecommendationEngine,
  recommendDecision,
  emptyRecommendationContext,
  DEFAULT_RECOMMENDATION_RULES,
  budgetConflictRule,
  heatingPreferenceRule,
  energyPriorityRule,
  familySizeRule,
  type DecisionRecommendationInput,
  type DecisionRecommendationEngineOptions,
  type RecommendationContext,
  type RecommendationItem,
  type RecommendationRule,
  type RecommendationRuleInput,
  type RecommendationRuleContribution,
} from "./recommendation";

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
  buildMemoryContext,
  formatMemoryContextSection,
  DEFAULT_CONVERSATION_WINDOW,
  emptyDecisionMemory,
  emptyKnowledgeContext,
  PROMPT_SECTION_ORDER,
  MEMORY_SECTION_ORDER,
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
  type MemorySectionId,
} from "./prompt";

export {
  createDecisionMemoryService,
  DecisionMemoryService,
  createMemoryResolutionEngine,
  MemoryResolutionEngine,
  resolveMemory,
  emptyResolvedMemory,
  LastWriteWinsResolutionStrategy,
  type DecisionMemoryServiceOptions,
  type MemoryUpdateRequest,
  type MemoryUpdateResult,
  type MemoryResolutionEngineOptions,
  type ResolvedMemory,
  type ResolvedMemoryItem,
  type MemoryResolutionStrategy,
} from "./memory";

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
  type AnalysisValue,
  type Fact,
  type Preference,
  type Constraint,
  type Goal,
  type Concern,
  type AcceptedOption,
  type RejectedOption,
  type AnalyzerProvider,
  type AnalyzerProviderOptions,
  type ConversationAnalyzerOptions,
  type AnalysisServiceOptions,
} from "./analyzer";

/** WP-A / WP-B / CAP-AI-ADAPTER-01 — boundaries + Delivery + Adapter. */
export { AI_RUNTIME_BOUNDARY } from "./runtime";
export {
  AI_DELIVERY_BOUNDARY,
  createDirectAdapterDelivery,
  DirectAdapterDelivery,
  isDirectAdapterDelivery,
  readDeliveryMeta,
  type AIDelivery,
  type AIDeliveryMeta,
} from "./delivery";
export {
  AI_ADAPTER_BOUNDARY,
  createEmbedAIDelivery,
  type EmbedAIDeliveryConfig,
} from "./adapter";
export {
  AI_CONTRACT_BOUNDARY,
  AI_CONTRACT_VERSION,
} from "./contract";