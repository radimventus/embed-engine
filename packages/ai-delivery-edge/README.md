# @embed-engine/ai-delivery-edge

Server-side AI Delivery edge for **Published Embed** (CAP-AI-PUBLISH-01).

Holds model credentials. Invokes `OpenAIAdapter`. Exposes:

- `GET /health` — `{ ok, configured }`
- `POST /v1/chat` — `ChatRequest` → `ChatResponse`

## Run locally

```bash
export OPENAI_API_KEY=sk-...
pnpm --filter @embed-engine/ai-delivery-edge start
```

Default: `http://127.0.0.1:8787`

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
