/**
 * OpenAI AI Adapter (AID-01).
 *
 * Implements AIAdapter only. Transport + vendor mapping stay here.
 * Does not assemble prompts. Does not import Runtime or prompt builders.
 * Receives ChatRequest (from PromptPackage via AIService) and returns ChatResponse.
 */

import type { ChatMessage, ChatRequest } from "../../models/ChatRequest";
import type { ChatResponse, FinishReason } from "../../models/ChatResponse";
import type { AIAdapter } from "../port";
import {
  fetchUnavailableFailure,
  invalidOpenAIResponseFailure,
  mapOpenAIHttpFailure,
  mapOpenAITransportFailure,
  missingOpenAIApiKeyFailure,
} from "./errors";

export const OPENAI_PROVIDER_ID = "openai" as const;
export const OPENAI_ADAPTER_ID = OPENAI_PROVIDER_ID;

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";

export type OpenAIAdapterOptions = {
  /** Defaults to process.env.OPENAI_API_KEY */
  readonly apiKey?: string;
  /** Defaults to process.env.OPENAI_MODEL or gpt-4o-mini */
  readonly model?: string;
  /** Defaults to https://api.openai.com/v1 */
  readonly baseUrl?: string;
  /** Injected for tests — production uses globalThis.fetch at call site. */
  readonly fetch?: typeof fetch;
};

/** @deprecated Prefer {@link OpenAIAdapterOptions}. */
export type OpenAIProviderOptions = OpenAIAdapterOptions;

type OpenAIChatMessage = {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
};

type OpenAIChatCompletionRequest = {
  readonly model: string;
  readonly messages: readonly OpenAIChatMessage[];
  /** Deterministic completions — Local and Embed must share the same request shape. */
  readonly temperature: 0;
  /** Best-effort reproducibility across Local / Embed hosts. */
  readonly seed: 42;
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
  readonly error?: {
    readonly message?: string;
    readonly type?: string;
    readonly code?: string | null;
  };
};

/**
 * OpenAI Adapter — proof of architecture, not vendor lock-in.
 */
export class OpenAIAdapter implements AIAdapter {
  readonly id = OPENAI_ADAPTER_ID;
  private readonly apiKey: string;
  readonly model: string;
  private readonly baseUrl: string;
  /** Test inject only — never store unbound window.fetch. */
  private readonly fetchOverride: typeof fetch | null;

  constructor(options: OpenAIAdapterOptions = {}) {
    const apiKey =
      options.apiKey ?? readProcessEnv("OPENAI_API_KEY") ?? "";
    if (apiKey.length === 0) {
      throw missingOpenAIApiKeyFailure();
    }

    this.apiKey = apiKey;
    this.model =
      options.model ?? readProcessEnv("OPENAI_MODEL") ?? DEFAULT_MODEL;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.fetchOverride = options.fetch ?? null;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const body: OpenAIChatCompletionRequest = {
      model: this.model,
      messages: toOpenAIMessages(request),
      temperature: 0,
      seed: 42,
    };

    let response: Response;
    try {
      response = await this.request(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw mapOpenAITransportFailure(error);
    }

    const rawBody = await response.text();
    const payload = parseOpenAIPayload(rawBody);

    if (!response.ok) {
      logOpenAIErrorBody(rawBody, payload);
      throw mapOpenAIHttpFailure(response.status, payload, this.model);
    }

    if (payload === null) {
      throw invalidOpenAIResponseFailure();
    }

    return mapOpenAIResponse(payload);
  }

  /**
   * Call platform fetch without detaching it from its receiver.
   *
   * Browser `window.fetch` is a method: extracting `const f = fetch` and calling
   * `f(...)` throws TypeError: Illegal invocation because `this` is undefined.
   * Production path therefore always calls `globalThis.fetch(...)` as a method.
   */
  private request(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    if (this.fetchOverride !== null) {
      return this.fetchOverride(input, init);
    }
    if (typeof globalThis.fetch !== "function") {
      return Promise.reject(fetchUnavailableFailure());
    }
    return globalThis.fetch(input, init);
  }
}

/** @deprecated Prefer {@link OpenAIAdapter}. Public API alias. */
export class OpenAIProvider extends OpenAIAdapter {}

function readProcessEnv(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }
  return value.trim();
}

function parseOpenAIPayload(
  rawBody: string,
): OpenAIChatCompletionResponse | null {
  if (rawBody.trim().length === 0) {
    return null;
  }
  try {
    return JSON.parse(rawBody) as OpenAIChatCompletionResponse;
  } catch {
    return null;
  }
}

function logOpenAIErrorBody(
  rawBody: string,
  payload: OpenAIChatCompletionResponse | null,
): void {
  if (payload !== null) {
    console.error("OpenAIProvider: error response JSON", payload);
    return;
  }
  console.error("OpenAIProvider: error response body", rawBody);
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
