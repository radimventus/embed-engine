/**
 * Platform Adapter failure — vendor Adapters map transport/protocol errors here.
 *
 * Runtime maps AdapterFailure → ConversationError (platform Error Contract).
 * Vendor-specific strings stay inside the Adapter that produced them.
 */

export type AdapterFailureCode =
  | "missing_api_key"
  | "timeout"
  | "http_error"
  | "invalid_response"
  | "provider_error";

export class AdapterFailure extends Error {
  readonly code: AdapterFailureCode;
  /**
   * Optional user-facing diagnostic from the Adapter (e.g. Czech OpenAI status text).
   * When set, Runtime surfaces it as ConversationError.userMessage.
   */
  readonly diagnostic: string | null;

  constructor(
    code: AdapterFailureCode,
    message: string,
    options?: {
      readonly diagnostic?: string | null;
      readonly cause?: unknown;
    },
  ) {
    super(
      message,
      options?.cause !== undefined ? { cause: options.cause } : undefined,
    );
    this.name = "AdapterFailure";
    this.code = code;
    this.diagnostic =
      options?.diagnostic === undefined ? null : options.diagnostic;
  }
}

export function isAdapterFailure(error: unknown): error is AdapterFailure {
  return error instanceof AdapterFailure;
}
