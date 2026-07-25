/**
 * Published Delivery client (AID-01 Gateway-mediated profile).
 *
 * Browser / public Embed talks to a remote AI Delivery edge over HTTPS.
 * No model secrets here — only a public delivery URL.
 * Pre-ACC wire: ChatRequest ↔ ChatResponse (temporary Delivery profile).
 */

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";
import { AdapterFailure } from "../adapter/AdapterFailure";
import type { AIDelivery } from "./AIDelivery";

export type RemoteDeliveryOptions = {
  /** Public HTTPS URL of the AI Delivery edge (never a model API key). */
  readonly deliveryUrl: string;
  readonly id?: string;
  /** Test inject only. */
  readonly fetch?: typeof fetch;
};

export class RemoteDelivery implements AIDelivery {
  readonly id: string;
  readonly model: string | null = null;
  private readonly deliveryUrl: string;
  private readonly fetchImpl: typeof fetch | null;

  constructor(options: RemoteDeliveryOptions) {
    const url = options.deliveryUrl.trim().replace(/\/$/, "");
    if (url.length === 0) {
      throw new AdapterFailure(
        "missing_api_key",
        "RemoteDelivery: deliveryUrl is required for published mode.",
      );
    }
    this.deliveryUrl = url;
    this.id = options.id ?? "published-remote";
    this.fetchImpl = options.fetch ?? null;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    let response: Response;
    try {
      response = await this.request(`${this.deliveryUrl}/v1/chat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(request),
      });
    } catch (error) {
      throw mapRemoteTransportFailure(error);
    }

    const rawBody = await response.text();
    if (!response.ok) {
      throw mapRemoteHttpFailure(response.status, rawBody);
    }

    const payload = parseChatResponse(rawBody);
    if (payload === null) {
      throw new AdapterFailure(
        "invalid_response",
        "AI Delivery edge returned an invalid response.",
        {
          diagnostic:
            "AI Delivery edge returned an invalid response (invalid_response).",
        },
      );
    }
    return payload;
  }

  private request(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    if (this.fetchImpl !== null) {
      return this.fetchImpl(input, init);
    }
    if (typeof globalThis.fetch !== "function") {
      return Promise.reject(
        new AdapterFailure(
          "provider_error",
          "RemoteDelivery: fetch is not available in this environment.",
        ),
      );
    }
    return globalThis.fetch(input, init);
  }
}

export function createRemoteDelivery(
  options: RemoteDeliveryOptions,
): RemoteDelivery {
  return new RemoteDelivery(options);
}

function parseChatResponse(rawBody: string): ChatResponse | null {
  if (rawBody.trim().length === 0) {
    return null;
  }
  try {
    const parsed = JSON.parse(rawBody) as Partial<ChatResponse>;
    if (typeof parsed.content !== "string") {
      return null;
    }
    if (
      parsed.usage === undefined ||
      typeof parsed.usage.promptTokens !== "number" ||
      typeof parsed.usage.completionTokens !== "number" ||
      typeof parsed.usage.totalTokens !== "number"
    ) {
      return null;
    }
    if (typeof parsed.finishReason !== "string") {
      return null;
    }
    return Object.freeze({
      content: parsed.content,
      usage: Object.freeze({
        promptTokens: parsed.usage.promptTokens,
        completionTokens: parsed.usage.completionTokens,
        totalTokens: parsed.usage.totalTokens,
      }),
      finishReason: parsed.finishReason as ChatResponse["finishReason"],
    });
  } catch {
    return null;
  }
}

function mapRemoteTransportFailure(error: unknown): AdapterFailure {
  const text = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : "";
  if (name === "AbortError" || /timeout|timed out|aborted/i.test(text)) {
    return new AdapterFailure(
      "timeout",
      "AI Delivery edge request timed out.",
      {
        diagnostic: "Spojení s AI službou vypršelo (timeout). Zkuste to prosím znovu.",
        cause: error,
      },
    );
  }
  if (/Failed to fetch|NetworkError|fetch failed|network/i.test(text)) {
    return new AdapterFailure(
      "http_error",
      "AI Delivery edge network error.",
      {
        diagnostic:
          "Nepodařilo se spojit s AI službou (network error). Zkuste to prosím znovu.",
        cause: error,
      },
    );
  }
  return new AdapterFailure(
    "provider_error",
    text.length > 0 ? text : "AI Delivery edge request failed.",
    { cause: error },
  );
}

function mapRemoteHttpFailure(status: number, rawBody: string): AdapterFailure {
  if (status === 401 || status === 403) {
    return new AdapterFailure(
      "http_error",
      `AI Delivery edge refused the request (${status}).`,
      {
        diagnostic:
          "AI služba odmítla požadavek. Kontaktujte provozovatele.",
      },
    );
  }
  if (status === 404) {
    return new AdapterFailure(
      "missing_api_key",
      "AI Delivery edge is not configured (404).",
    );
  }
  if (status === 503 || status === 501) {
    return new AdapterFailure(
      "missing_api_key",
      "AI Delivery edge is not configured.",
    );
  }
  const detail = rawBody.trim().slice(0, 200);
  return new AdapterFailure(
    "http_error",
    `AI Delivery edge failed (HTTP ${status}).`,
    {
      diagnostic:
        detail.length > 0
          ? `Nepodařilo se spojit s AI službou (HTTP ${status}).`
          : undefined,
    },
  );
}
