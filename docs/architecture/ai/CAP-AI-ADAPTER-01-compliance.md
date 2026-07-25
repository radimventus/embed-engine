# CAP-AI-ADAPTER-01 — Compliance Report

**Status:** PASS  
**Scope:** OpenAI Adapter Extraction — vendor isolation behind Adapter Contract

## Verification gates

| Gate | Result |
|------|--------|
| Build | PASS |
| Typecheck | PASS |
| Tests (69) | PASS |
| Dependency Audit | PASS |
| Behavior preserved | PASS |
## Target architecture

```
Experience
      │
AI Runtime (AIService)
      │
AIDelivery (vendor-neutral)
      │
AIAdapter (port)
      │
OpenAIAdapter | MockAdapter
      │
OpenAI API  |  (in-process mock)
```

## Deliverables

| Item | Location | Status |
|------|----------|--------|
| Adapter Contract | `src/adapter/port.ts` (`AIAdapter`, `LLMProvider` alias) | Done |
| OpenAI Adapter | `src/adapter/openai/` | Done |
| Mock Adapter | `src/adapter/mock/` | Done |
| Vendor-neutral Delivery | `src/delivery/` (port + DirectAdapter only) | Done |
| Embed bootstrap | `src/adapter/openai/createEmbedAIDelivery.ts` | Done |
| AdapterFailure | `src/adapter/AdapterFailure.ts` + openai `errors.ts` | Done |
| Compat re-exports | `src/providers/*` → adapter | Done |

## Task checklist

| Task | Result |
|------|--------|
| 1 — OpenAI Adapter | PASS — `OpenAIAdapter` under `adapter/openai` |
| 2 — Vendor isolation | PASS — bootstrap, defaults, endpoint, mapping, auth in openai/ |
| 3 — Delivery cleanup | PASS — no OpenAI / HTTP / keys / endpoints in `delivery/` |
| 4 — Mock Adapter | PASS — same `AIAdapter` contract; behavior unchanged |
| 5 — Error ownership | PASS — OpenAI map in `adapter/openai/errors.ts`; Runtime maps `AdapterFailure` → `ConversationError` |
| 6 — Dependency audit | See below |

## Dependency Audit

| Rule | Result |
|------|--------|
| Runtime (`AIService`) does not know OpenAI | PASS |
| Delivery does not know OpenAI | PASS |
| Delivery does not know HTTP / fetch / Bearer | PASS |
| Delivery does not know endpoints | PASS |
| Delivery does not know API keys | PASS |
| OpenAI isolated in `adapter/openai` | PASS |
| Mock uses same Adapter Contract | PASS |
| Experience unchanged (still `createEmbedAIDelivery`) | PASS |
| Conversation Contract / Semantic Model unchanged | PASS |
| No Gateway / no new product features | PASS |

## Public API

Preserved root exports: `OpenAIProvider`, `MockProvider`, `LLMProvider`, `createEmbedAIDelivery`, `createAIService`, etc.  
Additive: `AIAdapter`, `OpenAIAdapter`, `MockAdapter`, `AdapterFailure`.

## Behavior preservation

- Missing API key → same fail-fast Adapter message → same Conversation UX (`missing_api_key`)
- OpenAI Czech HTTP/network diagnostics still surface via `AdapterFailure.diagnostic`
- Mock deterministic content unchanged
- Local / Demo / Published bootstrap path unchanged at Experience

## Constraints respected

- No Runtime orchestration change (still Delivery-only chat)
- No Experience logic change
- No ACC / AIS / Gateway changes
