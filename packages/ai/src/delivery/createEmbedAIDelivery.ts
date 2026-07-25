/**
 * Embed AI Delivery host binding (CAP-AI-PUBLISH-01).
 *
 * Delivery chooses mode:
 * - published — public deliveryUrl → RemoteDelivery (secrets on edge)
 * - local     — Dev-injected OpenAI Adapter (private env on trusted Vite host)
 * - disabled  — not_configured (graceful UX)
 *
 * Experience must call this with no secrets.
 *
 * auto:
 * - deliveryUrl present → published (RemoteDelivery)
 * - production / published host without URL → disabled (never LocalDelivery)
 * - development host → local (LocalDelivery when credentials exist)
 */

import type { AIDelivery } from "./AIDelivery";
import { readDeliveryMeta } from "./AIDelivery";
import {
  createNotConfiguredDelivery,
  type NotConfiguredReason,
} from "./NotConfiguredDelivery";
import { createRemoteDelivery } from "./RemoteDelivery";
import {
  detectLocalOpenAiCredentialSource,
  tryCreateLocalDevDelivery,
} from "../adapter/openai/createLocalDevDelivery";

export type EmbedAIDeliveryMode = "local" | "published" | "disabled";

export type EmbedAIDeliveryConfig = {
  /**
   * Force mode. Default: auto
   * - published when a public delivery URL is available
   * - production host without URL → disabled (no LocalDelivery fallback)
   * - else local when on a trusted Dev host
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

  // Published / production hosts must not silently fall back to LocalDelivery.
  if (isProductionHost()) {
    return { mode: "disabled", deliveryUrl: null };
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
  const credentials = detectLocalOpenAiCredentialSource();

  if (binding.mode === "published" && binding.deliveryUrl !== null) {
    const delivery = createRemoteDelivery({
      deliveryUrl: binding.deliveryUrl,
      id: "published-remote",
    });
    logDeliveryDiagnostics({
      mode: binding.mode,
      implementation: readDeliveryMeta(delivery).deliveryId,
      reason: "public deliveryUrl resolved",
      deliveryUrl: binding.deliveryUrl,
      credentials,
    });
    return delivery;
  }

  if (binding.mode === "local") {
    const local = tryCreateLocalDevDelivery();
    if (local !== null) {
      logDeliveryDiagnostics({
        mode: binding.mode,
        implementation: readDeliveryMeta(local).deliveryId,
        reason: "local credentials present",
        deliveryUrl: null,
        credentials,
      });
      return local;
    }

    const notConfigured = createNotConfiguredDelivery(
      "missing_local_credentials",
    );
    logDeliveryDiagnostics({
      mode: binding.mode,
      implementation: readDeliveryMeta(notConfigured).deliveryId,
      reason: "local credentials missing",
      deliveryUrl: null,
      credentials,
    });
    return notConfigured;
  }

  const reason: NotConfiguredReason =
    config.mode === "disabled" ? "disabled" : "missing_delivery_url";

  const notConfigured = createNotConfiguredDelivery(reason);
  logDeliveryDiagnostics({
    mode: binding.mode,
    implementation: readDeliveryMeta(notConfigured).deliveryId,
    reason:
      reason === "missing_delivery_url"
        ? "published host without deliveryUrl"
        : "delivery explicitly disabled",
    deliveryUrl: binding.deliveryUrl,
    credentials,
  });
  return notConfigured;
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

  const fromEnv = readViteAiDeliveryUrl();
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

/** Static member access — required for Vite env injection. */
function readViteAiDeliveryUrl(): string {
  try {
    const value = import.meta.env.VITE_AI_DELIVERY_URL;
    if (typeof value !== "string" || value.trim().length === 0) {
      return "";
    }
    return value.trim();
  } catch {
    return "";
  }
}

/**
 * Production / Published Embed hosts (IIFE Release Snapshot).
 * Dev Client Studio and Embed Demo stay on the LocalDelivery path.
 */
function isProductionHost(): boolean {
  try {
    if (import.meta.env.PROD === true) {
      return true;
    }
    return import.meta.env.MODE === "production";
  } catch {
    return false;
  }
}

function isDevDiagnosticsEnabled(): boolean {
  try {
    if (import.meta.env.DEV === true) {
      return true;
    }
    return import.meta.env.MODE === "development";
  } catch {
    return false;
  }
}

function logDeliveryDiagnostics(info: {
  readonly mode: EmbedAIDeliveryMode;
  readonly implementation: string;
  readonly reason: string;
  readonly deliveryUrl: string | null;
  readonly credentials: {
    readonly viteApiKey: "present" | "missing";
    readonly processApiKey: "present" | "missing";
  };
}): void {
  if (!isDevDiagnosticsEnabled()) {
    return;
  }
  console.info(
    [
      "[AI Delivery]",
      `mode=${info.mode}`,
      `deliveryUrl=${info.deliveryUrl ?? "<missing>"}`,
      `implementation=${info.implementation}`,
      `reason=${info.reason}`,
      `viteOpenAiKey=${info.credentials.viteApiKey}`,
      `processOpenAiKey=${info.credentials.processApiKey}`,
    ].join(" "),
  );
}
