# WP-B — Runtime Isolation via AI Delivery Port — Compliance

**Date:** 2026-07-25  
**Commit target:** `refactor(ai): isolate runtime behind AI delivery port`

## Dependency Audit

| Claim | Result |
| --- | --- |
| Runtime (`AIService`) does not import Adapter OpenAI | **PASS** |
| Runtime does not import `OpenAIProvider` | **PASS** |
| Runtime depends on `AIDelivery` port | **PASS** |
| Experience (`AIAdvisor`) does not know Delivery internals | **PASS** (uses `getEmbedAIService` only) |
| Experience bootstrap does not import `OpenAIProvider` | **PASS** (`createEmbedAIDelivery`) |
| Adapter (`OpenAIProvider`) remains sole vendor protocol owner | **PASS** (plus Delivery bootstrap wiring) |
| Compat `createAIService(LLMProvider)` preserved | **PASS** (wraps DirectAdapterDelivery) |

## Notes

- `getProvider` / `setProvider` remain as **compat** unwrap/wrap of Direct Adapter Delivery for existing tests.
- Prefer `getDelivery` / `setDelivery` / `createAIServiceFromDelivery`.
- ACC-01 types not introduced (WP-B scope).
- No Gateway.

## Behaviour

Missing API key path unchanged (same Error message → ConversationError mapping).
