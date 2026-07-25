/**
 * PT-006 — OpenAI LLM Provider.
 *
 * Implements LLMProvider only. Transport + vendor mapping stay here.
 * Does not assemble prompts. Does not import Runtime or prompt builders.
 * Receives ChatRequest (from PromptPackage via AIService) and returns ChatResponse.
 */

import type { ChatMessage, ChatRequest } from "../models/ChatRequest";
import type { ChatResponse, FinishReason } from "../models/ChatResponse";
import type { LLMProvider } from "./LLMProvider";

export const OPENAI_PROVIDER_ID = "openai" as const;

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";

export type OpenAIProviderOptions = {
  /** Defaults to process.env.OPENAI_API_KEY */
  readonly apiKey?: string;
  /** Defaults to process.env.OPENAI_MODEL or gpt-4o-mini */
  readonly model?: string;
  /** Defaults to https://api.openai.com/v1 */
  readonly baseUrl?: string;
  /** Injected for tests — production uses global fetch. */
  readonly fetch?: typeof fetch;
};

type OpenAIChatMessage = {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
};

type OpenAIChatCompletionRequest = {
  readonly model: string;
  readonly messages: readonly OpenAIChatMessage[];
};

type OpenAIChatCompletionResponse = {
  readonly choices?: readonly {
    readonly message?: { readonly content?: string | null };
    readonly finish_reason?: string | null;
  }[];
  readonly usage?: {
    readonly prompt_tokens?: number;
    readonly completion_tokens?: number;
    readonly total_tokens?: number;
  };
  readonly error?: { readonly message?: string };
};

/**
 * First real LLMProvider implementation — proof of architecture, not vendor lock-in.
 */
export class OpenAIProvider implements LLMProvider {
  readonly id = OPENAI_PROVIDER_ID;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OpenAIProviderOptions = {}) {
    const apiKey =
      options.apiKey ?? readProcessEnv("OPENAI_API_KEY") ?? "";
    if (apiKey.length === 0) {
      throw new Error(
        "OpenAIProvider: missing API key. Set OPENAI_API_KEY or pass apiKey.",
      );
    }

    this.apiKey = apiKey;
    this.model =
      options.model ?? readProcessEnv("OPENAI_MODEL") ?? DEFAULT_MODEL;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.fetchImpl = options.fetch ?? fetch;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    // PromptPackage / ChatRequest already assembled — transport only.
    const body: OpenAIChatCompletionRequest = {
      model: this.model,
      messages: toOpenAIMessages(request),
    };

    const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as OpenAIChatCompletionResponse;

    if (!response.ok) {
      const message =
        payload.error?.message ??
        `OpenAIProvider: HTTP ${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    return mapOpenAIResponse(payload);
  }
}

function readProcessEnv(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }
  return value.trim();
}

function toOpenAIMessages(request: ChatRequest): OpenAIChatMessage[] {
  const messages: OpenAIChatMessage[] = [
    {
      role: "system",
      content: request.systemPrompt.content,
    },
  ];

  for (const message of request.messages) {
    const role = mapChatRole(message);
    if (role === null) {
      continue;
    }
    messages.push({ role, content: message.content });
  }

  return messages;
}

function mapChatRole(
  message: ChatMessage,
): "system" | "user" | "assistant" | null {
  if (
    message.role === "system" ||
    message.role === "user" ||
    message.role === "assistant"
  ) {
    return message.role;
  }
  return null;
}

function mapOpenAIResponse(
  payload: OpenAIChatCompletionResponse,
): ChatResponse {
  const choice = payload.choices?.[0];
  const content = choice?.message?.content ?? "";
  const finishReason = mapFinishReason(choice?.finish_reason);
  const promptTokens = payload.usage?.prompt_tokens ?? 0;
  const completionTokens = payload.usage?.completion_tokens ?? 0;
  const totalTokens =
    payload.usage?.total_tokens ?? promptTokens + completionTokens;

  return Object.freeze({
    content,
    usage: Object.freeze({
      promptTokens,
      completionTokens,
      totalTokens,
    }),
    finishReason,
  });
}

function mapFinishReason(reason: string | null | undefined): FinishReason {
  switch (reason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content_filter";
    default:
      return reason === undefined || reason === null ? "stop" : "error";
  }
}
