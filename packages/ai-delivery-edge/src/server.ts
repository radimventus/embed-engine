/**
 * AI Delivery edge — holds model secrets server-side (CAP-AI-PUBLISH-01).
 *
 * Published Embed clients POST ChatRequest to POST /v1/chat.
 * This process invokes OpenAIAdapter with OPENAI_API_KEY from the environment.
 *
 * Not a constitutional Gateway layer — AID-01 optional Delivery edge strategy.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { pathToFileURL } from "node:url";
import { OpenAIAdapter } from "@embed-engine/ai";
import type { ChatRequest, ChatResponse } from "@embed-engine/ai";

const DEFAULT_PORT = 8787;

export type AiDeliveryEdgeOptions = {
  readonly port?: number;
  readonly host?: string;
  readonly apiKey?: string;
  readonly model?: string;
  readonly allowedOrigins?: readonly string[];
  /** Test / custom handler — when set, skips OpenAI Adapter construction. */
  readonly chat?: (request: ChatRequest) => Promise<ChatResponse>;
};

export type AiDeliveryEdgeHandle = {
  readonly close: () => Promise<void>;
  readonly url: string;
  readonly port: number;
};

export function startAiDeliveryEdge(
  options: AiDeliveryEdgeOptions = {},
): Promise<AiDeliveryEdgeHandle> {
  const apiKey =
    options.apiKey?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.AI_DELIVERY_OPENAI_API_KEY?.trim() ||
    "";
  const model =
    options.model?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    process.env.AI_DELIVERY_OPENAI_MODEL?.trim() ||
    undefined;

  const allowedOrigins = options.allowedOrigins ?? [
    "http://localhost:4173",
    "http://localhost:5173",
    "http://localhost:5180",
    "http://127.0.0.1:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5180",
    "https://radimventus.github.io",
  ];

  const adapter =
    options.chat !== undefined
      ? null
      : apiKey.length > 0
        ? new OpenAIAdapter({
            apiKey,
            ...(model !== undefined && model.length > 0 ? { model } : {}),
          })
        : null;

  const chatHandler =
    options.chat ??
    (adapter !== null
      ? (request: ChatRequest) => adapter.chat(request)
      : null);

  const port = options.port ?? Number(process.env.PORT ?? DEFAULT_PORT);
  const host = options.host ?? "127.0.0.1";

  const server = createServer(async (req, res) => {
    try {
      await handleRequest(req, res, {
        chatHandler,
        allowedOrigins,
      });
    } catch (error) {
      console.error("ai-delivery-edge: unhandled", error);
      if (!res.headersSent) {
        sendJson(res, 500, { error: "internal_error" });
      }
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const address = server.address();
      const boundPort =
        typeof address === "object" && address !== null ? address.port : port;
      const url = `http://${host}:${boundPort}`;
      resolve({
        url,
        port: boundPort,
        close: () =>
          new Promise((resClose, rejClose) => {
            server.close((err) => (err ? rejClose(err) : resClose()));
          }),
      });
    });
  });
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: {
    readonly chatHandler: ((request: ChatRequest) => Promise<ChatResponse>) | null;
    readonly allowedOrigins: readonly string[];
  },
): Promise<void> {
  const origin = req.headers.origin;
  applyCors(res, origin, ctx.allowedOrigins);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const path = (req.url ?? "/").split("?")[0];
  if (req.method === "GET" && (path === "/health" || path === "/v1/health")) {
    sendJson(res, 200, {
      ok: true,
      configured: ctx.chatHandler !== null,
    });
    return;
  }

  if (req.method === "POST" && path === "/v1/chat") {
    if (ctx.chatHandler === null) {
      sendJson(res, 503, { error: "not_configured" });
      return;
    }
    const body = await readBody(req);
    let request: ChatRequest;
    try {
      request = JSON.parse(body) as ChatRequest;
    } catch {
      sendJson(res, 400, { error: "invalid_request" });
      return;
    }
    if (
      request === null ||
      typeof request !== "object" ||
      typeof request.sessionId !== "string" ||
      !Array.isArray(request.messages)
    ) {
      sendJson(res, 400, { error: "invalid_request" });
      return;
    }

    try {
      const response: ChatResponse = await ctx.chatHandler(request);
      sendJson(res, 200, response);
    } catch (error) {
      console.error("ai-delivery-edge: adapter failure", error);
      sendJson(res, 502, { error: "adapter_unavailable" });
    }
    return;
  }

  sendJson(res, 404, { error: "not_found" });
}

function applyCors(
  res: ServerResponse,
  origin: string | undefined,
  allowedOrigins: readonly string[],
): void {
  if (origin !== undefined && isOriginAllowed(origin, allowedOrigins)) {
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader("vary", "origin");
  }
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, accept");
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

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  const edge = await startAiDeliveryEdge();
  console.log(`AI Delivery edge listening on ${edge.url}`);
  console.log(
    `configured=${Boolean(process.env.OPENAI_API_KEY || process.env.AI_DELIVERY_OPENAI_API_KEY)}`,
  );
}
