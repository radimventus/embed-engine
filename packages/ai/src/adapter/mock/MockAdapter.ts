/**
 * Mock AI Adapter — development and tests.
 * No network. No API keys. Deterministic response.
 * Same Adapter Contract as OpenAIAdapter ({@link AIAdapter}).
 */

import type { ChatRequest } from "../../models/ChatRequest";
import type { ChatResponse } from "../../models/ChatResponse";
import type { AIAdapter } from "../port";

export const MOCK_PROVIDER_ID = "mock" as const;
export const MOCK_ADAPTER_ID = MOCK_PROVIDER_ID;

export const MOCK_RESPONSE_CONTENT = [
  "[Mock Response]",
  "AI Provider is not connected.",
].join("\n");

export type MockAdapterOptions = {
  /** Optional override of the mock reply body. */
  readonly content?: string;
};

/** @deprecated Prefer {@link MockAdapterOptions}. */
export type MockProviderOptions = MockAdapterOptions;

/**
 * Development / test Adapter. Swap for a real AIAdapter in production hosts.
 */
export class MockAdapter implements AIAdapter {
  readonly id = MOCK_ADAPTER_ID;
  private readonly content: string;

  constructor(options: MockAdapterOptions = {}) {
    this.content = options.content ?? MOCK_RESPONSE_CONTENT;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const lastUser = [...request.messages]
      .reverse()
      .find((message) => message.role === "user");

    const promptTokens = estimateTokens(
      [
        request.systemPrompt.content,
        ...request.messages.map((m) => m.content),
      ].join("\n"),
    );
    const reply =
      lastUser === undefined
        ? this.content
        : `${this.content}\n\n(Received: ${truncate(lastUser.content, 120)})`;
    const completionTokens = estimateTokens(reply);

    return Object.freeze({
      content: reply,
      usage: Object.freeze({
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      }),
      finishReason: "mock",
    });
  }
}

/** @deprecated Prefer {@link MockAdapter}. Public API alias. */
export class MockProvider extends MockAdapter {}

function estimateTokens(text: string): number {
  if (text.length === 0) {
    return 0;
  }
  return Math.max(1, Math.ceil(text.length / 4));
}

function truncate(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 1)}…`;
}
