# CAP-AI-PUBLISH-01 — Security Validation Report

**Date:** 2026-07-25  
**Verdict:** **PASS**

## Checks

| Check | Result | Evidence |
| --- | --- | --- |
| No API key in Experience source | PASS | `PublishSecurity.test.ts` — no `VITE_OPENAI` / `apiKey` / `sk-` in `embedAIService.ts` |
| No API key in Runtime | PASS | `AIService.ts` audit |
| Sterile Publish define empties key | PASS | `packages/embed/vite.shared.ts` forces `VITE_OPENAI_API_KEY: ""` |
| Delivery host binding has no secret fields | PASS | `createEmbedAIDelivery` accepts only public `deliveryUrl` / mode |
| Vendor secrets only on edge / local adapter | PASS | `OPENAI_API_KEY` confined to `adapter/openai` + `ai-delivery-edge` |
| No secret required in `window` | PASS | `window.__EMBED_AI_DELIVERY__` carries public URL only |
| Missing config graceful UX | PASS | `not_configured` → `ConversationError` `missing_api_key` user copy (no internals) |

## Residual risk (documented, not FAIL)

| Risk | Mitigation |
| --- | --- |
| Delivery edge is publicly reachable | Origin allowlist; CAP-AI-SEC-01 for auth tokens |
| Pre-ACC ChatRequest on the wire | Temporary Delivery profile until CAP-AI-ACC-WIRE-01 |
| Local Vite still embeds key in Local bundles | Allowed by AID-01 Dev-injected mode; not Release path |
