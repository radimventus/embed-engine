/**
 * PT-004 / PT-005 / PT-011 — AI Service orchestrator.
 *
 * Single entry point for Experience chat.
 * Chat UI talks only to AIService — never to Provider, Analyzer, or Memory directly.
 * Prompt composition happens only via PromptBuilder → PromptPackage.
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
};

export class AIService {
  private provider: LLMProvider;
  private analyzer: ConversationAnalyzer;
  private readonly memoryService: DecisionMemoryService;
  private readonly promptBuilder: PromptBuilder;
  private readonly requestTimeoutMs: number;
  private readonly sessionId: string;
  /** Prior turns only (excludes in-flight user message). */
  private history: ChatMessage[] = [];

  constructor(options: AIServiceOptions) {
    this.provider = options.provider;
    this.sessionId = options.sessionId ?? createSessionId();
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
   */
  async sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
    const text = input.message.trim();
    if (text.length === 0) {
      throw new ConversationError(
        "empty_message",
        conversationUserMessage("empty_message"),
      );
    }

    try {
      const analysis = await this.analyzer.analyze({
        message: text,
        recentMessages: this.history,
      });

      this.memoryService.update({ analysis });

      const promptPackage = this.promptBuilder.build({
        sessionId: this.sessionId,
        decision: input.decision,
        object: input.object,
        memory: this.memoryService.getMemory(),
        conversationMessages: this.history,
        currentUserMessage: text,
      });

      const response = await withTimeout(
        this.chatWithPackage(this.sessionId, promptPackage),
        this.requestTimeoutMs,
      );

      const content = response.content.trim();
      if (content.length === 0) {
        throw new ConversationError(
          "invalid_response",
          conversationUserMessage("invalid_response"),
        );
      }

      this.history = [
        ...this.history,
        Object.freeze({ role: "user" as const, content: text }),
        Object.freeze({ role: "assistant" as const, content }),
      ];

      const memory = this.memoryService.getMemory();
      return Object.freeze({
        content,
        memory,
        resolvedMemory: resolveMemory(memory),
      });
    } catch (error) {
      throw mapConversationError(error);
    }
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
