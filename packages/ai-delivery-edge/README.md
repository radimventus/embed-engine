# @embed-engine/ai-delivery-edge

Server-side AI Delivery edge for **Published Embed** (CAP-AI-PUBLISH-01 / PT-OPS-AI-EDGE-01).

Holds model credentials. Invokes `OpenAIAdapter`. Exposes:

- `GET /health` — `{ ok, configured }`
- `POST /v1/chat` — `ChatRequest` → `ChatResponse`

## Production (Cloudflare Workers)

**Why Workers:** HTTPS, Worker secrets, no VM/container upkeep, Fetch handler shared with local Node.

| | |
| --- | --- |
| **deliveryUrl** | `https://embed-ai-delivery.northern-paste.workers.dev` |
| **Health** | `https://embed-ai-delivery.northern-paste.workers.dev/health` |

Ops runbook: [`docs/ops/ai-delivery-edge/README.md`](../../docs/ops/ai-delivery-edge/README.md)

```bash
# Durable account (recommended)
npx wrangler@4 login
echo "$OPENAI_API_KEY" | npx wrangler@4 secret put OPENAI_API_KEY
pnpm --filter @embed-engine/ai-delivery-edge deploy
```

## Run locally

```bash
export OPENAI_API_KEY=sk-...
pnpm --filter @embed-engine/ai-delivery-edge start
```

Default: `http://127.0.0.1:8787` (set `HOST=0.0.0.0` for containers).

Point Published Embed at it:

```bash
VITE_AI_DELIVERY_URL=http://127.0.0.1:8787 pnpm embed:publish
# or at runtime:
# window.__EMBED_AI_DELIVERY__ = { deliveryUrl: "http://127.0.0.1:8787" }
```

## Security

- Never ship this process’s env into the Embed Release Snapshot.
- CORS allowlist includes localhost and `https://radimventus.github.io`.
- Auth between browser and edge is deferred to CAP-AI-SEC-01.
