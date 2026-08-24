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
  type AIDiagnostics,
  type ConversationTrace,
  type ConversationTurnTrace,
} from "../diagnostics";
import {
  createConversationRecorder,
  createDisabledConversationRecorder,
  type ConversationRecorder,
} from "../recorder";
import {
  createDecisionRecommendationEngine,
  type DecisionRecommendationEngine,
} from "../recommendation";
import type { AnalysisResult } from "../analyzer/models/AnalysisResult";
import { buildObjectContext } from "../prompt/builders/ObjectContextBuilder";
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
import type {
  AIDelivery,
} from "../delivery/AIDelivery";
import { readDeliveryMeta } from "../delivery/AIDelivery";
import {
  createDirectAdapterDelivery,
  isDirectAdapterDelivery,
} from "../delivery/DirectAdapterDelivery";
import type { LLMProvider } from "../providers/LLMProvider";
import {
  ConversationError,
  conversationUserMessage,
  mapConversationError,
} from "./ConversationError";

export const DEFAULT_CONVERSATION_TIMEOUT_MS = 30_000;

export type AIServiceOptions = {
  /** Vendor-neutral Delivery Port (AID-01 / WP-B). */
  readonly delivery: AIDelivery;
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
  /**
   * PT-012 — optional conversation audit recorder (full snapshots for debug/replay).
   * Pass `false` or disabled recorder to turn off.
   */
  readonly recorder?: ConversationRecorder | false;
  /** PT-013 — deterministic recommendation engine (default: built-in rules). */
  readonly recommendationEngine?: DecisionRecommendationEngine;
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
  private delivery: AIDelivery;
  private analyzer: ConversationAnalyzer;
  private readonly memoryService: DecisionMemoryService;
  private readonly promptBuilder: PromptBuilder;
  private readonly requestTimeoutMs: number;
  private readonly sessionId: string;
  private readonly conversationId: string;
  private readonly diagnostics: AIDiagnostics;
  private readonly recorder: ConversationRecorder;
  private readonly recommendationEngine: DecisionRecommendationEngine;
  /** Prior turns only (excludes in-flight user message). */
  private history: ChatMessage[] = [];

  constructor(options: AIServiceOptions) {
    this.delivery = options.delivery;
    this.sessionId = options.sessionId ?? createSessionId();
    this.conversationId = this.sessionId;
    this.requestTimeoutMs =
      options.requestTimeoutMs ?? DEFAULT_CONVERSATION_TIMEOUT_MS;
    this.memoryService =
      options.memoryService ?? createDecisionMemoryService();
    this.promptBuilder = options.promptBuilder ?? createPromptBuilder();
    this.recommendationEngine =
      options.recommendationEngine ?? createDecisionRecommendationEngine();
    this.analyzer =
      options.analyzer ??
      createConversationAnalyzer(
        createAnalyzerProvider({
          llm: { chat: (request) => this.delivery.chat(request) },
        }),
      );
    this.diagnostics =
      options.diagnostics === false
        ? createDisabledDiagnostics()
        : (options.diagnostics ?? createAIDiagnostics({ enabled: true }));
    this.recorder =
      options.recorder === false
        ? createDisabledConversationRecorder({
            sessionId: this.sessionId,
            conversationId: this.conversationId,
          })
        : (options.recorder ??
          createConversationRecorder({
            sessionId: this.sessionId,
            conversationId: this.conversationId,
            enabled: true,
          }));
  }

  /** Current Delivery Port. */
  getDelivery(): AIDelivery {
    return this.delivery;
  }

  /** Swap Delivery without changing callers. */
  setDelivery(delivery: AIDelivery): void {
    this.delivery = delivery;
    this.analyzer = createConversationAnalyzer(
      createAnalyzerProvider({
        llm: { chat: (request) => this.delivery.chat(request) },
      }),
    );
  }

  /**
   * Compat: unwrap Direct Adapter Delivery to Adapter port (tests / PT-004).
   * Prefer getDelivery().
   */
  getProvider(): LLMProvider {
    if (isDirectAdapterDelivery(this.delivery)) {
      return this.delivery.adapter;
    }
    return {
      chat: (request) => this.delivery.chat(request),
    };
  }

  /**
   * Compat: wrap Adapter as Direct Adapter Delivery.
   * Prefer setDelivery().
   */
  setProvider(provider: LLMProvider): void {
    this.setDelivery(createDirectAdapterDelivery(provider));
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getDiagnostics(): AIDiagnostics {
    return this.diagnostics;
  }

  getRecorder(): ConversationRecorder {
    return this.recorder;
  }

  /** Export full conversation audit JSON (empty when recorder disabled). */
  exportConversationJSON(pretty = true): string {
    return this.recorder.exportJSON(pretty);
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
    return this.delivery.chat(request);
  }

  /**
   * Transport a PromptPackage assembled by PromptBuilder.
   * Delivery/Adapter never compose prompts — only receive ChatRequest.
   */
  chatWithPackage(
    sessionId: string,
    promptPackage: PromptPackage,
  ): Promise<ChatResponse> {
    return this.chat(promptPackageToChatRequest(sessionId, promptPackage));
  }

  /**
   * PT-011 — Full conversation turn:
   * Analyzer → DecisionMemoryService → PromptBuilder (ResolvedMemory) → Delivery.
   * PT-012 — Observes latencies / tokens / memory counts without changing results.
   * PT-012 Recorder — optional full audit snapshots for debug / replay.
   */
  async sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
    console.info("[T72-CHAT-TRACE] AIService sendMessage entry", {
      delivery: readDeliveryMeta(this.delivery),
      messageLength: input.message.length,
    });

    const text = input.message.trim();
    if (text.length === 0) {
      throw new ConversationError(
        "empty_message",
        conversationUserMessage("empty_message"),
      );
    }

    const conversation = this.createConversationTrace();
    const totalStart = nowMs();
    const deliveryMeta = readDeliveryMeta(this.delivery);
    let analyzerMs = 0;
    let memoryMs = 0;
    let resolutionMs = 0;
    let promptBuilderMs = 0;
    let providerMs = 0;
    let promptTrace = null as ReturnType<typeof measurePromptPackage> | null;
    let memoryTrace = null as ReturnType<typeof createMemoryTrace> | null;
    let providerTrace = null as ReturnType<typeof createProviderTrace> | null;
    let tokenTrace = null as ReturnType<typeof createTokenTrace> | null;
    let analysisSnapshot: AnalysisResult | null = null;
    let resolvedSnapshot: ResolvedMemory | null = null;
    let promptPackageSnapshot: PromptPackage | null = null;
    let recorded = false;

    const recordAudit = (parts: {
      readonly response: string | null;
      readonly error: string | null;
      readonly promptTokens: number | null;
      readonly completionTokens: number | null;
      readonly providerId: string | null;
      readonly model: string | null;
    }): void => {
      if (recorded || !this.recorder.isEnabled()) {
        return;
      }
      recorded = true;
      this.recorder.record({
        sessionId: conversation.sessionId,
        messageId: conversation.messageId,
        timestamp: Date.now(),
        userMessage: text,
        analysis: analysisSnapshot,
        resolvedMemory: resolvedSnapshot,
        promptPackage: promptPackageSnapshot,
        provider: parts.providerId,
        model: parts.model,
        promptTokens: parts.promptTokens,
        completionTokens: parts.completionTokens,
        latency: elapsedMs(totalStart),
        response: parts.response,
        error: parts.error,
      });
    };

    try {
      const analyzerStart = nowMs();
      console.info("[T72-CHAT-TRACE] analyzer begin");
      const analysis = await this.analyzer.analyze({
        message: text,
        recentMessages: this.history,
      });
      analysisSnapshot = analysis;
      console.info("[T72-CHAT-TRACE] analyzer complete");
      analyzerMs = elapsedMs(analyzerStart);
      this.diagnostics.emitPhase(conversation, "analyzer", analyzerMs);

      const memoryStart = nowMs();
      this.memoryService.update({ analysis });
      memoryMs = elapsedMs(memoryStart);
      this.diagnostics.emitPhase(conversation, "memory", memoryMs);

      const historySnapshot = this.memoryService.getMemory();
      const resolutionStart = nowMs();
      const resolvedForTrace = resolveMemory(historySnapshot);
      resolvedSnapshot = resolvedForTrace;
      resolutionMs = elapsedMs(resolutionStart);
      this.diagnostics.emitPhase(conversation, "resolution", resolutionMs);

      const buckets = countMemoryBuckets(historySnapshot);
      memoryTrace = createMemoryTrace({
        ...buckets,
        activeItems: countActiveResolved(resolvedForTrace),
        resolutionMs,
      });

      const promptStart = nowMs();
      const objectContext = buildObjectContext(input.object);
      const recommendation = this.recommendationEngine.recommend({
        memory: resolvedForTrace,
        object: objectContext,
        decision: input.decision,
      });
      const promptPackage = this.promptBuilder.build({
        sessionId: this.sessionId,
        decision: input.decision,
        object: input.object,
        memory: historySnapshot,
        recommendation,
        conversationMessages: this.history,
        currentUserMessage: text,
      });
      promptPackageSnapshot = promptPackage;
      promptBuilderMs = elapsedMs(promptStart);
      this.diagnostics.emitPhase(conversation, "prompt", promptBuilderMs);
      promptTrace = measurePromptPackage(promptPackage);

      const providerStart = nowMs();
      let response: ChatResponse;
      try {
        console.info("[T72-CHAT-TRACE] before delivery chat", {
          delivery: readDeliveryMeta(this.delivery),
        });
        response = await withTimeout(
          this.chatWithPackage(this.sessionId, promptPackage),
          this.requestTimeoutMs,
        );
      } catch (providerError) {
        console.error("[T72-CHAT-TRACE] provider caught", {
          delivery: readDeliveryMeta(this.delivery),
          error: providerError,
        });
        console.error("AIService: provider error", providerError);
        providerMs = elapsedMs(providerStart);
        const mapped = mapConversationError(providerError);
        providerTrace = createProviderTrace({
          providerId: deliveryMeta.deliveryId,
          model: deliveryMeta.model,
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
        recordAudit({
          response: null,
          error: mapped.code,
          promptTokens: null,
          completionTokens: null,
          providerId: deliveryMeta.deliveryId,
          model: deliveryMeta.model,
        });
        throw mapped;
      }

      providerMs = elapsedMs(providerStart);
      this.diagnostics.emitPhase(conversation, "provider", providerMs);

      providerTrace = createProviderTrace({
        providerId: deliveryMeta.deliveryId,
        model: deliveryMeta.model,
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
        recordAudit({
          response: null,
          error: invalid.code,
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          providerId: deliveryMeta.deliveryId,
          model: deliveryMeta.model,
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
      recordAudit({
        response: content,
        error: null,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        providerId: deliveryMeta.deliveryId,
        model: deliveryMeta.model,
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
      recordAudit({
        response: null,
        error: mapped.code,
        promptTokens: tokenTrace?.promptTokens ?? null,
        completionTokens: tokenTrace?.completionTokens ?? null,
        providerId: deliveryMeta.deliveryId,
        model: deliveryMeta.model,
      });
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

export function createAIServiceFromDelivery(
  delivery: AIDelivery,
  options: Omit<AIServiceOptions, "delivery"> = {},
): AIService {
  return new AIService({ delivery, ...options });
}

/**
 * Compat factory — wraps Adapter (LLMProvider) as Direct Adapter Delivery.
 * Prefer createAIServiceFromDelivery for new call sites.
 */
export function createAIService(
  provider: LLMProvider,
  options: Omit<AIServiceOptions, "delivery"> = {},
): AIService {
  return createAIServiceFromDelivery(
    createDirectAdapterDelivery(provider),
    options,
  );
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
