# CAP-AI-PUBLISH-01 — Published End-to-End Test Report

**Date:** 2026-07-25  
**Verdict:** **PASS** (automated Published profile)

## Scenarios

| Scenario | Result | How |
| --- | --- | --- |
| Local Delivery path still available | PASS | `tryCreateLocalDevDelivery` when trusted env has credentials; existing Local Vite unchanged |
| Published path AI responds | PASS | `packages/ai-delivery-edge/src/published-e2e.test.ts` — `createEmbedAIDelivery({ mode: "published", deliveryUrl })` → edge `/v1/chat` → `sendMessage` content |
| Secret not in Experience / sterile define | PASS | Security audit suite |
| Missing configuration graceful fallback | PASS | `mode: "disabled"` / empty URL + no local key → platform `missing_api_key` UX |
| No internal edge details in user message | PASS | Mapped ConversationError user copy |

## Automated commands

```bash
pnpm --filter @embed-engine/ai test
pnpm --filter @embed-engine/ai-delivery-edge test
```

## Production follow-up (operator)

After deploying a real Delivery edge with `OPENAI_API_KEY`:

1. Set `VITE_AI_DELIVERY_URL` (or `window.__EMBED_AI_DELIVERY__`) to the edge origin.
2. `pnpm embed:publish` (IIFE remains sterile of model keys).
3. Manual browser check on Pages: AI replies; DevTools Network shows calls to Delivery edge only (not `api.openai.com`); no `sk-` in JS sources.

This CAP’s acceptance for E2E is satisfied by the automated Published Delivery profile test above. Live Pages verification is the operator step recommended before CAP-AI-ACC-WIRE-01.
