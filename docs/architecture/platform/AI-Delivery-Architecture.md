# AI Delivery Architecture

**Status:** Accepted (Architecture SSOT — ARCH-AI-01)  
**Version:** 0.1  
**Date:** 2026-07-25  
**ID:** AID-01  
**Layer:** Platform Architecture · AI Delivery  
**SSOT for:** AI layer boundaries, Conversation Contract *shape*, Adapter Contract *shape*, AI Delivery responsibilities, Gateway role (optional), deployment matrix, security model, future-compatibility rules  
**Not SSOT for:** Domain noun definitions (see **AIS-01**), concrete HTTP APIs, vendor SDKs, Gateway implementation, OpenAI/Anthropic/Gemini specifics, Runtime Kernel algorithms, Experience UI design, Release Snapshot tooling

**Depends on:**

- [ADR-001 — Runtime Architecture](../adr/ADR-001-runtime-architecture.md)
- [ADR-019 — Runtime vs Release](../adr/ADR-019-runtime-vs-release.md)
- [EDL-01 — Experience Delivery Layer](./Experience-Delivery-Layer.md)
- [PT-006 — AI Explains, Never Decides](../pt/PT-006-ai-explains-never-decides.md)
- [ADR-020 — AI Delivery Architecture](../adr/ADR-020-ai-delivery-architecture.md)
- [AIS-01 — AI Semantic Model](../ai/ai-semantic-model.md) — **vocabulary SSOT** for Conversation, Turn, Message, …

**Principle:** Experience **asks**. AI Runtime **orchestrates conversation**. AI Delivery **delivers model capability**. Adapters **map**. Models **generate**. Runtime **means**. Secrets **never** live in public Embed.

**Constitutional translation rule (ADR-020):**  
**AI Delivery is the only platform layer allowed to translate the vendor-neutral Conversation Contract into vendor-specific protocols.**

**Companion:** Domain nouns live in AIS-01. Wire freeze is CAP-AI-ACC-01. Implementation contracts follow later CAPs.

---

## 1. Purpose

Embed Engine already has:

| Layer | Role |
| --- | --- |
| **Runtime** | Semantic meaning (Decision Session, Interpretation) |
| **Experience** | Presentation and interaction |
| **Release** | Immutable published snapshot of Runtime + Experience |

AI today is wired as a browser-side provider bootstrap. That works for Local Development with private env files. It **cannot** be the production model for Published Embed without either leaking secrets or disabling AI.

**AID-01** introduces **AI Delivery** as a first-class platform layer — at the same architectural altitude as Runtime, Experience, and Release — so AI remains a platform capability independent of any vendor.

---

## 2. Layer terminology (AID-01)

Layer and deployment nouns below remain defined here.  
**Dialogue-domain nouns** (Conversation, Turn, Message, Context, Memory, Capability, Attachment, Tool, Completion, Response, Event, Stream) are defined only in [AIS-01](../ai/ai-semantic-model.md). Do not redefine them in ACC or Adapters.

Each layer term has: responsibility · inputs · outputs · must not.

### 2.1 AI Runtime

| | |
| --- | --- |
| **Responsibility** | Own the **conversation lifecycle** inside the platform: session binding, turn orchestration, memory updates, prompt assembly from platform context, capability negotiation, error mapping to Conversation Contract errors. |
| **Inputs** | Conversation requests from Experience; Decision/Object/Experience context from Runtime; capability declarations from AI Delivery. |
| **Outputs** | Conversation responses (and streams) to Experience; telemetry events; updated Conversation/Memory state. |
| **Must not** | Call a vendor SDK; hold model API secrets; own UI; invent Decision meaning; hardcode a provider name. |

AI Runtime is the AI analogue of Cognitive Runtime orchestration — **conversation authority**, not model transport.

### 2.2 AI Contract (Conversation Contract)

| | |
| --- | --- |
| **Responsibility** | Define the **vendor-neutral language** between Experience / AI Runtime and AI Delivery (requests, responses, errors, metadata, streaming, cancellation). |
| **Inputs** | Normative field definitions and versioning rules (this SSOT + future ACC revisions). |
| **Outputs** | Stable shapes that Adapters and Delivery must honor. |
| **Must not** | Mention OpenAI, Anthropic, Gemini, Azure, Ollama, or any vendor payload field; encode HTTP paths; encode SDK types. |

### 2.3 AI Delivery

| | |
| --- | --- |
| **Responsibility** | Deliver model capability to AI Runtime: resolve Adapter, apply routing/fallback policy, enforce timeouts/retries at the delivery boundary, attach tenant/auth context for the selected delivery mode. |
| **Inputs** | Conversation Contract requests; deployment binding (which Adapter / endpoint mode); capability requirements. |
| **Outputs** | Conversation Contract responses/streams; delivery-level errors; delivery telemetry. |
| **Must not** | Own Experience chrome; own Decision semantics; bake secrets into public Release Snapshots; force a Gateway to exist. |

### 2.4 AI Adapter

| | |
| --- | --- |
| **Responsibility** | Translate Conversation Contract ↔ a concrete Model endpoint or Gateway protocol. One Adapter per integration style (vendor API, local runtime, partner gateway, mock). |
| **Inputs** | Contract request + Adapter configuration (non-secret public config + secret refs resolved only in safe environments). |
| **Outputs** | Contract response/stream; Adapter-normalized errors. |
| **Must not** | Be imported by Experience; change Conversation Contract; store product UI strings; become the only way AI Delivery can work. |

### 2.5 AI Provider

| | |
| --- | --- |
| **Responsibility** | **Historical / implementation term** for a concrete Model vendor connector. In AID-01, prefer **AI Adapter**. “Provider” may remain in package names until renamed by a later CAP. |
| **Inputs / Outputs** | Same class of concern as Adapter. |
| **Must not** | Be treated as a constitutional layer name going forward; Experience must not depend on “Provider” identity. |

### 2.6 AI Gateway

| | |
| --- | --- |
| **Responsibility** | **Optional** hosted service that accepts Conversation Contract (or a Delivery wire profile), holds secrets, applies auth/rate limits, and forwards to one or more Adapters/Models. |
| **Inputs** | Authenticated delivery requests from AI Delivery client; policy config. |
| **Outputs** | Contract responses; gateway policy errors. |
| **Must not** | Be required by the constitution; own Runtime meaning; be the only Adapter path; appear inside public Embed as a secret store. |

Gateway is an **implementation of AI Delivery in a hosted environment**, not a platform layer.

### 2.7 AI Model

| | |
| --- | --- |
| **Responsibility** | Generate tokens / structured outputs given model-native prompts or tool calls. |
| **Inputs** | Model-native request produced by an Adapter. |
| **Outputs** | Model-native completion / stream. |
| **Must not** | Be referenced by Experience by vendor id as a hard dependency; own Conversation IDs; own platform Memory. |

### 2.8 Conversation

| | |
| --- | --- |
| **Responsibility** | Ordered dialogue artifact: messages, roles, and conversation-scoped metadata across turns. |
| **Inputs** | User/system/assistant turns; conversation id. |
| **Outputs** | Conversation history views for Memory/Prompt; export/audit snapshots. |
| **Must not** | Equal Decision Session; replace DecisionState; leak secrets. |

### 2.9 Prompt

| | |
| --- | --- |
| **Responsibility** | Assembled instruction + context package sent toward a Model through the Contract (content parts, not vendor chat schema). |
| **Inputs** | Memory, Object/Experience context, user turn, capability constraints. |
| **Outputs** | Prompt package referenced by a Conversation Request. |
| **Must not** | Embed API keys; encode vendor-only message formats at Contract level. |

### 2.10 Context

| | |
| --- | --- |
| **Responsibility** | Platform facts supplied to AI for a turn: Object identity, Experience surface, Decision/Interpretation snapshots allowed by policy, locale, tenant. |
| **Inputs** | Runtime projections + Experience binding. |
| **Outputs** | Structured context block on Conversation Request. |
| **Must not** | Become a second Runtime; invent meaning Experience already gets from Runtime. |

### 2.11 Memory

| | |
| --- | --- |
| **Responsibility** | Conversation-local (and optionally session-local) retained understanding used to build subsequent Prompts. |
| **Inputs** | Prior turns, analyzer outputs, resolved facts. |
| **Outputs** | Memory snapshot for Prompt building / telemetry. |
| **Must not** | Persist secrets; silently mutate DecisionState; survive beyond declared retention policy without consent/rules. |

### 2.12 Session

| | |
| --- | --- |
| **Responsibility** | Bind Conversation(s) to an Experience visit / Decision Session envelope without merging AI Session into Decision Session identity. |
| **Inputs** | Session ID from Experience Delivery / Runtime bootstrap; tenant/object binding. |
| **Outputs** | Stable session correlation for Conversation and telemetry. |
| **Must not** | Replace RI-002 Decision Session; imply that ending AI Session ends Decision Session unless Experience says so. |

### 2.13 Capabilities

| | |
| --- | --- |
| **Responsibility** | Declare what AI Delivery can do for this binding: streaming, tools, multimodal, max tokens, models available, languages, etc. |
| **Inputs** | Deployment config + Adapter probes. |
| **Outputs** | Capability set negotiated before or during Conversation. |
| **Must not** | Leak vendor brand into Experience UX as a hard requirement; force Experience to branch on vendor names. |

---

## 3. Layer Architecture

### 3.1 Canonical stack

```text
┌──────────────────────────────────────────────┐
│                 Experience                    │  asks / displays
└──────────────────────┬───────────────────────┘
                       │ Conversation Contract
┌──────────────────────▼───────────────────────┐
│                 AI Runtime                    │  orchestrates turns
└──────────────────────┬───────────────────────┘
                       │ Conversation Contract
┌──────────────────────▼───────────────────────┐
│                AI Delivery                    │  routes / binds / policies
└──────────────────────┬───────────────────────┘
                       │ Adapter Contract
┌──────────────────────▼───────────────────────┐
│                 AI Adapter                    │  vendor / gateway / mock map
└──────────────────────┬───────────────────────┘
                       │ model-native protocol
┌──────────────────────▼───────────────────────┐
│                  AI Model                     │  generates
└──────────────────────────────────────────────┘

Cross-cutting (not layers):
  Decision Runtime  → supplies Context (meaning)
  Experience Delivery → supplies Session/Object binding
  Release Snapshot  → never contains model secrets
```

### 3.2 Relationship to existing platform layers

| Platform layer | Relationship to AI |
| --- | --- |
| **Decision Runtime** | Source of semantic Context; AI explains, never decides (PT-006). |
| **Experience** | Sole consumer of Conversation Contract at the UI boundary. |
| **Experience Delivery** | Provides mount/session envelope; does not own AI transport. |
| **Release** | Ships AI Runtime + Delivery **client** code without secrets. |
| **AI Delivery** | New layer: how conversation reaches a Model safely. |

### 3.3 Invariants

1. Experience never selects a Model vendor.
2. Decision Runtime never performs model HTTP.
3. AI Contract never names a vendor.
4. Adapter swap requires zero Experience change.
5. Gateway is optional behind AI Delivery / Adapter.
6. Public Release Snapshot never embeds model credentials.

---

## 4. Conversation Contract (platform)

Vendor-neutral. Versioned as `conversationContractVersion` (semver policy to follow ECG-style governance in a later CAP).

### 4.1 Request (minimum)

| Field | Purpose |
| --- | --- |
| `conversationId` | Stable dialogue id |
| `sessionId` | Visit / envelope correlation |
| `tenantId` | Tenant / partner identity (opaque) |
| `objectId` | Bound object (e.g. house package id) |
| `experienceId` | Experience surface / product mode |
| `message` | Current user (or system) turn content parts |
| `context` | Structured platform Context (Decision projections allowed by policy) |
| `capabilitiesRequested` | Optional capability hints (stream, tools, …) |
| `metadata` | Non-semantic bag (locale, UI surface, client build marker) |
| `attachments` | Optional multimodal refs (uri/mime/size), not vendor files API |
| `cancellationToken` | Logical cancel handle |
| `timeoutMs` | Client-declared budget |
| `retryPolicy` | Optional idempotent retry hints (max, backoff class) |

### 4.2 Response (minimum)

| Field | Purpose |
| --- | --- |
| `conversationId` / `sessionId` | Echo correlation |
| `message` | Assistant content parts |
| `finishReason` | `completed` \| `cancelled` \| `timeout` \| `error` \| `length` \| `filtered` |
| `usage` | Optional token/cost **opaque counters** (no vendor field names required) |
| `capabilitiesApplied` | What Delivery actually used |
| `metadata` | Delivery/runtime non-semantic annotations |
| `warnings` | Non-fatal issues |

### 4.3 Streaming

- Contract supports **event stream** of typed events: `delta`, `message_end`, `error`, `cancelled`.
- Non-streaming is a single `Response`.
- Experience may ignore streaming if Capabilities say unsupported.

### 4.4 Attachments

- Referenced by opaque ids / URLs resolved by Delivery policy.
- Contract describes mime, size class, and role — not vendor upload APIs.

### 4.5 Cancellation · Retry · Timeout

| Concern | Contract rule |
| --- | --- |
| **Cancellation** | Client may signal cancel; Delivery/Adapter SHOULD stop work; Response `finishReason=cancelled`. |
| **Retry** | Only safe for idempotent turns as declared; Delivery owns retry against Adapter failures of retryable class. |
| **Timeout** | Honors `timeoutMs` or Delivery default; maps to typed error / finishReason. |

### 4.6 Error Model (typed, vendor-neutral)

| Code | Meaning |
| --- | --- |
| `not_configured` | No Delivery binding / credentials available in this deployment |
| `unauthorized` | Auth between Runtime↔Delivery or Delivery↔Gateway failed |
| `forbidden` | Policy denied |
| `timeout` | Budget exceeded |
| `cancelled` | Caller cancelled |
| `unavailable` | Delivery/Adapter/Model temporarily down |
| `invalid_request` | Contract violation |
| `filtered` | Safety / policy filter |
| `unsupported_capability` | Requested capability not offered |
| `internal` | Unexpected delivery failure |

Experience renders **user-facing** copy from these codes (or Delivery-provided safe `userMessage`). Raw vendor errors stay behind Adapter.

### 4.7 Telemetry

Minimum correlation: `tenantId`, `sessionId`, `conversationId`, `objectId`, `experienceId`, latency, error code, capability flags, **never** raw secrets or full prompts unless policy explicitly allows audit sinks.

### 4.8 Explicit non-goals of the Contract

No `openai.*` fields, no `Bearer sk-`, no vendor model id required at Experience layer (model id may appear only inside Delivery routing config).

---

## 5. Adapter Contract

### 5.1 Purpose

Allow AI Delivery to bind any of:

- OpenAI · Anthropic · Gemini · Azure OpenAI · Ollama · local LLM  
- Partner Gateway · Conis Gateway  
- Mock Adapter  

**without Experience or Decision Runtime changes.**

### 5.2 Adapter interface (conceptual)

| Operation | Responsibility |
| --- | --- |
| `getCapabilities()` | Report Capabilities for this binding |
| `complete(request)` | Non-stream Conversation Request → Response |
| `stream(request)` | Request → event stream (if supported) |
| `cancel(handle)` | Best-effort cancel |
| `health()` | Optional readiness |

### 5.3 Adapter rules

1. **Inbound/outbound** must be Conversation Contract only at the Delivery boundary.
2. Vendor SDKs exist **only inside** Adapter packages.
3. Secret material is injected via **secure configuration**, never via Experience props.
4. Mock Adapter is first-class for Local tests and CI.
5. Gateway Adapter treats a hosted Gateway as the “Model edge” — still no vendor leak upward.

### 5.4 Routing (Delivery-owned)

AI Delivery may select Adapters by policy: primary, fallback, A/B, tenant allowlist, capability match — invisible to Experience.

---

## 6. AI Delivery Architecture

### 6.1 What AI Delivery owns

| Concern | AI Delivery |
| --- | --- |
| Binding Experience visit → Adapter | Yes |
| Capability negotiation | Yes |
| Timeout / retry / cancel policy | Yes |
| Optional Gateway client profile | Yes |
| Model routing / fallback | Yes |
| Secret resolution **in safe environments** | Yes (never in public snapshot) |
| User-visible Experience layout | No |
| Decision meaning | No |

### 6.2 Delivery modes (conceptual)

| Mode | Description |
| --- | --- |
| **Direct Adapter (trusted runtime)** | Server / controlled Node / Enterprise agent hosts Adapter + secrets. |
| **Gateway-mediated** | Browser AI Delivery client talks to Gateway; Gateway holds secrets + Adapters. |
| **Dev-injected Adapter** | Local/Demo only: developer machine supplies secrets via private env — **not** a Release path. |
| **Disabled / Not configured** | Valid mode: Contract error `not_configured` (today’s Published Embed symptom, properly typed). |

### 6.3 Gateway role definition

| | |
| --- | --- |
| **When it exists** | Browser or untrusted host must use Models; secrets cannot live in the client; central policy/rate limit required; multi-tenant partner hosting. |
| **When it need not exist** | Local Dev with private env; Demo on trusted machine; Enterprise in-process Adapter beside a trusted backend Runtime; offline Mock. |
| **Responsibility** | Authenticate callers; hold secrets; invoke Adapters; enforce quotas; emit telemetry; return Conversation Contract. |
| **Must never** | Be declared a constitutional platform layer; own Decision Runtime; require Experience to know Gateway vendor; store keys in Embed IIFE; become the only legal Adapter. |

**Constitutional statement:** Gateway is an **optional AI Delivery implementation strategy**, not a platform noun alongside Runtime / Experience / Release / AI Delivery.

---

## 7. Deployment Matrix

| Environment | Runtime location | AI Delivery location | Credentials owner | Model owner | Transport owner | Gateway |
| --- | --- | --- | --- | --- | --- | --- |
| **Local Development** | Dev machine (Vite host) | Dev process / Dev-injected Adapter | Developer (private env) | Chosen by developer | Local Adapter → Model or Mock | Optional |
| **Demo** | Dev/staging host | Same as Local or staging Delivery | Team secret store (not in git) | Team | Staging Adapter | Optional |
| **Published Embed** | Partner browser (Release Snapshot) | **Browser Delivery client + remote Delivery edge** | **Platform/Partner server** — never snapshot | Platform/Partner | TLS to Gateway or Delivery API | **Typical** |
| **Partner Hosted** | Partner site + Embed | Partner-chosen Delivery binding | Partner | Partner or Platform | Partner network policy | Partner or Platform |
| **Enterprise** | Enterprise VPC / app | Enterprise Delivery / Adapter farm | Enterprise KMS/secret store | Enterprise or contracted | Enterprise network | Optional (often internal) |

### 7.1 Published Embed rule (normative)

Published Embed **MAY** ship AI Runtime + AI Delivery **client**.  
Published Embed **MUST NOT** ship model API secrets.  
If no Delivery edge is configured → Conversation Contract `not_configured` (expected, typed, not a Runtime defect).

---

## 8. Security Model

### 8.1 Where secrets may exist

- Developer private env (Local only)
- CI secret stores (non-public)
- Gateway / server-side AI Delivery
- Enterprise KMS / secret managers
- Partner backend vaults

### 8.2 Where secrets must never exist

- `docs/embed/**` Release Snapshot
- Public GitHub Pages artifacts
- Experience source defaults
- Decision Runtime packages
- Telemetry payloads by default
- Partner-facing snippet HTML

### 8.3 Authentication (conceptual chain)

```text
Experience  --(session binding)-->  AI Runtime
AI Runtime  --(Conversation Contract + auth material)-->  AI Delivery client
AI Delivery client  --(tenant/session token / mTLS / signed request)-->  Gateway or trusted Adapter host
Gateway/Adapter host  --(model credential)-->  AI Model
```

| Hop | Auth idea |
| --- | --- |
| Runtime → Delivery | Session/object binding already established by Experience Delivery; no model key |
| Delivery → Gateway | Short-lived tenant/partner token, origin allowlist, signed requests |
| Gateway → Adapter/Model | Server-side secret / workload identity |

**Never required:** putting a model API key into public Embed.

---

## 9. Future Compatibility Strategy

| Capability | How AID-01 absorbs it without Experience change |
| --- | --- |
| Multi-model | Delivery routing + Capabilities |
| Fallback | Delivery policy across Adapters |
| Model routing | Delivery config / tenant policy |
| Streaming | Contract stream events; Experience opts in via Capabilities |
| Multimodality | Attachment parts + Capabilities |
| MCP / tools | Capability `tools`; Adapter maps tool protocol; Experience uses Contract tool events, not vendor MCP SDKs |
| Enterprise deployment | Direct Adapter mode in VPC |
| Partner deployment | Partner Gateway Adapter or Partner-hosted Delivery |

**Rule:** new Models = new/extended Adapters + Delivery config.  
**Forbidden:** Experience `if (vendor === …)` branches.

---

## 10. Mapping today’s observed gap (informative)

| Today | AID-01 reading |
| --- | --- |
| Local Vite `.env.local` key | Dev-injected Adapter mode |
| Published empty `VITE_OPENAI_API_KEY` | Correct Release security; Delivery mode = not configured or must use Gateway |
| UX “chybí API klíč” | Should become Contract `not_configured` (wording is Experience concern) |
| Same Runtime Local vs Pages | Confirmed — not a Runtime SSOT failure |

---

## 11. Non-goals

- Choosing OpenAI vs any vendor
- Defining REST paths or JSON schemas for a specific Gateway
- Implementing packages in this CAP
- Changing Experience UX copy in this CAP
- Amending Release Workflow mechanics beyond the security invariant already accepted

---

## 12. Governance

- **AID-01** is the architecture SSOT for AI Delivery.
- Breaking changes to Conversation Contract or layer responsibilities require a new ADR.
- Vendor Adapter packages are implementation artifacts under AID-01, not SSOTs.
- Aligns with PT-006: AI explains; Runtime decides meaning.
