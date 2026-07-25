# CAP-AI-PUBLISH-01 — Secure Published AI Delivery

**Status:** Implemented  
**Date:** 2026-07-25  
**Closes:** ED-AI-12 (Experience secret injection); completes remaining ED-AI-03 Published gap

## Secure Publish Flow

```text
┌─────────────────────────────────────────────────────────────┐
│ Published Embed (public Release Snapshot)                   │
│  Experience  →  AI Runtime  →  AIDelivery (RemoteDelivery)  │
│  NO API keys · NO vendor secrets · public deliveryUrl only  │
└───────────────────────────────┬─────────────────────────────┘
                                │ HTTPS POST /v1/chat
                                │ ChatRequest → ChatResponse
                                ▼
┌─────────────────────────────────────────────────────────────┐
│ AI Delivery edge (@embed-engine/ai-delivery-edge)           │
│  Holds OPENAI_API_KEY · runs OpenAIAdapter · CORS allowlist │
└───────────────────────────────┬─────────────────────────────┘
                                │ vendor protocol
                                ▼
                           OpenAI Model
```

### Local Development

```text
Experience → createEmbedAIDelivery() → tryCreateLocalDevDelivery()
                                         └─ reads VITE_OPENAI_API_KEY / OPENAI_API_KEY
                                            from trusted Vite host env (never Experience)
```

### Mode selection (Delivery-owned)

| Condition | Mode |
| --- | --- |
| `deliveryUrl` / `VITE_AI_DELIVERY_URL` / `window.__EMBED_AI_DELIVERY__.deliveryUrl` set | **published** |
| Else, local credentials available on trusted host | **local** |
| Else | **disabled** (`not_configured` UX) |

Experience calls only `createEmbedAIDelivery()` — no secrets, no Adapter construction.

## Secret Boundary

| Location | Secrets allowed? |
| --- | --- |
| Experience (`embedAIService.ts`) | **No** |
| AI Runtime (`AIService`) | **No** |
| Delivery client (`RemoteDelivery`, host binding) | **No** (public URL only) |
| Release Snapshot / GitHub Pages IIFE | **No** (`VITE_OPENAI_API_KEY` forced `""`) |
| Local Vite `.env.local` (dev machine) | **Yes** (Dev-injected Adapter) |
| AI Delivery edge process env | **Yes** |

## Bootstrap

```ts
// Experience — secret-free
createAIServiceFromDelivery(createEmbedAIDelivery(), { sessionId, ... })
```

Published host may inject public URL without rebuild:

```html
<script>
  window.__EMBED_AI_DELIVERY__ = {
    deliveryUrl: "https://your-delivery-edge.example"
  };
</script>
```

Or bake at Release build time:

```bash
VITE_AI_DELIVERY_URL=https://your-delivery-edge.example pnpm embed:publish
```

## Edge operations

```bash
# Requires OPENAI_API_KEY in process env (never in Embed)
pnpm --filter @embed-engine/ai-delivery-edge start
# listens on http://127.0.0.1:8787
```

`POST /v1/chat` body = pre-ACC `ChatRequest`; response = `ChatResponse`.  
This is AID-01 **Gateway-mediated Delivery strategy**, not a new constitutional Gateway layer.

## ED-AI-12

**Closed.** Experience no longer injects `VITE_OPENAI_*` into Delivery bootstrap.

## ED-AI-03

**Closed** for Published config gap (Experience no longer constructs Provider / passes keys). Local still uses Dev-injected credentials inside `adapter/openai` only.

## Out of scope (explicit)

- ACC-01 live wire (still ChatRequest/ChatResponse — ED-AI-02)
- AIS type migration
- CAP-AI-SEC-01 (auth tokens between client and edge)
- New AI product features

## Verification

| Gate | Result |
| --- | --- |
| `@embed-engine/ai` tests (77) | PASS |
| `@embed-engine/ai-delivery-edge` tests (2) | PASS |
| Security audit tests | PASS |
| Published E2E (client → edge → reply) | PASS |
| Build / typecheck | PASS |
