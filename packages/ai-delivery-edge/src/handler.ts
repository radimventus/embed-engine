/**
 * Platform-agnostic AI Delivery edge handler (Fetch API).
 *
 * Shared by Node HTTP server and Cloudflare Worker — Delivery Contract only.
 * Does not redesign Adapter / Runtime / Conversation Contract.
 */

import { OpenAIAdapter } from "@embed-engine/ai";
import type { ChatRequest, ChatResponse } from "@embed-engine/ai";

export const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:4173",
  "http://localhost:5173",
  "http://localhost:5180",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5180",
  "https://conis.cz",
  "https://www.conis.cz",
] as const;

export type DeliveryEdgeEnv = {
  readonly OPENAI_API_KEY?: string;
  readonly AI_DELIVERY_OPENAI_API_KEY?: string;
  readonly OPENAI_MODEL?: string;
  readonly AI_DELIVERY_OPENAI_MODEL?: string;
  readonly AI_DELIVERY_ALLOWED_ORIGINS?: string;
};

export type DeliveryEdgeContext = {
  readonly chatHandler: ((request: ChatRequest) => Promise<ChatResponse>) | null;
  readonly allowedOrigins: readonly string[];
};

export function createDeliveryEdgeContext(
  env: DeliveryEdgeEnv = {},
  options: {
    readonly apiKey?: string;
    readonly model?: string;
    readonly allowedOrigins?: readonly string[];
    readonly chat?: (request: ChatRequest) => Promise<ChatResponse>;
  } = {},
): DeliveryEdgeContext {
  const allowedOrigins =
    options.allowedOrigins ??
    parseAllowedOrigins(env.AI_DELIVERY_ALLOWED_ORIGINS) ??
    DEFAULT_ALLOWED_ORIGINS;

  if (options.chat !== undefined) {
    return { chatHandler: options.chat, allowedOrigins };
  }

  const apiKey =
    options.apiKey?.trim() ||
    env.OPENAI_API_KEY?.trim() ||
    env.AI_DELIVERY_OPENAI_API_KEY?.trim() ||
    "";
  const model =
    options.model?.trim() ||
    env.OPENAI_MODEL?.trim() ||
    env.AI_DELIVERY_OPENAI_MODEL?.trim() ||
    undefined;

  if (apiKey.length === 0) {
    return { chatHandler: null, allowedOrigins };
  }

  const adapter = new OpenAIAdapter({
    apiKey,
    ...(model !== undefined && model.length > 0 ? { model } : {}),
  });

  return {
    chatHandler: (request) => adapter.chat(request),
    allowedOrigins,
  };
}

export async function handleDeliveryRequest(
  request: Request,
  ctx: DeliveryEdgeContext,
): Promise<Response> {
  const origin = request.headers.get("origin") ?? undefined;
  const corsHeaders = buildCorsHeaders(origin, ctx.allowedOrigins);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const path = new URL(request.url).pathname;

  if (request.method === "GET" && (path === "/health" || path === "/v1/health")) {
    return jsonResponse(
      200,
      { ok: true, configured: ctx.chatHandler !== null },
      corsHeaders,
    );
  }

  if (request.method === "POST" && path === "/v1/chat") {
    if (ctx.chatHandler === null) {
      return jsonResponse(503, { error: "not_configured" }, corsHeaders);
    }

    let bodyText: string;
    try {
      bodyText = await request.text();
    } catch {
      return jsonResponse(400, { error: "invalid_request" }, corsHeaders);
    }

    let chatRequest: ChatRequest;
    try {
      chatRequest = JSON.parse(bodyText) as ChatRequest;
    } catch {
      return jsonResponse(400, { error: "invalid_request" }, corsHeaders);
    }

    if (
      chatRequest === null ||
      typeof chatRequest !== "object" ||
      typeof chatRequest.sessionId !== "string" ||
      !Array.isArray(chatRequest.messages)
    ) {
      return jsonResponse(400, { error: "invalid_request" }, corsHeaders);
    }

    try {
      const response = await ctx.chatHandler(chatRequest);
      return jsonResponse(200, response, corsHeaders);
    } catch (error) {
      console.error("ai-delivery-edge: adapter failure", error);
      return jsonResponse(502, { error: "adapter_unavailable" }, corsHeaders);
    }
  }

  return jsonResponse(404, { error: "not_found" }, corsHeaders);
}

function parseAllowedOrigins(
  raw: string | undefined,
): readonly string[] | null {
  if (raw === undefined || raw.trim().length === 0) {
    return null;
  }
  const origins = raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return origins.length > 0 ? origins : null;
}

function buildCorsHeaders(
  origin: string | undefined,
  allowedOrigins: readonly string[],
): Headers {
  const headers = new Headers();
  headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  headers.set("access-control-allow-headers", "content-type, accept");
  if (origin !== undefined && isOriginAllowed(origin, allowedOrigins)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "origin");
  }
  return headers;
}

function isOriginAllowed(
  origin: string,
  allowedOrigins: readonly string[],
): boolean {
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    return true;
  }
  return allowedOrigins.some(
    (allowed) => origin === allowed || origin.startsWith(`${allowed}/`),
  );
}

function jsonResponse(
  status: number,
  body: unknown,
  corsHeaders: Headers,
): Response {
  const payload = JSON.stringify(body);
  const headers = new Headers(corsHeaders);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(payload, { status, headers });
}
