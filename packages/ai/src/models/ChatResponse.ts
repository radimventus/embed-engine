/**
 * PT-004 — Chat response contract.
 * Provider-neutral usage + finish reason only.
 */

export type TokenUsage = {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
};

export type FinishReason =
  | "stop"
  | "length"
  | "content_filter"
  | "error"
  | "mock";

export type ChatResponse = {
  readonly content: string;
  readonly usage: TokenUsage;
  readonly finishReason: FinishReason;
};
