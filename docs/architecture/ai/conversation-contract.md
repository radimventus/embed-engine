# Conversation Contract

**Status:** Frozen (Contract SSOT — CAP-AI-ACC-01)  
**Version:** 1.0.0  
**Date:** 2026-07-25  
**ID:** ACC-01  
**Layer:** Platform Contract · AI Runtime ↔ AI Delivery  
**SSOT for:** Vendor-neutral Conversation Contract exchanged between AI Runtime and AI Delivery (Request, Response, Event catalog, Capability negotiation, Error model, versioning, compatibility)  
**Not SSOT for:** Serialization, transport, HTTP, OpenAPI, TypeScript types, Adapter/vendor protocols, Gateway, Experience UI, AIS-01 noun definitions, Decision Runtime

**Depends on (semantics — do not redefine):**

- [AIS-01 — AI Semantic Model](./ai-semantic-model.md)
- [ADR-021 — AI Semantic Model](../adr/ADR-021-ai-semantic-model.md)
- [AID-01 — AI Delivery Architecture](../platform/AI-Delivery-Architecture.md)
- [ADR-020 — AI Delivery Architecture](../adr/ADR-020-ai-delivery-architecture.md)
- [ADR-022 — Conversation Contract](../adr/ADR-022-conversation-contract.md)

**Boundary:**

```text
AI Runtime  ── ACC-01 Conversation Contract ──►  AI Delivery
                                                      │
                                                      ▼
                                               (Adapters / optional Gateway
                                                — outside this Contract)
```

**Rules:**

1. All CORE nouns mean exactly what [AIS-01](./ai-semantic-model.md) says.
2. This Contract **must not** introduce new domain nouns. Missing meaning → return to AIS-01.
3. **AI Delivery** is the only layer that may translate this Contract into vendor-specific protocols (ADR-020 §9).
4. No transport, encoding, vendor, or Gateway appears in this document as a dependency.

---

## 1. Purpose

Freeze how AI Runtime and AI Delivery exchange Turns and Completions using AIS-01 vocabulary — before any implementation CAP.

Experience may consume AI Runtime APIs that are *shaped by* this Contract; Experience still must not speak vendor protocols.

---

## 2. Contract identity

| Field | Meaning |
| --- | --- |
| `contractId` | Always `ACC-01` |
| `contractVersion` | Semver string of this Contract (frozen at `1.0.0`) |

Every Request and every terminal Response/Event envelope carries both fields so peers can negotiate compatibility (§8–§9).

---

## 3. Conversation Request

A **Conversation Request** asks AI Delivery to perform (or continue) the **Completion** for exactly one **Turn**.

Semantics of Conversation, Turn, Message, Context, Memory, Attachment, Capability: [AIS-01](./ai-semantic-model.md).

### 3.1 Required parts

| Part | AIS-01 anchor | Meaning in the Request |
| --- | --- | --- |
| **Contract identity** | — | `contractId`, `contractVersion` |
| **Conversation** | §4.1 | Identity of the dialogue aggregate: at least `conversationId`. |
| **AI Session** | §5 / R4–R5 | `sessionId` correlating this Conversation to the Experience visit (≠ Decision Session). |
| **Tenant** | §3 | `tenantId` (opaque platform tenant / partner identity). |
| **Turn** | §4.2 | Identity and intent of this unit of progress: at least `turnId`; Turn is the cancel/timeout/retry scope. |
| **Initiating Message** | §4.3 | The immutable Message that opens this Turn (`messageId`, `role` ∈ {`user`,`system`}, ordered content parts). |
| **Context** | §4.4 | Platform facts for this Turn (object binding, experience binding, allowed Decision/Interpretation projections, locale, and other non-dialogue facts). Must not contain secrets or DecisionState mutators. |
| **Capabilities (required)** | §4.6 | Capability names the Runtime **requires** for this Turn (may be empty set = no hard requirements beyond baseline complete). |

### 3.2 Optional parts

| Part | AIS-01 anchor | Meaning |
| --- | --- | --- |
| **Object binding** | R6 | `objectId` — primary object for this Conversation (if not already fixed on Conversation open). |
| **Experience binding** | §4.4 | `experienceId` — Experience surface / mode id. |
| **Memory** | §4.5 | Memory snapshot AI Runtime already holds for Prompt continuity (Delivery must not treat Memory as DecisionState). |
| **Prompt** | §5 | Optional Prompt package already assembled by AI Runtime for this Turn’s Completion. If absent, Delivery/Adapter must not invent Decision meaning; AI Runtime remains Prompt authority. |
| **Attachments** | §4.7 | Attachment descriptors referenced by Message parts (id, mime class, size class, role). |
| **Tools (available)** | §4.8 | Declarations of Tools that may be requested during this Turn’s Completion (names + schemas as opaque structured descriptions — not vendor tool APIs). |
| **Capabilities (preferred)** | §4.6 | Soft preferences (e.g. prefer streaming) that must not fail negotiation if unsupported. |
| **Prior Messages** | §4.3 | Optional slice of Conversation history if Memory alone is insufficient; still AIS-01 Messages. |
| **Cancellation** | §4.2 | Logical cancel handle for this Turn. |
| **Timeout** | §4.2 | Turn budget as duration class / milliseconds *concept* (not a transport timeout knobsheet). |
| **Retry policy** | §4.2 | Whether this Turn’s Completion may be retried safely (idempotence class). |
| **Metadata** | AIS-01 Conversation/Turn metadata | Non-semantic bag (locale hints already in Context take precedence; client build marker; correlation ids). Must not carry secrets or vendor protocol fields. |

### 3.3 Extensible parts

| Extension | Rule |
| --- | --- |
| Additional Metadata keys | Minor bump if ignored-by-default; must not change CORE noun meaning |
| New Capability names | Minor if optional; Major if required by default |
| New Message part kinds | Minor if ignorable; Major if required to understand Request |

### 3.4 Explicitly out of Request

- Vendor model ids as Experience-facing requirements  
- API keys / bearer secrets  
- HTTP methods, URLs, headers  
- Gateway routing directives as domain fields  
- Mutations to DecisionState  

---

## 4. Conversation Response

A **Conversation Response** is the **non-streaming** envelope returning the outcome of a Turn’s **Completion** ([AIS-01 §4.10](./ai-semantic-model.md#410-response)).

When Capability `streaming` is negotiated, Delivery emits a **Stream** of **Events** ([AIS-01 §4.11–4.12](./ai-semantic-model.md#411-event)); a final aggregated Response **may** still be derived for audit — it is not required for streaming Turns.

### 4.1 Required parts

| Part | Meaning |
| --- | --- |
| **Contract identity** | `contractId`, `contractVersion` |
| **Conversation** | `conversationId` |
| **AI Session** | `sessionId` |
| **Turn** | `turnId` |
| **Completion outcome** | That a Completion for this Turn ended; includes **finish reason** ([AIS-01 §5](./ai-semantic-model.md#5-related-terms-defined-for-boundary-clarity)) |
| **Turn status** | Terminal Turn status aligned with AIS-01 (`completed` \| `cancelled` \| `failed` \| `timed_out`) |
| **Result discriminant** | Exactly one of: **success payload** \| **Error** (§7) |

### 4.2 Required on success

| Part | Meaning |
| --- | --- |
| **Assistant Message(s)** | One or more immutable Messages with role `assistant` and/or `tool` produced by this Completion |
| **Finish reason** | `completed` \| `cancelled` \| `timeout` \| `error` \| `length` \| `filtered` (platform enum — not vendor) |

### 4.3 Optional parts

| Part | Meaning |
| --- | --- |
| **Tool results** | Messages (role `tool`) or structured Tool outcomes belonging to this Turn ([AIS-01 §4.8](./ai-semantic-model.md#48-tool)) |
| **Usage** | Opaque counters for accounting (e.g. input/output work units) — **no vendor field names required** |
| **Capabilities applied** | Subset of negotiated Capabilities actually used |
| **Warnings** | Non-fatal platform warnings |
| **Metadata** | Non-semantic annotations |
| **Memory hint** | Optional derived Memory delta suggestion for AI Runtime (Runtime remains Memory authority) |

### 4.4 Extensible parts

| Extension | Rule |
| --- | --- |
| Additional finish reasons | Minor if mapped to existing Turn status; Major if new Turn status semantics |
| Extra Metadata | Minor if ignorable |
| Structured assistant parts | Minor if ignorable by older Runtime |

### 4.5 Streaming relationship

| Mode | Delivery returns |
| --- | --- |
| Non-stream | One Response |
| Stream | Ordered Events for this Turn, ending in a **terminal Event**; optional derived Response |

---

## 5. Event Model

Events are AIS-01 **Events** inside at most one **Stream** per Turn.  
Names below are **Event types** (catalog), not new domain entities.

### 5.1 Lifecycle & observability Events (meaning only)

| Event type | Meaning |
| --- | --- |
| `ConversationOpened` | Conversation aggregate became active under this AI Session. |
| `TurnStarted` | Turn opened; initiating Message committed. |
| `ContextBuilt` | Context for this Turn is ready (observability; Context remains AIS-01 Context). |
| `CompletionStarted` | Completion for this Turn began. |
| `ContentDelta` | Partial assistant content for the in-progress Message (streaming). |
| `ToolRequested` | Assistant requested a Tool invocation (structured; not vendor tool wire). |
| `ToolCompleted` | Tool result available for this Turn. |
| `CompletionFinished` | Completion reached a terminal finish reason. |
| `TurnFinished` | Turn reached terminal status. |
| `ConversationUpdated` | Conversation-level non-semantic or Memory-related update signal (no DecisionState write). |
| `ConversationFailed` | Conversation-level failure (distinct from single Turn failure when aggregate cannot continue). |
| `Error` | Typed Error (§7) associated with this Turn/Conversation. |
| `Cancelled` | Turn Cancellation honored. |

### 5.2 Ordering rules

1. For a given Turn Stream: `TurnStarted` → `CompletionStarted` → (`ContentDelta` \| `ToolRequested` \| `ToolCompleted`)* → (`CompletionFinished` \| `Error` \| `Cancelled`) → `TurnFinished`.
2. `ContextBuilt` if emitted occurs before `CompletionStarted`.
3. One Stream identity per Turn; no multiplexing Turns ([AIS-01 §4.12](./ai-semantic-model.md#412-stream)).

### 5.3 Non-events

- HTTP SSE frames  
- Vendor “chunk” objects  
- Gateway health pings as Conversation Events  

---

## 6. Capability Negotiation

Capabilities are AIS-01 **Capability** names — platform-level, never vendor brands ([AIS-01 §4.6](./ai-semantic-model.md#46-capability)).

```text
AI Runtime
    │  requiredCapabilities
    │  preferredCapabilities
    ▼
AI Delivery
    │  supportedCapabilities (for this binding)
    ▼
negotiatedCapabilities = supported ∩ (required ∪ preferred)
    │
    ├─ if required ⊈ supported → Error class configuration / contract
    └─ else proceed with negotiated set
```

### 6.1 Baseline catalog (platform names)

| Capability | Meaning |
| --- | --- |
| `complete` | Non-streaming Completion → Response (baseline expectation for a configured Delivery) |
| `streaming` | Stream of Events for a Turn |
| `tools` | ToolRequested / ToolCompleted path |
| `attachments` | Attachment refs on Messages |
| `multimodal_input` | Non-text input parts |
| `structured_output` | Structured assistant parts beyond plain text |
| `cancellation` | Turn cancel honored |

Additional names may be added as **Minor** if optional and vendor-neutral.

### 6.2 Forbidden Capability names

Any Capability that encodes a vendor or model SKU (e.g. brand model ids) as the *platform* Capability identifier. Routing by model remains Delivery-internal configuration, invisible to Experience.

### 6.3 Negotiation timing

- At AI Session / Conversation bind (supported set).  
- Per Turn (required/preferred subset).  
- Response/Events echo **capabilities applied**.

---

## 7. Error Contract

Errors are **typed platform failures**. No HTTP status codes. No vendor error objects as Contract identity.

### 7.1 Error shape (conceptual)

| Field | Meaning |
| --- | --- |
| `errorClass` | Category below |
| `errorCode` | Stable machine code within class |
| `message` | Safe diagnostic for operators (not raw vendor dump required) |
| `userSafe` | Whether Experience may show `message` as-is |
| `turnId` / `conversationId` / `sessionId` | Correlation when known |
| `retryable` | Whether Turn retry is sensible |
| `causeClass` | Optional secondary classification |

### 7.2 Error classes

| Class | Covers | Example codes (informative) |
| --- | --- | --- |
| **configuration** | Delivery binding missing or incomplete | `not_configured`, `capability_unsatisfied` |
| **authentication** | Caller not authenticated to Delivery edge | `unauthenticated` |
| **authorization** | Authenticated but forbidden | `forbidden` |
| **delivery** | AI Delivery failed before/without valid Adapter outcome | `unavailable`, `routing_failed` |
| **timeout** | Turn budget exceeded | `timeout` |
| **adapter** | Adapter/Model-edge failure mapped upward (not vendor-named) | `adapter_unavailable`, `model_unavailable`, `filtered` |
| **contract** | ACC violation / version incompatibility | `unsupported_contract_version`, `invalid_request` |
| **tool** | Tool invocation failure | `tool_failed`, `tool_forbidden` |
| **user** | Invalid user input at Contract boundary | `empty_message`, `invalid_attachment` |
| **runtime** | AI Runtime inconsistency surfaced at boundary | `runtime_invariant` |
| **unknown** | Unclassified | `unknown` |

**Note:** Constitutional language uses **adapter**, not “provider”, for the model-edge class (ADR-020 / AIS-01).

### 7.3 Mapping rule

Adapters MAY observe vendor errors internally; they MUST map into §7 classes/codes before crossing back into ACC-01. Vendor codes must not become Experience branching keys.

---

## 8. Versioning

ACC-01 uses semver: `MAJOR.MINOR.PATCH` (header `contractVersion`).

| Bump | When |
| --- | --- |
| **Patch** | Clarifications, wording, diagrams; restore documented intent; no field/Event/Capability meaning change |
| **Minor** | Additive optional Request/Response/Event/Capability/Metadata; older peer can ignore |
| **Major** | Remove/rename required part; change CORE noun usage; change Event ordering semantics; change error class meaning; require new Capability by default; any AIS-01 semantic change reflected here without AIS-01 ADR first (**forbidden** — fix AIS-01 first) |

### 8.1 Compatibility check (Runtime ↔ Delivery)

1. Peers exchange `contractId` + `contractVersion`.  
2. Same `contractId` required (`ACC-01`).  
3. Runtime declares `minDeliveryVersion` / `maxDeliveryVersion` conceptually.  
4. Delivery declares `supportedVersions` (range).  
5. Intersection empty → Error `contract` / `unsupported_contract_version`.  
6. Minor/Patch: newer Delivery MUST accept older Runtime Requests that were valid at that Minor.  
7. Major: explicit opt-in only.

**Semantic changes** always require AIS-01 (+ ADR) **before** ACC Major.

---

## 9. Compatibility Matrix

| Boundary | Allowed | Forbidden |
| --- | --- | --- |
| **AI Runtime ↔ AI Delivery** | Exchange ACC-01 Request / Response / Events / Errors / Capabilities only | Vendor SDKs; secrets in Request; DecisionState writes; HTTP as Contract dependency |
| **AI Delivery ↔ Adapter** | Delivery may transform ACC-01 → Adapter input and Adapter output → ACC-01 (**exclusive translation locus**, ADR-020 §9) | Adapter changing AIS-01 meanings; leaking vendor types upward as Contract identity |
| **Adapter ↔ Model (vendor edge)** | Adapter may use any model-native protocol | Calling that protocol from Runtime or Experience; treating vendor thread ids as `conversationId` |

**Gateway** (if present) sits behind Delivery as an implementation strategy — it is **not** a party to ACC-01 and must not appear in Contract fields.

---

## 10. Freeze Review

| Check | Result |
| --- | --- |
| Derived from AIS-01 CORE nouns | **PASS** — Request/Response/Event catalog cite AIS-01; no new domain aggregates |
| No vendor-specific elements | **PASS** — no OpenAI/Anthropic/Gemini/Azure/Ollama fields or SKUs as Contract identity |
| No HTTP / transport | **PASS** — explicitly out of scope |
| No Gateway as Contract party | **PASS** — §9 |
| No implementation / serialization | **PASS** — conceptual parts only |
| New domain nouns introduced? | **NONE** — Event *types* and error *classes* are Contract catalog, not AIS-01 CORE entities |
| Gaps requiring AIS-01 return? | **NONE** for freeze of v1.0.0 |

### Verdict

**READY FOR FREEZE — ACC-01 v1.0.0**

---

## 11. Non-goals

- JSON / TypeScript / OpenAPI / protobuf  
- HTTP routes  
- Gateway API  
- UX copy for Experience  
- Renaming `@embed-engine/ai` packages  

---

## 12. Change control

- Patch/Minor: documentation ADR or ACC amendment under governance.  
- Major: ADR amending ACC-01; if semantics shift, **AIS-01 first**.  
- Adapters and Delivery implementations must declare the ACC version they honor.
