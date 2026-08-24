/**
 * Local / Demo Dev-injected OpenAI Delivery (AID-01).
 *
 * Credentials are resolved only here from trusted host env — never from Experience.
 * Not a Release / Published path.
 */

import type { AIDelivery } from "../../delivery/AIDelivery";
import { createDirectAdapterDelivery } from "../../delivery/DirectAdapterDelivery";
import { OpenAIAdapter } from "./OpenAIAdapter";
import { missingOpenAIApiKeyFailure } from "./errors";
import type { ChatRequest } from "../../models/ChatRequest";
import type { ChatResponse } from "../../models/ChatResponse";

/**
 * Build Direct Adapter Delivery when local credentials exist.
 * Returns null when no key is available (caller uses not_configured).
 */
export function tryCreateLocalDevDelivery(): AIDelivery | null {
  const apiKey = readViteOpenAiApiKey() ?? readProcessEnv("OPENAI_API_KEY") ?? "";
  if (apiKey.length === 0) {
    return null;
  }

  const model = readViteOpenAiModel() ?? readProcessEnv("OPENAI_MODEL");

  return createDirectAdapterDelivery(
    new OpenAIAdapter({
      apiKey,
      ...(model !== undefined && model.length > 0 ? { model } : {}),
    }),
  );
}

/** Fail-fast local Delivery when credentials were expected but missing. */
export function createMissingLocalCredentialDelivery(): AIDelivery {
  return createDirectAdapterDelivery({
    async chat(_request: ChatRequest): Promise<ChatResponse> {
      throw missingOpenAIApiKeyFailure();
    },
  });
}

/** Dev diagnostics — presence only, never the secret value. */
export function detectLocalOpenAiCredentialSource(): {
  readonly viteApiKey: "present" | "missing";
  readonly processApiKey: "present" | "missing";
} {
  return {
    viteApiKey:
      readViteOpenAiApiKey() !== undefined ? "present" : "missing",
    processApiKey:
      readProcessEnv("OPENAI_API_KEY") !== undefined ? "present" : "missing",
  };
}

function readProcessEnv(name: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  const value = process.env[name];
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }
  return value.trim();
}

/**
 * Static `import.meta.env.VITE_*` member access — required for Vite injection.
 * Dynamic `env[name]` is not rewritten by Vite and silently returns undefined.
 */
function readViteOpenAiApiKey(): string | undefined {
  try {
    const value = import.meta.env.VITE_OPENAI_API_KEY;
    if (typeof value !== "string" || value.trim().length === 0) {
      return undefined;
    }
    return value.trim();
  } catch {
    return undefined;
  }
}

function readViteOpenAiModel(): string | undefined {
  try {
    const value = import.meta.env.VITE_OPENAI_MODEL;
    if (typeof value !== "string" || value.trim().length === 0) {
      return undefined;
    }
    return value.trim();
  } catch {
    return undefined;
  }
}
