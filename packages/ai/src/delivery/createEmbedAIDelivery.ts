/**
 * Embed AI Delivery host binding (CAP-AI-PUBLISH-01).
 *
 * Delivery chooses mode:
 * - published — public deliveryUrl → RemoteDelivery (secrets on edge)
 * - local     — Dev-injected OpenAI Adapter (private env on trusted Vite host)
 * - disabled  — not_configured (graceful UX)
 *
 * Experience must call this with no secrets.
 */

import type { AIDelivery } from "./AIDelivery";
import { createNotConfiguredDelivery } from "./NotConfiguredDelivery";
import { createRemoteDelivery } from "./RemoteDelivery";
import { tryCreateLocalDevDelivery } from "../adapter/openai/createLocalDevDelivery";

export type EmbedAIDeliveryMode = "local" | "published" | "disabled";

export type EmbedAIDeliveryConfig = {
  /**
   * Force mode. Default: auto
   * - published when a public delivery URL is available
   * - else local when trusted-host credentials exist
   * - else disabled
   */
  readonly mode?: EmbedAIDeliveryMode | "auto";
  /**
   * Public AI Delivery edge URL (Published). Never a model API key.
   * Also readable from `VITE_AI_DELIVERY_URL` or `window.__EMBED_AI_DELIVERY__.deliveryUrl`.
   */
  readonly deliveryUrl?: string;
};

export type EmbedAIDeliveryBinding = {
  readonly mode: EmbedAIDeliveryMode;
  readonly deliveryUrl: string | null;
};

declare global {
  interface Window {
    __EMBED_AI_DELIVERY__?: {
      readonly deliveryUrl?: string;
    };
  }
}

/**
 * Resolve Local vs Published vs disabled without Experience secrets.
 */
export function resolveEmbedAIDeliveryBinding(
  config: EmbedAIDeliveryConfig = {},
): EmbedAIDeliveryBinding {
  const deliveryUrl = resolveDeliveryUrl(config);
  const forced = config.mode ?? "auto";

  if (forced === "published") {
    return {
      mode: deliveryUrl.length > 0 ? "published" : "disabled",
      deliveryUrl: deliveryUrl.length > 0 ? deliveryUrl : null,
    };
  }

  if (forced === "local") {
    return { mode: "local", deliveryUrl: null };
  }

  if (forced === "disabled") {
    return { mode: "disabled", deliveryUrl: null };
  }

  // auto
  if (deliveryUrl.length > 0) {
    return { mode: "published", deliveryUrl };
  }
  return { mode: "local", deliveryUrl: null };
}

/**
 * Build Delivery for Embed hosts (Local / Demo / Published).
 * Secrets never enter via Experience — only public deliveryUrl is accepted.
 */
export function createEmbedAIDelivery(
  config: EmbedAIDeliveryConfig = {},
): AIDelivery {
  const binding = resolveEmbedAIDeliveryBinding(config);

  if (binding.mode === "published" && binding.deliveryUrl !== null) {
    return createRemoteDelivery({
      deliveryUrl: binding.deliveryUrl,
      id: "published-remote",
    });
  }

  if (binding.mode === "local") {
    const local = tryCreateLocalDevDelivery();
    if (local !== null) {
      return local;
    }
    return createNotConfiguredDelivery();
  }

  return createNotConfiguredDelivery();
}

function resolveDeliveryUrl(config: EmbedAIDeliveryConfig): string {
  const fromConfig = config.deliveryUrl?.trim() ?? "";
  if (fromConfig.length > 0) {
    return fromConfig.replace(/\/$/, "");
  }

  const fromWindow = readWindowDeliveryUrl();
  if (fromWindow.length > 0) {
    return fromWindow;
  }

  const fromEnv = readPublicEnv("VITE_AI_DELIVERY_URL");
  if (fromEnv.length > 0) {
    return fromEnv.replace(/\/$/, "");
  }

  return "";
}

function readWindowDeliveryUrl(): string {
  if (typeof globalThis === "undefined") {
    return "";
  }
  const win = globalThis as typeof globalThis & {
    readonly window?: Window;
  };
  const value = win.window?.__EMBED_AI_DELIVERY__?.deliveryUrl;
  if (typeof value !== "string" || value.trim().length === 0) {
    return "";
  }
  return value.trim().replace(/\/$/, "");
}

function readPublicEnv(name: string): string {
  try {
    const meta = import.meta as ImportMeta & {
      readonly env?: Record<string, string | undefined>;
    };
    const value = meta.env?.[name];
    if (typeof value !== "string" || value.trim().length === 0) {
      return "";
    }
    return value.trim();
  } catch {
    return "";
  }
}
