# AI Domain — Vocabulary & SSOT Index

**Status:** Accepted (vocabulary) · Contract frozen (ACC-01)  
**Semantic SSOT:** [ai-semantic-model.md](./ai-semantic-model.md) (AIS-01)  
**Contract SSOT:** [conversation-contract.md](./conversation-contract.md) (ACC-01)  
**Architecture SSOT:** [../platform/AI-Delivery-Architecture.md](../platform/AI-Delivery-Architecture.md) (AID-01)  
**ADRs:** [ADR-020](../adr/ADR-020-ai-delivery-architecture.md) · [ADR-021](../adr/ADR-021-ai-semantic-model.md) · [ADR-022](../adr/ADR-022-conversation-contract.md)

This directory is the **canonical source** for AI-domain vocabulary and the Conversation Contract.

Other documents must **link here**. They must **not** redefine these terms.

---

## Canonical definitions (do not paraphrase elsewhere)

| Concept | Canonical definition | Detail | Stability |
| --- | --- | --- | --- |
| **Conversation** | Bounded ordered dialogue aggregate with stable id. | [AIS-01 §4.1](./ai-semantic-model.md#41-conversation) | **CORE** |
| **Turn** | Atomic request→completion unit of progress. | [AIS-01 §4.2](./ai-semantic-model.md#42-turn) | **CORE** |
| **Message** | Immutable communicative unit (role + content parts). | [AIS-01 §4.3](./ai-semantic-model.md#43-message) | **CORE** |
| **Context** | Platform facts projected into a Turn (≠ model context window). | [AIS-01 §4.4](./ai-semantic-model.md#44-context) | **CORE** |
| **Memory** | Derived continuity state for Prompts; not DecisionState. | [AIS-01 §4.5](./ai-semantic-model.md#45-memory) | **CORE** |
| **Capability** | Named Delivery ability negotiated without vendor branding in Experience. | [AIS-01 §4.6](./ai-semantic-model.md#46-capability) | **CORE** |
| **Attachment** | Referenced non-text payload descriptor. | [AIS-01 §4.7](./ai-semantic-model.md#47-attachment) | **CORE** |
| **Tool** | Declared invocable action during a Turn (PT-006 constrained). | [AIS-01 §4.8](./ai-semantic-model.md#48-tool) | **CORE** |
| **Completion** | Generative act for a Turn (streamed or not). | [AIS-01 §4.9](./ai-semantic-model.md#49-completion) | **CORE** |
| **Response** | Non-streaming Contract envelope for a Turn outcome. | [AIS-01 §4.10](./ai-semantic-model.md#410-response) · [ACC-01 §4](./conversation-contract.md#4-conversation-response) | **CORE** |
| **Event** | Typed ordered unit inside a Stream. | [AIS-01 §4.11](./ai-semantic-model.md#411-event) · [ACC-01 §5](./conversation-contract.md#5-event-model) | **CORE** |
| **Stream** | Ordered Events for one Turn’s Completion. | [AIS-01 §4.12](./ai-semantic-model.md#412-stream) | **CORE** |

---

## CAP order

```text
ARCH-AI-01      AI Delivery Architecture     ✅
CAP-AI-SEM-01   AI Semantic Model            ✅
CAP-AI-ACC-01   Conversation Contract Freeze ✅
CAP-AI-DELIVERY-01  Runtime ↔ Delivery       ✅ analysis — [mapping report](./CAP-AI-DELIVERY-01-runtime-delivery-mapping.md)
WP-A                Package boundaries       ✅ — [compliance](./WP-A-boundaries-compliance.md)
CAP-AI-ADAPTER-01   Adapter Framework        ← after WP-B (Runtime↔Delivery port)

CAP-AI-PUBLISH-01   Publish Binding
CAP-AI-SEC-01       Security
CAP-GOV-AI-01       Constitution
```

**Rule:** Semantics → Contract → Implementation.
