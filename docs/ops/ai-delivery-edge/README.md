# AI Delivery Edge — Production Operations

**Status:** Deployed (PT-OPS-AI-EDGE-01)  
**Platform:** Cloudflare Workers  
**Why Cloudflare Workers:** HTTPS by default, Worker secrets for `OPENAI_API_KEY`, global edge latency, no container/VM maintenance, matches the Delivery-edge role, and deploys the existing Fetch handler without redesigning Runtime / Adapter / Contract.

## Public endpoints

| | |
| --- | --- |
| **deliveryUrl** | `https://embed-ai-delivery.northern-paste.workers.dev` |
| **Health** | `GET https://embed-ai-delivery.northern-paste.workers.dev/health` |
| **Chat** | `POST https://embed-ai-delivery.northern-paste.workers.dev/v1/chat` |

Machine-readable: [`deployment.json`](./deployment.json)

> **Account note:** Initial deploy used `wrangler deploy --temporary`. Claim the preview account promptly (see `claimUrl` in `deployment.json` if present) or re-deploy with `wrangler login` + `pnpm --filter @embed-engine/ai-delivery-edge deploy` for a durable Workers account.

## Secrets & config

| Name | Where | Public? |
| --- | --- | --- |
| `OPENAI_API_KEY` | Cloudflare Worker secret | **No** |
| `OPENAI_MODEL` | Worker var (`gpt-4o-mini`) | Yes (non-secret) |
| `deliveryUrl` | Host page / publish env | Yes |

Never put `OPENAI_API_KEY` in browser, Embed IIFE, GitHub Pages, or Runtime.

## Point Published Embed at the Edge

### Method A — runtime (no rebuild)

```html
<script>
  window.__EMBED_AI_DELIVERY__ = {
    deliveryUrl: "https://embed-ai-delivery.northern-paste.workers.dev"
  };
</script>
<script src="https://conis.cz/embed/embed.iife.js?v=<commit>"></script>
```

### Method B — publish-time bake

```bash
VITE_AI_DELIVERY_URL=https://embed-ai-delivery.northern-paste.workers.dev pnpm embed:publish
```

Then commit/push `docs/embed` as usual.

## Local Node edge (dev)

```bash
export OPENAI_API_KEY=sk-...
export HOST=127.0.0.1
pnpm --filter @embed-engine/ai-delivery-edge start
```

## Deploy / update Worker

```bash
cd packages/ai-delivery-edge
npx wrangler@4 login   # once, durable account
echo "$OPENAI_API_KEY" | npx wrangler@4 secret put OPENAI_API_KEY
pnpm --filter @embed-engine/ai-delivery-edge deploy
```

## Security checklist

- [x] HTTPS only (`*.workers.dev`)
- [x] Secret held in Worker; sterile Embed `VITE_OPENAI_API_KEY:""`
- [x] CORS allowlist includes `https://conis.cz` + localhost
- [x] Browser talks only to `/v1/chat` — never `api.openai.com`

## Operational recommendations

1. **Claim / durable account** — replace temporary Workers preview with a logged-in Cloudflare account.
2. **Logging** — enable Workers Logpush or tail via `wrangler tail`; redact payloads.
3. **Monitoring** — alert on `/health` `configured=false`, 5xx rate, and OpenAI 429.
4. **Rate limiting** — add Cloudflare Rate Limiting / WAF before CAP-AI-SEC-01 auth.
5. **Retries** — keep idempotent client retries in RemoteDelivery only for transport failures; avoid duplicate charges on 200.
6. **Auth (CAP-AI-SEC-01)** — add signed tokens between browser and Edge when leaving pilot.
