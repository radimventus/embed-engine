/**
 * PT-011 — User-facing conversation errors (Embed must not crash).
 *
 * Platform Error Contract only. Vendor-specific mapping lives in Adapters
 * ({@link AdapterFailure}); this module maps AdapterFailure → ConversationError.
 */

import {
  isAdapterFailure,
  type AdapterFailureCode,
} from "../adapter/AdapterFailure";

export type ConversationErrorCode =
  | "missing_api_key"
  | "timeout"
  | "http_error"
  | "invalid_response"
  | "provider_error"
  | "empty_message";

export class ConversationError extends Error {
  readonly code: ConversationErrorCode;
  readonly userMessage: string;

  constructor(
    code: ConversationErrorCode,
    userMessage: string,
    options?: { readonly cause?: unknown },
  ) {
    super(userMessage, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "ConversationError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

const USER_MESSAGES: Readonly<Record<ConversationErrorCode, string>> = {
  missing_api_key:
    "AI není připravená — chybí API klíč. Kontaktujte provozovatele.",
  timeout: "Odpověď trvala příliš dlouho. Zkuste to prosím znovu.",
  http_error: "Nepodařilo se spojit s AI službou. Zkuste to prosím znovu.",
  invalid_response:
    "AI vrátila neplatnou odpověď. Zkuste otázku položit znovu.",
  provider_error: "Došlo k chybě při generování odpovědi. Zkuste to prosím znovu.",
  empty_message: "Zpráva je prázdná.",
};

export function conversationUserMessage(code: ConversationErrorCode): string {
  return USER_MESSAGES[code];
}

/**
 * Map Adapter / transport failures to ConversationError.
 * Never rethrows raw errors to UI.
 * Adapter diagnostics (when present on AdapterFailure) surface as-is.
 */
export function mapConversationError(error: unknown): ConversationError {
  if (error instanceof ConversationError) {
    return error;
  }

  if (isAdapterFailure(error)) {
    const code = toConversationCode(error.code);
    const userMessage =
      error.diagnostic ??
      (code === "missing_api_key"
        ? conversationUserMessage(code)
        : error.message.trim().length > 0
          ? error.message
          : conversationUserMessage(code));
    return new ConversationError(code, userMessage, { cause: error });
  }

  const text = errorMessage(error).trim();

  if (/missing api key|pass apiKey/i.test(text)) {
    return new ConversationError(
      "missing_api_key",
      conversationUserMessage("missing_api_key"),
      { cause: error },
    );
  }

  if (/timeout|timed out|aborted|vypršelo \(timeout\)/i.test(text)) {
    return new ConversationError(
      "timeout",
      text.length > 0 ? text : conversationUserMessage("timeout"),
      { cause: error },
    );
  }

  if (/invalid_response|empty content|neplatn/i.test(text)) {
    return new ConversationError(
      "invalid_response",
      text.length > 0 ? text : conversationUserMessage("invalid_response"),
      { cause: error },
    );
  }

  if (
    /network error|Failed to fetch|fetch failed|Síťové spojení|HTTP\s*\d{3}|401 unauthorized|403 forbidden|404|429|insufficient_quota|rate_limit|5\d\d/i.test(
      text,
    )
  ) {
    return new ConversationError(
      "http_error",
      text.length > 0 ? text : conversationUserMessage("http_error"),
      { cause: error },
    );
  }

  return new ConversationError(
    "provider_error",
    text.length > 0 ? text : conversationUserMessage("provider_error"),
    { cause: error },
  );
}

function toConversationCode(code: AdapterFailureCode): ConversationErrorCode {
  return code;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return String(error);
}
