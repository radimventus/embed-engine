/**
 * PT-012 — Diagnostic trace models (metadata only).
 *
 * Never contains: API keys, system prompts, or user message text.
 */

export type ConversationTrace = {
  readonly sessionId: string;
  readonly conversationId: string;
  readonly messageId: string;
};

export type LatencyTrace = {
  readonly analyzerMs: number;
  readonly memoryMs: number;
  readonly resolutionMs: number;
  readonly promptBuilderMs: number;
  readonly providerMs: number;
  readonly totalMs: number;
};

export type PromptTrace = {
  /** Total characters across PromptPackage sections (size, not content). */
  readonly packageChars: number;
  readonly sectionCount: number;
  /** Characters in the decision-memory section only. */
  readonly memoryContextChars: number;
};

export type ProviderTrace = {
  readonly providerId: string;
  readonly model: string | null;
  /** Wall time for provider.chat (request → response). */
  readonly requestDurationMs: number;
  /**
   * Time attributed to receiving the response body.
   * For non-streaming providers equals requestDurationMs.
   */
  readonly responseDurationMs: number;
  /** Provider / transport error code only — never payloads. */
  readonly errorCode: string | null;
};

export type TokenTrace = {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
};

export type MemoryTrace = {
  readonly facts: number;
  readonly preferences: number;
  readonly constraints: number;
  readonly goals: number;
  readonly concerns: number;
  readonly acceptedOptions: number;
  readonly rejectedOptions: number;
  /** Active (resolved) item count across all buckets. */
  readonly activeItems: number;
  readonly resolutionMs: number;
};

/** Complete per-message pipeline observation. */
export type ConversationTurnTrace = {
  readonly conversation: ConversationTrace;
  readonly latency: LatencyTrace;
  readonly prompt: PromptTrace | null;
  readonly provider: ProviderTrace | null;
  readonly tokens: TokenTrace | null;
  readonly memory: MemoryTrace | null;
  readonly ok: boolean;
  readonly errorCode: string | null;
  readonly at: number;
};

export type DiagnosticPhase =
  | "analyzer"
  | "memory"
  | "resolution"
  | "prompt"
  | "provider"
  | "response"
  | "error";

/**
 * Unified diagnostic event.
 * Phase events support step-by-step traces; turn events carry the full snapshot.
 */
export type DiagnosticEvent =
  | {
      readonly kind: "phase";
      readonly conversation: ConversationTrace;
      readonly phase: DiagnosticPhase;
      readonly durationMs: number;
      readonly at: number;
    }
  | {
      readonly kind: "turn";
      readonly trace: ConversationTurnTrace;
    };
