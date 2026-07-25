/**
 * PT-012 — Passive AI diagnostics collector.
 *
 * Observes pipeline metadata only. Never mutates Runtime, Memory, or prompts.
 * Completely no-ops when disabled.
 */

import type {
  ConversationTrace,
  ConversationTurnTrace,
  DiagnosticEvent,
  DiagnosticPhase,
  LatencyTrace,
  MemoryTrace,
  PromptTrace,
  ProviderTrace,
  TokenTrace,
} from "./models/DiagnosticEvent";

export type DiagnosticListener = (event: DiagnosticEvent) => void;

export type AIDiagnosticsOptions = {
  /** When false, emit is a no-op (default true when constructed via createAIDiagnostics). */
  readonly enabled?: boolean;
  readonly listener?: DiagnosticListener;
  /** Pilot console metadata logger (never logs secrets or user text). */
  readonly console?: boolean;
};

export class AIDiagnostics {
  private readonly enabled: boolean;
  private readonly listener: DiagnosticListener | undefined;
  private readonly useConsole: boolean;
  private readonly turns: ConversationTurnTrace[] = [];

  constructor(options: AIDiagnosticsOptions = {}) {
    this.enabled = options.enabled ?? true;
    this.listener = options.listener;
    this.useConsole = options.console ?? false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  emit(event: DiagnosticEvent): void {
    if (!this.enabled) {
      return;
    }

    if (event.kind === "turn") {
      this.turns.push(event.trace);
      if (this.useConsole) {
        logTurnTrace(event.trace);
      }
    } else if (this.useConsole && event.kind === "phase") {
      // Phase lines are included in turn summary; skip duplicate console noise.
    }

    this.listener?.(event);
  }

  emitPhase(
    conversation: ConversationTrace,
    phase: DiagnosticPhase,
    durationMs: number,
  ): void {
    this.emit({
      kind: "phase",
      conversation,
      phase,
      durationMs,
      at: Date.now(),
    });
  }

  emitTurn(trace: ConversationTurnTrace): void {
    this.emit({ kind: "turn", trace });
  }

  /** In-memory traces for the current process / page (pilot). */
  getTraces(): readonly ConversationTurnTrace[] {
    return this.turns;
  }

  getLastTrace(): ConversationTurnTrace | null {
    return this.turns[this.turns.length - 1] ?? null;
  }

  clear(): void {
    this.turns.length = 0;
  }
}

export function createAIDiagnostics(
  options?: AIDiagnosticsOptions,
): AIDiagnostics {
  return new AIDiagnostics(options);
}

/** Fully disabled diagnostics — zero overhead beyond the disabled check. */
export function createDisabledDiagnostics(): AIDiagnostics {
  return new AIDiagnostics({ enabled: false });
}

export function createLatencyTrace(parts: {
  readonly analyzerMs: number;
  readonly memoryMs: number;
  readonly resolutionMs: number;
  readonly promptBuilderMs: number;
  readonly providerMs: number;
  readonly totalMs: number;
}): LatencyTrace {
  return Object.freeze({ ...parts });
}

export function createPromptTrace(parts: {
  readonly packageChars: number;
  readonly sectionCount: number;
  readonly memoryContextChars: number;
}): PromptTrace {
  return Object.freeze({ ...parts });
}

export function createProviderTrace(parts: {
  readonly providerId: string;
  readonly model: string | null;
  readonly requestDurationMs: number;
  readonly responseDurationMs: number;
  readonly errorCode: string | null;
}): ProviderTrace {
  return Object.freeze({ ...parts });
}

export function createTokenTrace(parts: {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}): TokenTrace {
  return Object.freeze({ ...parts });
}

export function createMemoryTrace(parts: {
  readonly facts: number;
  readonly preferences: number;
  readonly constraints: number;
  readonly goals: number;
  readonly concerns: number;
  readonly acceptedOptions: number;
  readonly rejectedOptions: number;
  readonly activeItems: number;
  readonly resolutionMs: number;
}): MemoryTrace {
  return Object.freeze({ ...parts });
}

function logTurnTrace(trace: ConversationTurnTrace): void {
  const { conversation: c, latency: l } = trace;
  const lines = [
    `[ai.trace] session=${c.sessionId} conversation=${c.conversationId} message=${c.messageId} ok=${trace.ok}`,
    `  Analyzer ${l.analyzerMs} ms`,
    `  Memory ${l.memoryMs} ms`,
    `  Resolution ${l.resolutionMs} ms`,
    `  PromptBuilder ${l.promptBuilderMs} ms`,
    `  Provider ${l.providerMs} ms`,
    `  Total ${l.totalMs} ms`,
  ];

  if (trace.prompt !== null) {
    lines.push(
      `  Prompt sections=${trace.prompt.sectionCount} chars=${trace.prompt.packageChars} memoryChars=${trace.prompt.memoryContextChars}`,
    );
  }
  if (trace.tokens !== null) {
    lines.push(
      `  Tokens prompt=${trace.tokens.promptTokens} completion=${trace.tokens.completionTokens} total=${trace.tokens.totalTokens}`,
    );
  }
  if (trace.memory !== null) {
    lines.push(
      `  Memory facts=${trace.memory.facts} preferences=${trace.memory.preferences} constraints=${trace.memory.constraints} active=${trace.memory.activeItems}`,
    );
  }
  if (trace.provider?.errorCode !== null && trace.provider !== null) {
    lines.push(`  ProviderError ${trace.provider.errorCode}`);
  } else if (trace.errorCode !== null) {
    lines.push(`  Error ${trace.errorCode}`);
  }

  // Intentional pilot diagnostics sink (metadata only).
  console.info(lines.join("\n"));
}
