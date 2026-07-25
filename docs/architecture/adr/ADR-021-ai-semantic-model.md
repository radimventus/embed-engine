# ADR-021 — AI Semantic Model

**Status:** Accepted  
**Date:** 2026-07-25  
**Title:** Freeze AI-domain vocabulary (AIS-01) before Conversation Contract  
**Depends on:** [ADR-020](./ADR-020-ai-delivery-architecture.md), [AID-01](../platform/AI-Delivery-Architecture.md), [PT-006](../pt/PT-006-ai-explains-never-decides.md)  
**SSOT detail:** [AIS-01 — AI Semantic Model](../ai/ai-semantic-model.md) · [AI vocabulary index](../ai/README.md)  
**Next:** [ADR-022 — Conversation Contract](./ADR-022-conversation-contract.md) (ACC-01 frozen)

**SSOT for:** Decision to treat Conversation, Turn, Message, Context, Memory, Capability, Attachment, Tool, Completion, Response, Event, and Stream as CORE platform nouns with AIS-01 meanings; ordering Semantics → Contract → Implementation  
**Not SSOT for:** Wire schemas, vendor maps, Delivery implementation, UX copy

---

## Context

ADR-020 / AID-01 established AI Delivery architecture. Architecture alone does not pin domain semantics. Freezing a Conversation Contract before nouns like Conversation, Memory, and Capability are precise risks reopening the Contract (the failure mode Decision Layer avoided by vocabulary-first discipline).

---

## Decision

1. Adopt **AIS-01** as the binding **AI Semantic Model** vocabulary SSOT.
2. CAP order for AI is normative:
   - ARCH-AI-01 (architecture) → **CAP-AI-SEM-01 (semantics)** → CAP-AI-ACC-01 (contract) → delivery/adapter/publish/security/gov CAPs.
3. Conversation Contract (ACC) **MUST** cite AIS-01 definitions; it must not invent competing meanings.
4. **AI Session ≠ Decision Session** (AIS-01 identity rules).
5. Platform **Context ≠** model context window.
6. **Memory** must not author DecisionState (PT-006).
7. CORE vocabulary changes require an ADR amending AIS-01 / this ADR.

---

## Consequences

### Positive

- Contract freeze can proceed on stable nouns.
- Experience, Delivery, and Adapters share one language.
- Same discipline as Decision Layer vocabulary.

### Negative / follow-up

- Existing `@embed-engine/ai` names may need alignment language in CAP-AI-DELIVERY-01 (no semantic fork).
- ACC-01 must not start until AIS-01 is Accepted (or explicitly Accepted-as-Proposed with freeze note).

### Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| Freeze ACC before semantics | Forces Contract reopen when nouns shift |
| Treat vendor “thread/completion” as platform nouns | Leaks vendor ontology upward |
| Equate AI Session with Decision Session | Contaminates RI-002 |

---

## Compliance

Implementations and ACC drafts MUST follow [AIS-01](../ai/ai-semantic-model.md).

---

## Notes

CAP-AI-SEM-01 is documentation-only. No code.
