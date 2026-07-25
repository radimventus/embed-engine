# ADR-022 — Conversation Contract Freeze

**Status:** Accepted  
**Date:** 2026-07-25  
**Title:** Freeze ACC-01 vendor-neutral Conversation Contract between AI Runtime and AI Delivery  
**Depends on:** [ADR-020](./ADR-020-ai-delivery-architecture.md), [ADR-021](./ADR-021-ai-semantic-model.md), [AIS-01](../ai/ai-semantic-model.md), [AID-01](../platform/AI-Delivery-Architecture.md)  
**SSOT detail:** [ACC-01 — Conversation Contract](../ai/conversation-contract.md)

**SSOT for:** Decision to freeze ACC-01 v1.0.0 as the only Contract language between AI Runtime and AI Delivery; versioning and compatibility rules therein  
**Not SSOT for:** Transport, serialization, Gateway, vendor Adapters, TypeScript, HTTP

---

## Context

AID-01 and AIS-01 establish architecture and vocabulary. Without a frozen exchange Contract, Delivery and Adapter CAPs would invent ad hoc shapes and reopen semantics.

---

## Decision

1. Adopt **ACC-01 v1.0.0** as the binding Conversation Contract SSOT.
2. AI Runtime ↔ AI Delivery communication for Completions MUST conform to ACC-01.
3. ACC-01 MUST NOT define new AIS-01 CORE nouns; semantic change requires AIS-01 first.
4. ACC-01 MUST remain vendor-neutral and transport-neutral.
5. Exclusive translation of ACC-01 into vendor protocols remains **AI Delivery** (via Adapters) per ADR-020 §9.
6. Versioning follows ACC-01 §8 (Major / Minor / Patch) with Runtime↔Delivery compatibility checks in §8.1.
7. Error class for model-edge failures is **`adapter`**, not “provider”.

---

## Consequences

### Positive

- Implementation CAPs share one exchange language.
- Experience/Runtime stay free of vendor protocols.
- Published “not configured” maps to ACC error class `configuration` / `not_configured`.

### Negative / follow-up

- Existing `@embed-engine/ai` must be mapped in CAP-AI-DELIVERY-01 without changing ACC semantics.
- Wire formats are still undefined (intentional) until an implementation CAP chooses encoding.

### Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| Freeze TypeScript interfaces as the Contract | Couples platform to one language; violates “no implementation” |
| Include Gateway in ACC parties | Gateway is optional Delivery strategy (AID-01) |
| Vendor error codes as Contract identity | Breaks neutrality |

---

## Compliance

Implementations MUST follow [ACC-01](../ai/conversation-contract.md) and vocabulary in [AIS-01](../ai/ai-semantic-model.md).

---

## Freeze Review

Recorded in ACC-01 §10: **READY**.

---

## Notes

CAP-AI-ACC-01 is documentation-only.
