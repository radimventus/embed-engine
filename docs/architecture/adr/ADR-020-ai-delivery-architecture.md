# ADR-020 — AI Delivery Architecture

**Status:** Accepted  
**Date:** 2026-07-25  
**Title:** Introduce AI Delivery as a first-class platform layer with a vendor-neutral Conversation Contract  
**Depends on:** [ADR-001](./ADR-001-runtime-architecture.md), [ADR-016](./ADR-016-experience-delivery-layer.md), [ADR-019](./ADR-019-runtime-vs-release.md), [PT-006](../pt/PT-006-ai-explains-never-decides.md)  
**SSOT detail:** [AID-01 — AI Delivery Architecture](../platform/AI-Delivery-Architecture.md)  
**Vocabulary SSOT:** [AIS-01 — AI Semantic Model](../ai/ai-semantic-model.md) · [ADR-021](./ADR-021-ai-semantic-model.md)

**SSOT for:** Decision to treat AI as a platform capability delivered through AI Runtime + Conversation Contract + AI Delivery + AI Adapters; Gateway as optional implementation only; exclusive translation authority of AI Delivery  
**Not SSOT for:** Concrete Gateway, HTTP APIs, OpenAI/Anthropic/Gemini integration, package layout, UX copy, CORE dialogue noun definitions (AIS-01)

---

## Context

Runtime SSOT, Experience Delivery, and Release Workflow are established. Local Runtime can run AI via developer env injection. Published Embed intentionally ships **no** model API key (Release security). The same Runtime therefore yields different AI outcomes across deployments.

Root-cause review classified this as an **Architecture Gap**, not a Runtime, Provider, or Release bug: the platform lacked a constitutional **AI Delivery** model comparable to Runtime / Experience / Release.

Without AID-01:

- Experience risks coupling to a vendor,
- teams may re-introduce secrets into public IIFE,
- Gateway may be mistaken for a required platform layer,
- multi-provider / enterprise / partner deployments fork ad hoc.

---

## Decision

1. Adopt **AID-01** as the binding **AI Delivery Architecture** SSOT.
2. Introduce platform nouns:
   - **AI Runtime** — conversation orchestration (not Decision meaning),
   - **Conversation Contract** — vendor-neutral request/response/error/stream language,
   - **AI Delivery** — binding, routing, policy, safe credential resolution,
   - **AI Adapter** — vendor/gateway/mock mapping,
   - **AI Model** — generation endpoint behind Adapter.
3. **Experience** consumes only the Conversation Contract. It never selects a vendor Model.
4. **Decision Runtime** never holds model secrets and never performs model transport.
5. **Gateway is optional** — one possible hosted implementation of AI Delivery, **not** a constitutional layer beside Runtime / Experience / Release / AI Delivery.
6. **Published Embed** may include AI client code; it **must not** include model API secrets. Unconfigured Delivery yields typed `not_configured` (or equivalent Contract error), not a Runtime defect.
7. Future multi-model, fallback, streaming, multimodal, MCP/tools, partner and enterprise deployments are absorbed by Delivery/Adapters/Capabilities **without Experience change**.
8. Existing package names using “Provider” are transitional; constitutional language prefers **Adapter**.
9. **Constitutional translation principle:**

   > **AI Delivery is the only platform layer allowed to translate the vendor-neutral Conversation Contract into vendor-specific protocols.**

   Consequences of §9:
   - Decision Runtime must not know OpenAI (or any vendor protocol).
   - Experience must not know Anthropic (or any vendor protocol).
   - Adapter must not redefine or widen the Conversation Contract / AIS-01 semantics — it only maps representations.
   - Gateway must not change domain semantics — policy and secrets only.
   - Model identity and vendor payloads must not leak into platform layers above AI Delivery.

10. **Semantics precede Contract:** dialogue vocabulary is owned by **AIS-01** ([ADR-021](./ADR-021-ai-semantic-model.md)). Conversation Contract freeze (ACC) follows AIS-01.

---

## Consequences

### Positive

- AI becomes a platform capability with clear boundaries.
- Local vs Published AI differences become deployment modes, not architecture confusion.
- Vendor swap and Gateway introduction do not fork Experience or Decision Runtime.
- Security invariant for Release Snapshots remains enforceable.
- Exclusive translation authority matches Runtime’s semantic discipline.

### Negative / follow-up

- Current browser Vite-env bootstrap is a **Dev-injected** mode only; production path requires a later implementation CAP (Gateway-mediated or trusted-host Adapter).
- Conversation Contract wire format waits on AIS-01, then CAP-AI-ACC-01.
- UX copy for `not_configured` should align with Contract errors (Experience CAP).
- Optional Platform Constitution amendment for an AI Delivery Principle (CAP-GOV-AI-01).

### Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| Bake model API keys into Published Embed | Violates Release security; already blocked |
| Require Gateway as constitutional layer | Over-constrains Local/Enterprise/Mock; couples platform to hosting shape |
| Experience calls vendor SDK directly | Destroys portability; leaks vendor into UI |
| Decision Runtime owns model HTTP | Contaminates semantic Kernel with transport/secrets |
| Treat today’s empty-key UX as Runtime bug | Misdiagnoses deployment architecture as Kernel failure |
| Allow Adapter/Gateway to extend platform semantics | Breaks Contract neutrality and Experience portability |

---

## Compliance

Implementations MUST follow [AID-01](../platform/AI-Delivery-Architecture.md) and vocabulary in [AIS-01](../ai/ai-semantic-model.md).

This ADR does **not** authorize a specific vendor, Gateway product, or HTTP API.

---

## Follow-up CAPs (normative order)

```text
ARCH-AI-01        AI Delivery Architecture     ✅ (this ADR / AID-01)
CAP-AI-SEM-01     AI Semantic Model            ✅ AIS-01 / ADR-021
CAP-AI-ACC-01     Conversation Contract Freeze ✅ ACC-01 / ADR-022
CAP-AI-DELIVERY-01  AI Runtime ↔ Delivery mapping
CAP-AI-ADAPTER-01   Adapter Framework
CAP-AI-PUBLISH-01   Publish Binding
CAP-AI-SEC-01       Security
CAP-GOV-AI-01       Constitution
```

| CAP | Intent |
| --- | --- |
| **CAP-AI-SEM-01** | Freeze AIS-01 vocabulary before Contract |
| **CAP-AI-ACC-01** | Freeze Conversation Contract fields + error codes + versioning (cites AIS-01) |
| **CAP-AI-DELIVERY-01** | Map current `@embed-engine/ai` orchestration onto AI Runtime / Delivery boundaries |
| **CAP-AI-ADAPTER-01** | Adapter package rules; Mock first; migrate OpenAI connector behind Adapter Contract |
| **CAP-AI-PUBLISH-01** | Published Embed Delivery binding (Gateway client profile / `not_configured` UX) — still no secrets in snapshot |
| **CAP-AI-SEC-01** | Auth material between Delivery client and hosted edge |
| **CAP-GOV-AI-01** | Optional Constitution § AI Delivery Principle |

---

## Notes

ARCH-AI-01 is **Accepted** as architectural foundation. It is not the end of the AI layer; it enables Semantics → Contract → Implementation without Experience/Runtime rewrites for each vendor.
