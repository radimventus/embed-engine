# AI Semantic Model

**Status:** Accepted (Vocabulary SSOT — CAP-AI-SEM-01)  
**Version:** 0.1  
**Date:** 2026-07-25  
**ID:** AIS-01  
**Layer:** Domain / AI  
**SSOT for:** Canonical meaning of AI-domain concepts (Conversation, Turn, Message, Context, Memory, Capability, Attachment, Tool, Completion, Response, Event, Stream, and related identity rules)  
**Not SSOT for:** Wire JSON schemas, HTTP, vendor protocols, Adapter code, Experience UI, Decision Runtime algorithms, AI Delivery deployment modes, Conversation Contract field catalogs ([ACC-01](./conversation-contract.md))

**Depends on:**

- [AID-01 — AI Delivery Architecture](../platform/AI-Delivery-Architecture.md)
- [ADR-020 — AI Delivery Architecture](../adr/ADR-020-ai-delivery-architecture.md)
- [ADR-021 — AI Semantic Model](../adr/ADR-021-ai-semantic-model.md)
- [PT-006 — AI Explains, Never Decides](../pt/PT-006-ai-explains-never-decides.md)
- [RI-002 — Decision Session](../../04-reference-implementation/RI-002-Decision-Session.md)

**Principle:** **Semantics → Contract → Implementation.**  
AIS-01 freezes *what things mean*. [ACC-01](./conversation-contract.md) freezes *how they are exchanged*. Later CAPs implement.

**Index:** [README.md](./README.md) — other documents must **link here**, not redefine these terms.  
**Contract:** [conversation-contract.md](./conversation-contract.md) (ACC-01) · [ADR-022](../adr/ADR-022-conversation-contract.md)

---

## 1. Purpose

AID-01 defined layers (AI Runtime, AI Delivery, Adapter, Model).  
This document defines the **domain language** those layers speak about.

Without AIS-01, Conversation Contract freezes risk locking ambiguous nouns (“Memory”, “Context”, “Response”) that later need semantic surgery.

This is the same discipline as Decision Layer vocabulary before Decision contracts and Runtime implementation.

---

## 2. Ontological position

| Domain | Owns meaning of… |
| --- | --- |
| **Decision Runtime** | Decision Session, DecisionState, Interpretation, Decision Story/Move |
| **Experience** | Surfaces, presentation, interaction chrome |
| **AI domain (this SSOT)** | Conversation, Turn, Message, AI Context projection, Memory, Capability, Attachment, Tool, Completion, Response, Event, Stream |
| **AI Delivery (AID-01)** | How Conversation concepts reach Models; **only** layer that may translate vendor-neutral Contract ↔ vendor protocols |

**PT-006:** AI explains; it never authors canonical Decision meaning.  
AI Context is a **projection/consumption** of Runtime meaning, not a second Runtime.

---

## 3. Identity & cardinality (normative)

```text
Tenant
  └── AI Session*          (visit / envelope correlation; ≠ Decision Session)
        └── Conversation+  (one or more dialogues per AI Session)
              └── Turn+    (ordered; each Turn has exactly one initiating Message
                            from a participant role, then zero+ follow-up Messages
                            in that Turn’s completion phase)
```

| Rule | Statement |
| --- | --- |
| **R1** | `ConversationId` is unique within a Tenant (globally unique ids recommended). |
| **R2** | `TurnId` is unique within a Conversation. |
| **R3** | `MessageId` is unique within a Conversation. |
| **R4** | An **AI Session** correlates Conversations to an Experience visit; it is **not** RI-002 Decision Session. |
| **R5** | Ending an AI Session does not end a Decision Session unless Experience explicitly says so. |
| **R6** | A Conversation may reference at most one primary `objectId` binding at a time (rebind is a new Conversation or explicit Contract evolution — not silent mutation). |

---

## 4. Canonical definitions

Stability: **CORE** = change only via ADR.  
Other documents must link; they must not paraphrase into competing definitions.

---

### 4.1 Conversation

| | |
| --- | --- |
| **Definition** | A bounded, ordered dialogue about a bound Object / Experience context, composed of Turns and Messages, with stable `conversationId`. |
| **Responsibility** | Be the aggregate root for dialogue history used by Memory, Prompt assembly, audit, and Contract exchange. |
| **Contains** | Ordered Turns; conversation-level metadata; capability snapshot at start (optional refresh). |
| **Does not** | Equal Decision Session; own DecisionState; persist model secrets; imply a vendor thread id. |
| **Inputs** | Session binding, object/experience binding, initial Capabilities. |
| **Outputs** | History for Memory/Prompt; exportable audit view. |

---

### 4.2 Turn

| | |
| --- | --- |
| **Definition** | One atomic unit of conversational progress: typically one user (or system) initiation plus the assistant’s completion of that initiation (including streamed partials that belong to the same Turn). |
| **Responsibility** | Bound a single request→completion cycle for orchestration, timeout, cancel, retry, and telemetry. |
| **Contains** | Initiating Message; zero or more assistant Messages / Events belonging to that completion; Turn status. |
| **Does not** | Span multiple user questions as one Turn unless Experience explicitly batches them; equal an HTTP request; equal a vendor “choice”. |
| **Status** | `open` \| `completing` \| `completed` \| `cancelled` \| `failed` \| `timed_out`. |

**Rule:** Cancellation, timeout, and retry policy apply at **Turn** granularity by default.

---

### 4.3 Message

| | |
| --- | --- |
| **Definition** | An immutable communicative unit with a role, content parts, and `messageId`. |
| **Responsibility** | Carry what was said (or shown) by a participant without encoding vendor chat schemas. |
| **Roles (CORE)** | `user` \| `assistant` \| `system` \| `tool` |
| **Content** | Ordered **parts**: text, structured data, attachment refs, tool-call / tool-result refs — vendor-neutral. |
| **Does not** | Mutate after commit; embed API keys; require OpenAI `role` string compatibility beyond conceptual mapping inside Adapter. |

---

### 4.4 Context

| | |
| --- | --- |
| **Definition** | The **platform facts** attached to a Turn so AI can explain within policy: Object binding, Experience surface, allowed Decision/Interpretation projections, locale, tenant, and other non-dialogue facts. |
| **Responsibility** | Supply meaning **from** Decision Runtime / Experience binding **into** AI Prompt assembly — as a projection, not as authority. |
| **Inputs** | Runtime projections permitted by policy; Experience binding; tenant/object ids. |
| **Outputs** | Structured Context block on a Turn / Contract request. |
| **Does not** | Become DecisionState; invent Object meaning; replace Memory; include secrets; be confused with “model context window” (that is an Adapter/Model resource limit, not this noun). |

**Disambiguation:** Platform **Context** (AIS-01) ≠ Model **context window** (implementation capacity).

---

### 4.5 Memory

| | |
| --- | --- |
| **Definition** | Conversation-scoped (and optionally AI-Session-scoped) retained understanding derived from prior Turns, used to assemble subsequent Prompts. |
| **Responsibility** | Improve continuity of explanation without writing DecisionState. |
| **Inputs** | Prior Messages/Turns; optional analyzer outputs; resolved facts. |
| **Outputs** | Memory snapshot for Prompt building and telemetry. |
| **Does not** | Author canonical Decision meaning; silently mutate Interpretation; outlive declared retention; store secrets; equal full Message log (Memory may be derived/compressed). |

**Kinds (informative, not separate CORE nouns yet):** working memory (current Conversation), session memory (AI Session), durable memory (future — requires ADR).

---

### 4.6 Capability

| | |
| --- | --- |
| **Definition** | A named ability of the current AI Delivery binding: what Conversations may request and what Delivery can honor. |
| **Responsibility** | Negotiate features without exposing vendor brand as Experience branching. |
| **Examples (names are platform-level)** | `streaming`, `tools`, `attachments`, `multimodal_input`, `structured_output`, `cancellation`, language/locale classes, max output class. |
| **Does not** | Encode `gpt-4o` as a Capability name Experience depends on; force Experience `if (vendor)`; replace auth/policy. |

**Capability set** is attached to an AI Session / Conversation binding; Turn may request a subset.

---

### 4.7 Attachment

| | |
| --- | --- |
| **Definition** | A referenced non-text payload associated with a Message or Turn (image, document, audio, etc.), described by opaque id, mime class, size class, and role. |
| **Responsibility** | Allow multimodal Conversations without embedding vendor file APIs in the domain. |
| **Does not** | Require a specific cloud storage vendor; carry raw credentials; be the same as Tool. |

Resolution of bytes/URLs is an AI Delivery / Adapter concern under policy.

---

### 4.8 Tool

| | |
| --- | --- |
| **Definition** | A declared, invocable capability available during a Turn whereby the assistant may request structured actions and receive structured results (as Messages of role `tool` or equivalent Events). |
| **Responsibility** | Extend explanation with controlled actions (lookup, cite package fact, etc.) without giving the Model Decision authority. |
| **Does not** | Equal MCP as a platform noun (MCP is an Adapter/protocol option); write DecisionState unless a separate Runtime Signal path is explicitly designed; bypass PT-006. |

Tool *definitions* live in Delivery/Adapter configuration; Tool *calls/results* appear in Conversation as Messages/Events.

---

### 4.9 Completion

| | |
| --- | --- |
| **Definition** | The Model’s generative work for a Turn: the process and result of producing assistant content (and optional tool calls) for that Turn’s initiation. |
| **Responsibility** | Name the generative act behind a Turn’s assistant outcome — independent of streaming vs non-streaming transport. |
| **Does not** | Equal HTTP 200; equal an entire Conversation; equal Memory update (Memory update is a consequence handled by AI Runtime). |

A Completion may be delivered as one Response or as a Stream of Events ending in a terminal Event.

---

### 4.10 Response

| | |
| --- | --- |
| **Definition** | The **non-streaming** Conversation Contract envelope returning the outcome of a Turn’s Completion (messages, finish reason, usage counters, metadata, errors). |
| **Responsibility** | Be the synchronous Contract unit Experience/AI Runtime can await. |
| **Does not** | Mean a vendor chat.completion object; replace Stream when streaming is used (streaming uses Events; a final aggregated Response may still be derived). |

---

### 4.11 Event

| | |
| --- | --- |
| **Definition** | A typed, ordered notification in a Stream belonging to a Turn (e.g. content delta, tool call, message end, error, cancelled). |
| **Responsibility** | Carry partial or terminal updates without requiring Experience to understand vendor SSE schemas. |
| **Does not** | Be a Message (though an Event may *introduce* or *finalize* Message content); be unordered; carry secrets. |

---

### 4.12 Stream

| | |
| --- | --- |
| **Definition** | An ordered sequence of Events for one Turn’s Completion, opened when Capability `streaming` is applied. |
| **Responsibility** | Deliver progressive Completion to Experience/AI Runtime. |
| **Does not** | Outlive its Turn; multiplex multiple Turns on one Stream identity; expose vendor stream framing upward. |

**Rule:** One active Stream per Turn max. Non-streaming Turns have zero Streams and one Response.

---

## 5. Related terms (defined for boundary clarity)

These are used by AID-01 / contracts; AIS-01 pins their semantic relation.

| Term | Relation to CORE nouns |
| --- | --- |
| **Prompt** | Assembled instruction+Context+Memory+Messages package **for** a Turn’s Completion — not itself a Message log; not vendor chat schema. Owned in assembly by AI Runtime. |
| **AI Session** | Correlation handle for Conversations within an Experience visit; ≠ Decision Session (R4–R5). |
| **AI Runtime** | Orchestrates Turns/Memory/Prompt; does not translate vendor protocols (ADR-020 principle). |
| **AI Delivery** | Only layer allowed to translate Conversation Contract ↔ vendor protocols. |
| **AI Adapter** | Performs that translation under Delivery; must not redefine AIS-01 nouns. |
| **AI Model** | Executes Completion behind Adapter. |
| **Finish reason** | Terminal classification of a Turn/Completion (`completed`, `cancelled`, `timeout`, `error`, `length`, `filtered`, …) — Contract vocabulary, not vendor enum. |

---

## 6. Lifecycle (Conversation / Turn)

```text
AI Session bound
    → Conversation opened
        → Turn opened (user/system Message committed)
            → Completion started
                → either Response
                → or Stream{Event…} → terminal Event
            → Turn closed (status terminal)
            → Memory may update
        → (more Turns…)
    → Conversation closed / archived per policy
AI Session ended (independent of Decision Session)
```

---

## 7. Rejected / disambiguated terminology

| Phrase | Verdict |
| --- | --- |
| “Chat” as architecture noun | Rejected as CORE — use **Conversation** |
| “Provider” as constitutional layer | Rejected — use **Adapter** (AID-01) |
| “Context window” = platform Context | Rejected — different concepts |
| “Thread” (vendor) = Conversation | Rejected as identity — Adapter may map externally |
| “Completion” = HTTP response | Rejected |
| “Memory” = DecisionState | Rejected |
| “AI Session” = Decision Session | Rejected |
| Gateway as semantic author | Rejected — optional Delivery strategy only |
| Experience branches on model vendor | Rejected |

---

## 8. Invariants (must hold in all implementations)

1. Experience reasons in AIS-01 nouns + Conversation Contract — never in vendor nouns.
2. Decision Runtime meaning is consumed via **Context**, not overwritten by Memory.
3. Only **AI Delivery** (via Adapters) translates Contract ↔ vendor protocols (ADR-020).
4. Adapter MUST NOT change the meaning of AIS-01 terms; it only maps representations.
5. Gateway MUST NOT invent domain semantics; it may enforce policy and hold secrets.
6. Model output enters the platform only as Messages/Events/Completion outcomes — never as DecisionState writes without an explicit Runtime Signal path.
7. Semantics (AIS-01) precede Contract freeze (ACC); Contract must cite AIS-01 definitions.

---

## 9. Relationship to Conversation Contract (ACC)

| AIS-01 concept | ACC responsibility |
| --- | --- |
| Conversation, Turn, Message, … | Field names and cardinality MUST align with AIS-01 |
| Response / Event / Stream | Wire shapes for non-stream vs stream Completions |
| Capability | Capability identifiers catalog |
| Errors | Typed codes; do not redefine nouns |

**Ordering:** AIS-01 → ACC-01 → Delivery/Adapter implementation CAPs.

---

## 10. Non-goals

- JSON Schema / protobuf
- OpenAI, Anthropic, Gemini field maps
- UX microcopy
- Package renames
- Changing AID-01 layer diagram (AIS-01 supplies nouns those layers use)

---

## 11. Change control

CORE definitions change only via ADR amending AIS-01 / ADR-021.  
Additive examples and informative notes may evolve in documentation without Contract break **until** ACC freezes identifiers.
