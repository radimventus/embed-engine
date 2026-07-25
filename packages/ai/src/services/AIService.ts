/**
 * PT-004 / PT-005 / PT-011 / PT-012 — AI Service orchestrator.
 *
 * Single entry point for Experience chat.
 * Chat UI talks only to AIService — never to Provider, Analyzer, or Memory directly.
 * Prompt composition happens only via PromptBuilder → PromptPackage.
 * Diagnostics (PT-012) are passive and optional — never alter pipeline results.
 */

import type { DecisionContext } from "@embed-engine/runtime";

import type { ChatMessage, ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";
import {
  createConversationAnalyzer,
  type ConversationAnalyzer,
} from "../analyzer/ConversationAnalyzer";
import { createAnalyzerProvider } from "../analyzer/providers/AnalyzerProvider";
import {
  createAIDiagnostics,
  createDisabledDiagnostics,
  createLatencyTrace,
  createMemoryTrace,
  createProviderTrace,
  createTokenTrace,
  measurePromptPackage,
  countActiveResolved,
  countMemoryBuckets,
  readProviderMeta,
  type AIDiagnostics,
  type ConversationTrace,
  type ConversationTurnTrace,
} from "../diagnostics";
import {
  createDecisionMemoryService,
  type DecisionMemoryService,
} from "../memory/DecisionMemoryService";
import { resolveMemory } from "../memory/MemoryResolutionEngine";
import type { ResolvedMemory } from "../memory/models/ResolvedMemory";
import type { DecisionMemory } from "../prompt/models/DecisionMemory";
import type { ObjectContextInput } from "../prompt/builders/ObjectContextBuilder";
import type { PromptPackage } from "../prompt/models/PromptPackage";
import {
  createPromptBuilder,
  promptPackageToChatRequest,
  type PromptBuilder,
} from "../prompt/PromptBuilder";
import type { LLMProvider } from "../providers/LLMProvider";
import {
  ConversationError,
  conversationUserMessage,
  mapConversationError,
} from "./ConversationError";

export const DEFAULT_CONVERSATION_TIMEOUT_MS = 30_000;

export type AIServiceOptions = {
  readonly provider: LLMProvider;
  /** In-memory pilot session id (new on each page load by default). */
  readonly sessionId?: string;
  readonly requestTimeoutMs?: number;
  readonly analyzer?: ConversationAnalyzer;
  readonly memoryService?: DecisionMemoryService;
  readonly promptBuilder?: PromptBuilder;
  /**
   * PT-012 — optional passive diagnostics.
   * Pass `createDisabledDiagnostics()` or omit/`diagnostics: false` to disable.
   */
  readonly diagnostics?: AIDiagnostics | false;
};

export type SendMessageInput = {
  readonly message: string;
  readonly decision: DecisionContext;
  readonly object?: ObjectContextInput;
};

export type SendMessageResult = {
  readonly content: string;
  readonly memory: DecisionMemory;
  readonly resolvedMemory: ResolvedMemory;
  /** Present when diagnostics observed this turn. */
  readonly messageId?: string;
};

export class AIService {
  private provider: LLMProvider;
  private analyzer: ConversationAnalyzer;
  private readonly memoryService: DecisionMemoryService;
  private readonly promptBuilder: PromptBuilder;
  private readonly requestTimeoutMs: number;
  private readonly sessionId: string;
  private readonly conversationId: string;
  private readonly diagnostics: AIDiagnostics;
  /** Prior turns only (excludes in-flight user message). */
  private history: ChatMessage[] = [];

  constructor(options: AIServiceOptions) {
    this.provider = options.provider;
    this.sessionId = options.sessionId ?? createSessionId();
    this.conversationId = this.sessionId;
    this.requestTimeoutMs =
      options.requestTimeoutMs ?? DEFAULT_CONVERSATION_TIMEOUT_MS;
    this.memoryService =
      options.memoryService ?? createDecisionMemoryService();
    this.promptBuilder = options.promptBuilder ?? createPromptBuilder();
    this.analyzer =
      options.analyzer ??
      createConversationAnalyzer(
        createAnalyzerProvider({ llm: options.provider }),
      );
    this.diagnostics =
      options.diagnostics === false
        ? createDisabledDiagnostics()
        : (options.diagnostics ?? createAIDiagnostics({ enabled: true }));
  }

  /** Current provider (for tests / diagnostics — not vendor-specific). */
  getProvider(): LLMProvider {
    return this.provider;
  }

  /** Swap provider without changing callers (PT-004 validation). */
  setProvider(provider: LLMProvider): void {
    this.provider = provider;
    this.analyzer = createConversationAnalyzer(
      createAnalyzerProvider({ llm: provider }),
    );
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getDiagnostics(): AIDiagnostics {
    return this.diagnostics;
  }

  getHistory(): readonly ChatMessage[] {
    return this.history;
  }

  getMemory(): DecisionMemory {
    return this.memoryService.getMemory();
  }

  getResolvedMemory(): ResolvedMemory {
    return resolveMemory(this.memoryService.getMemory());
  }

  chat(request: ChatRequest): Promise<ChatResponse> {
    return this.provider.chat(request);
  }

  /**
   * Transport a PromptPackage assembled by PromptBuilder.
   * Provider never composes prompts — only receives the package as ChatRequest.
   */
  chatWithPackage(
    sessionId: string,
    promptPackage: PromptPackage,
  ): Promise<ChatResponse> {
    return this.chat(promptPackageToChatRequest(sessionId, promptPackage));
  }

  /**
   * PT-011 — Full conversation turn:
   * Analyzer → DecisionMemoryService → PromptBuilder (ResolvedMemory) → Provider.
   * PT-012 — Observes latencies / tokens / memory counts without changing results.
   */
  async sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
    const text = input.message.trim();
    if (text.length === 0) {
      throw new ConversationError(
        "empty_message",
        conversationUserMessage("empty_message"),
      );
    }

    const conversation = this.createConversationTrace();
    const totalStart = nowMs();
    let analyzerMs = 0;
    let memoryMs = 0;
    let resolutionMs = 0;
    let promptBuilderMs = 0;
    let providerMs = 0;
    let promptTrace = null as ReturnType<typeof measurePromptPackage> | null;
    let memoryTrace = null as ReturnType<typeof createMemoryTrace> | null;
    let providerTrace = null as ReturnType<typeof createProviderTrace> | null;
    let tokenTrace = null as ReturnType<typeof createTokenTrace> | null;

    try {
      const analyzerStart = nowMs();
      const analysis = await this.analyzer.analyze({
        message: text,
        recentMessages: this.history,
      });
      analyzerMs = elapsedMs(analyzerStart);
      this.diagnostics.emitPhase(conversation, "analyzer", analyzerMs);

      const memoryStart = nowMs();
      this.memoryService.update({ analysis });
      memoryMs = elapsedMs(memoryStart);
      this.diagnostics.emitPhase(conversation, "memory", memoryMs);

      const historySnapshot = this.memoryService.getMemory();
      const resolutionStart = nowMs();
      const resolvedForTrace = resolveMemory(historySnapshot);
      resolutionMs = elapsedMs(resolutionStart);
      this.diagnostics.emitPhase(conversation, "resolution", resolutionMs);

      const buckets = countMemoryBuckets(historySnapshot);
      memoryTrace = createMemoryTrace({
        ...buckets,
        activeItems: countActiveResolved(resolvedForTrace),
        resolutionMs,
      });

      const promptStart = nowMs();
      const promptPackage = this.promptBuilder.build({
        sessionId: this.sessionId,
        decision: input.decision,
        object: input.object,
        memory: historySnapshot,
        conversationMessages: this.history,
        currentUserMessage: text,
      });
      promptBuilderMs = elapsedMs(promptStart);
      this.diagnostics.emitPhase(conversation, "prompt", promptBuilderMs);
      promptTrace = measurePromptPackage(promptPackage);

      const providerMeta = readProviderMeta(this.provider);
      const providerStart = nowMs();
      let response: ChatResponse;
      try {
        response = await withTimeout(
          this.chatWithPackage(this.sessionId, promptPackage),
          this.requestTimeoutMs,
        );
      } catch (providerError) {
        providerMs = elapsedMs(providerStart);
        const mapped = mapConversationError(providerError);
        providerTrace = createProviderTrace({
          providerId: providerMeta.providerId,
          model: providerMeta.model,
          requestDurationMs: providerMs,
          responseDurationMs: providerMs,
          errorCode: mapped.code,
        });
        this.diagnostics.emitPhase(conversation, "provider", providerMs);
        this.diagnostics.emitPhase(conversation, "error", 0);
        this.finishTurnTrace({
          conversation,
          totalStart,
          analyzerMs,
          memoryMs,
          resolutionMs,
          promptBuilderMs,
          providerMs,
          promptTrace,
          memoryTrace,
          providerTrace,
          tokenTrace: null,
          ok: false,
          errorCode: mapped.code,
        });
        throw mapped;
      }

      providerMs = elapsedMs(providerStart);
      this.diagnostics.emitPhase(conversation, "provider", providerMs);

      providerTrace = createProviderTrace({
        providerId: providerMeta.providerId,
        model: providerMeta.model,
        requestDurationMs: providerMs,
        responseDurationMs: providerMs,
        errorCode: null,
      });

      tokenTrace = createTokenTrace({
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
      });

      const content = response.content.trim();
      if (content.length === 0) {
        const invalid = new ConversationError(
          "invalid_response",
          conversationUserMessage("invalid_response"),
        );
        this.diagnostics.emitPhase(conversation, "error", 0);
        this.finishTurnTrace({
          conversation,
          totalStart,
          analyzerMs,
          memoryMs,
          resolutionMs,
          promptBuilderMs,
          providerMs,
          promptTrace,
          memoryTrace,
          providerTrace: createProviderTrace({
            ...providerTrace,
            errorCode: invalid.code,
          }),
          tokenTrace,
          ok: false,
          errorCode: invalid.code,
        });
        throw invalid;
      }

      this.history = [
        ...this.history,
        Object.freeze({ role: "user" as const, content: text }),
        Object.freeze({ role: "assistant" as const, content }),
      ];

      const memory = this.memoryService.getMemory();
      const resolvedMemory = resolveMemory(memory);

      this.diagnostics.emitPhase(conversation, "response", 0);
      this.finishTurnTrace({
        conversation,
        totalStart,
        analyzerMs,
        memoryMs,
        resolutionMs,
        promptBuilderMs,
        providerMs,
        promptTrace,
        memoryTrace,
        providerTrace,
        tokenTrace,
        ok: true,
        errorCode: null,
      });

      return Object.freeze({
        content,
        memory,
        resolvedMemory,
        messageId: conversation.messageId,
      });
    } catch (error) {
      const mapped = mapConversationError(error);
      if (
        this.diagnostics.isEnabled() &&
        this.diagnostics.getLastTrace()?.conversation.messageId !==
          conversation.messageId
      ) {
        this.finishTurnTrace({
          conversation,
          totalStart,
          analyzerMs,
          memoryMs,
          resolutionMs,
          promptBuilderMs,
          providerMs,
          promptTrace,
          memoryTrace,
          providerTrace,
          tokenTrace,
          ok: false,
          errorCode: mapped.code,
        });
      }
      throw mapped;
    }
  }

  private createConversationTrace(): ConversationTrace {
    return Object.freeze({
      sessionId: this.sessionId,
      conversationId: this.conversationId,
      messageId: createMessageId(),
    });
  }

  private finishTurnTrace(input: {
    readonly conversation: ConversationTrace;
    readonly totalStart: number;
    readonly analyzerMs: number;
    readonly memoryMs: number;
    readonly resolutionMs: number;
    readonly promptBuilderMs: number;
    readonly providerMs: number;
    readonly promptTrace: ReturnType<typeof measurePromptPackage> | null;
    readonly memoryTrace: ReturnType<typeof createMemoryTrace> | null;
    readonly providerTrace: ReturnType<typeof createProviderTrace> | null;
    readonly tokenTrace: ReturnType<typeof createTokenTrace> | null;
    readonly ok: boolean;
    readonly errorCode: string | null;
  }): void {
    const trace: ConversationTurnTrace = Object.freeze({
      conversation: input.conversation,
      latency: createLatencyTrace({
        analyzerMs: input.analyzerMs,
        memoryMs: input.memoryMs,
        resolutionMs: input.resolutionMs,
        promptBuilderMs: input.promptBuilderMs,
        providerMs: input.providerMs,
        totalMs: elapsedMs(input.totalStart),
      }),
      prompt: input.promptTrace,
      provider: input.providerTrace,
      tokens: input.tokenTrace,
      memory: input.memoryTrace,
      ok: input.ok,
      errorCode: input.errorCode,
      at: Date.now(),
    });
    this.diagnostics.emitTurn(trace);
  }
}

export function createAIService(
  provider: LLMProvider,
  options: Omit<AIServiceOptions, "provider"> = {},
): AIService {
  return new AIService({ provider, ...options });
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `embed-${crypto.randomUUID()}`;
  }
  return `embed-${Date.now().toString(36)}`;
}

function createMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `msg-${crypto.randomUUID()}`;
  }
  return `msg-${Date.now().toString(36)}`;
}

function nowMs(): number {
  return typeof performance !== "undefined" &&
    typeof performance.now === "function"
    ? performance.now()
    : Date.now();
}

function elapsedMs(start: number): number {
  return Math.max(0, Math.round(nowMs() - start));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new ConversationError(
          "timeout",
          conversationUserMessage("timeout"),
        ),
      );
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
