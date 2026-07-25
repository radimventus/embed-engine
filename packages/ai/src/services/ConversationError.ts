/**
 * PT-011 — User-facing conversation errors (Embed must not crash).
 */

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
 * Map unknown provider / transport failures to ConversationError.
 * Never rethrows raw errors to UI.
 */
export function mapConversationError(error: unknown): ConversationError {
  if (error instanceof ConversationError) {
    return error;
  }

  const text = errorMessage(error);

  if (/missing api key|api key/i.test(text)) {
    return new ConversationError(
      "missing_api_key",
      conversationUserMessage("missing_api_key"),
      { cause: error },
    );
  }

  if (/timeout|timed out|aborted/i.test(text)) {
    return new ConversationError(
      "timeout",
      conversationUserMessage("timeout"),
      { cause: error },
    );
  }

  if (/HTTP\s*\d{3}|fetch failed|network/i.test(text)) {
    return new ConversationError(
      "http_error",
      conversationUserMessage("http_error"),
      { cause: error },
    );
  }

  if (/invalid|empty content|neplatn/i.test(text)) {
    return new ConversationError(
      "invalid_response",
      conversationUserMessage("invalid_response"),
      { cause: error },
    );
  }

  return new ConversationError(
    "provider_error",
    conversationUserMessage("provider_error"),
    { cause: error },
  );
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
