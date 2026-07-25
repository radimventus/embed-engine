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
import type { ChatRequest, ChatResponse } from "@embed-engine/ai";
import {
  createDeliveryEdgeContext,
  handleDeliveryRequest,
} from "./handler";

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
  const ctx = createDeliveryEdgeContext(process.env, {
    apiKey: options.apiKey,
    model: options.model,
    allowedOrigins: options.allowedOrigins,
    chat: options.chat,
  });

  const port = options.port ?? Number(process.env.PORT ?? DEFAULT_PORT);
  const host =
    options.host ??
    process.env.HOST?.trim() ??
    process.env.AI_DELIVERY_HOST?.trim() ??
    "127.0.0.1";

  const server = createServer(async (req, res) => {
    try {
      const request = await incomingToRequest(req, host, port);
      const response = await handleDeliveryRequest(request, ctx);
      await writeNodeResponse(res, response);
    } catch (error) {
      console.error("ai-delivery-edge: unhandled", error);
      if (!res.headersSent) {
        const payload = JSON.stringify({ error: "internal_error" });
        res.writeHead(500, {
          "content-type": "application/json; charset=utf-8",
          "content-length": Buffer.byteLength(payload),
        });
        res.end(payload);
      }
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const address = server.address();
      const boundPort =
        typeof address === "object" && address !== null ? address.port : port;
      const url = `http://${host === "0.0.0.0" ? "127.0.0.1" : host}:${boundPort}`;
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

async function incomingToRequest(
  req: IncomingMessage,
  host: string,
  port: number,
): Promise<Request> {
  const url = new URL(req.url ?? "/", `http://${host}:${port}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    } else {
      headers.set(key, value);
    }
  }

  const method = req.method ?? "GET";
  if (method === "GET" || method === "HEAD") {
    return new Request(url, { method, headers });
  }

  const body = await readBody(req);
  return new Request(url, { method, headers, body });
}

async function writeNodeResponse(
  res: ServerResponse,
  response: Response,
): Promise<void> {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  res.writeHead(response.status, headers);
  res.end(buffer);
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
