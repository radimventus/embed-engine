/**
 * OpenAI Adapter — vendor error ownership.
 *
 * Maps OpenAI HTTP / transport failures to AdapterFailure.
 * Platform Runtime never parses OpenAI status codes or vendor strings here.
 */

import {
  AdapterFailure,
  type AdapterFailureCode,
} from "../AdapterFailure";

/** Historical fail-fast message — Conversation UX / tests rely on this text. */
export const OPENAI_MISSING_API_KEY_MESSAGE =
  "OpenAIProvider: missing API key. Set OPENAI_API_KEY or pass apiKey.";

export function missingOpenAIApiKeyFailure(): AdapterFailure {
  return new AdapterFailure(
    "missing_api_key",
    OPENAI_MISSING_API_KEY_MESSAGE,
  );
}

export function mapOpenAITransportFailure(error: unknown): AdapterFailure {
  const text = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : "";

  if (name === "AbortError" || /timeout|timed out|aborted/i.test(text)) {
    const diagnostic =
      "Spojení s OpenAI vypršelo (timeout). Zkuste to prosím znovu.";
    return new AdapterFailure("timeout", diagnostic, {
      diagnostic,
      cause: error,
    });
  }

  if (
    /Failed to fetch|NetworkError|fetch failed|ECONNREFUSED|ENOTFOUND|ECONNRESET|network/i.test(
      text,
    )
  ) {
    const diagnostic =
      "Síťové spojení s OpenAI selhalo (network error). Zkontrolujte připojení.";
    return new AdapterFailure("http_error", diagnostic, {
      diagnostic,
      cause: error,
    });
  }

  const message =
    error instanceof Error
      ? error.message
      : `OpenAI požadavek selhal: ${text}`;
  return new AdapterFailure("provider_error", message, {
    diagnostic: message,
    cause: error,
  });
}

type OpenAIErrorPayload = {
  readonly error?: {
    readonly message?: string;
    readonly type?: string;
    readonly code?: string | null;
  };
};

export function mapOpenAIHttpFailure(
  status: number,
  payload: OpenAIErrorPayload | null,
  model: string,
): AdapterFailure {
  const apiCode = readOpenAIErrorCode(payload);
  const apiMessage = payload?.error?.message?.trim() ?? "";
  const diagnostic = formatOpenAIHttpDiagnostic(
    status,
    apiCode,
    apiMessage,
    model,
  );
  const code: AdapterFailureCode =
    status >= 500 || status === 401 || status === 403 || status === 404 || status === 429
      ? "http_error"
      : "http_error";

  return new AdapterFailure(code, diagnostic, { diagnostic });
}

export function invalidOpenAIResponseFailure(): AdapterFailure {
  const diagnostic =
    "OpenAI vrátila neplatnou JSON odpověď (invalid_response).";
  return new AdapterFailure("invalid_response", diagnostic, { diagnostic });
}

export function fetchUnavailableFailure(): AdapterFailure {
  return new AdapterFailure(
    "provider_error",
    "OpenAIProvider: fetch is not available in this environment.",
  );
}

function formatOpenAIHttpDiagnostic(
  status: number,
  apiCode: string,
  apiMessage: string,
  model: string,
): string {
  if (status === 401) {
    return "OpenAI autentizace selhala (401 unauthorized). Zkontrolujte API klíč.";
  }

  if (status === 403) {
    return "OpenAI přístup byl odepřen (403 forbidden).";
  }

  if (status === 404) {
    return `OpenAI model nebyl nalezen (404). Zkontrolujte model „${model}".`;
  }

  if (status === 429) {
    if (isInsufficientQuota(apiCode, apiMessage)) {
      return "OpenAI účet nemá dostupnou kvótu (429 insufficient_quota).";
    }
    return "OpenAI rate limit byl překročen (429 rate_limit). Zkuste to za chvíli znovu.";
  }

  if (status >= 500 && status <= 599) {
    return `OpenAI služba je dočasně nedostupná (${status}). Zkuste to prosím znovu.`;
  }

  const detail = apiMessage || apiCode || "unknown error";
  return `OpenAI požadavek selhal (HTTP ${status}): ${detail}`;
}

function readOpenAIErrorCode(payload: OpenAIErrorPayload | null): string {
  const code = payload?.error?.code;
  if (typeof code === "string" && code.trim().length > 0) {
    return code.trim();
  }
  const type = payload?.error?.type;
  if (typeof type === "string" && type.trim().length > 0) {
    return type.trim();
  }
  return "";
}

function isInsufficientQuota(apiCode: string, apiMessage: string): boolean {
  return (
    /insufficient_quota/i.test(apiCode) ||
    /insufficient_quota|exceeded your current quota/i.test(apiMessage)
  );
}
