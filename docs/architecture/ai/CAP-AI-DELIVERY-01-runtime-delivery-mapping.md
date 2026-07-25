# CAP-AI-DELIVERY-01 — AI Runtime → AI Delivery Mapping

**Status:** Analysis complete (no behavior change)  
**Date:** 2026-07-25  
**Depends on:** [AID-01](../platform/AI-Delivery-Architecture.md) · [AIS-01](./ai-semantic-model.md) · [ACC-01](./conversation-contract.md) · [ADR-020](../adr/ADR-020-ai-delivery-architecture.md)  
**Scope:** Map `@embed-engine/ai` + Experience bootstrap to AID/AIS/ACC; propose incremental refactor **without** changing product behavior, public API, Gateway, or new Adapters beyond isolating OpenAI.

**Not in this CAP:** Code moves, Gateway, new providers, Experience UX, Release Workflow, ACC wire serialization.

---

## 0. Executive verdict

| Acceptance claim | Verdict |
| --- | --- |
| AI Runtime implements only AID-01 Runtime responsibility | **Not yet** — orchestration is correct-ish, but Runtime constructs/holds Adapter (`LLMProvider`) and uses pre-ACC shapes |
| ACC-01 is the only Runtime ↔ Delivery interface | **Not yet** — today Runtime → `LLMProvider.chat(ChatRequest)` (proto-Adapter), no Delivery layer, no ACC-01 |
| OpenAI is isolatable into Adapter without Experience change | **Yes** — already mostly confined; Experience bootstrap must stop importing `OpenAIProvider` |
| No vendor-specific logic outside Adapter | **Not yet** — `ConversationError` OpenAI string matching; Experience `embedAIService` constructs OpenAI; comments/diagnostics say “provider” |
| Refactor can be incremental without behavior change | **Yes** — roadmap below |

**Bottom line:** Architecture is sound; implementation is a **pre-AID monolith** with a good embryonic Adapter (`OpenAIProvider` / `MockProvider`) and a strong orchestrator (`AIService`). Missing pieces: **AI Delivery**, **ACC-01 boundary**, semantic naming alignment, Experience-side Adapter injection.

---

## 1. Architecture Mapping Report

### 1.1 Component → target layer

| Current component | Location | Target layer (AID-01) | Action |
| --- | --- | --- | --- |
| `embedAIService.ts` | Experience (`apps/client-studio/.../AIAdvisor`) | **Experience bootstrap** + thin call into **AI Runtime**; Adapter wiring belongs to **AI Delivery** (or Delivery factory), not Experience | **Split** — keep `getEmbedAIService()` / `sendMessage` façade; remove `OpenAIProvider` import; obtain Delivery-bound Runtime |
| `AIAdvisor.tsx` | Experience | Experience | **Retain** — already talks only to `getEmbedAIService()` |
| `AIService` | `packages/ai/src/services` | **AI Runtime** | **Retain** core; **split** later so it depends on Delivery port (ACC), not `LLMProvider` |
| `createAIService` | same | AI Runtime factory | **Retain** API for compatibility; internally wire Delivery |
| `PromptBuilder` / `PromptAssembler` / builders | `prompt/` | **AI Runtime** (Prompt assembly) | **Retain** |
| `SystemPromptFactory` | `prompt/` | AI Runtime | **Retain** |
| `DecisionMemoryService` / `MemoryResolutionEngine` | `memory/` | **AI Runtime** (Memory) | **Retain**; rename language toward AIS-01 Memory (see §4) |
| `ConversationAnalyzer` / `AnalysisService` | `analyzer/` | **AI Runtime** | **Retain** |
| `LlmAnalyzerProvider` | `analyzer/providers/` | **AI Runtime** (uses Delivery/Adapter for extraction Completions) | **Retain** logic; stop taking raw `LLMProvider` — call Delivery with ACC Request (analysis Turn) |
| `DecisionRecommendationEngine` | `recommendation/` | **AI Runtime** (deterministic; not Model) | **Retain** — not an Adapter |
| `AIDiagnostics` / `ConversationRecorder` | diagnostics/recorder | **AI Runtime** cross-cutting | **Retain** |
| `LLMProvider` | `providers/` | **Adapter Contract** (embryonic) | **Rename/move** → Adapter port; keep behavior |
| `OpenAIProvider` | `providers/` | **AI Adapter** | **Move** to `adapter/openai/` (or `adapters/openai`) |
| `MockProvider` | `providers/` | **AI Adapter** (Mock) | **Move** with OpenAI |
| `ChatRequest` / `ChatResponse` / `ChatMessage` | `models/` | Proto-**ACC** shapes (incomplete) | **Align** to ACC-01 / AIS-01 or wrap behind Delivery mapper; do not treat as final Contract |
| `ConversationError` | `services/` | ACC **Error** mapping + Experience-safe messages | **Split** — map to ACC error classes; strip OpenAI-specific regexes from Runtime |
| `PromptContext` / `PromptPackage` | models/prompt | AI Runtime Prompt artifacts | **Retain** |
| Package export of `OpenAIProvider` | `index.ts` | Public surface leak | **Deprecate** re-export from root over time; Experience must not need it |

### 1.2 What does **not** match AID-01 today

1. **No AI Delivery module** — Runtime calls Adapter directly.  
2. **Experience constructs Adapter** (`embedAIService.createEmbedProvider`).  
3. **No ACC-01** Request/Response/Event negotiation — uses `ChatRequest`/`ChatResponse`.  
4. **“Provider”** naming contradicts Adapter constitutional language.  
5. **Secrets / config** resolved in Experience (Vite env) instead of Delivery binding modes (AID-01).  
6. **Error mapping** knows OpenAI message strings inside Runtime (`ConversationError`).

---

## 2. Layer Compliance Report

### 2.1 Target separation

```text
Experience (AIAdvisor)
        │  sendMessage / display
        ▼
AI Runtime (AIService, Prompt, Memory, Analyzer, Recommendation)
        │  ACC-01 Conversation Contract   ← MISSING today
        ▼
AI Delivery                               ← MISSING today
        │  Adapter Contract
        ▼
AI Adapter (OpenAI / Mock)
        ▼
Model
```

### 2.2 Violations (architecture)

| ID | Violation | Severity | Minimal fix direction |
| --- | --- | --- | --- |
| L1 | Experience imports `OpenAIProvider` | High (AID-01 / ADR-020) | Factory in Delivery; Experience gets `AIService` only |
| L2 | `AIService` holds `LLMProvider` and calls `provider.chat` | High (skips Delivery + ACC) | Introduce Delivery port; AIService calls `delivery.complete(request)` |
| L3 | `ChatRequest` ≠ ACC-01 Conversation Request | Medium | Mapper Delivery↔legacy until ACC types land; or evolve types behind façade |
| L4 | Public package exports Adapter from root | Medium | Subpath export `@embed-engine/ai/adapter/openai` later; keep root re-export temporarily for compat |
| L5 | Analyzer takes `LLMProvider` directly | Medium | Analyzer requests Completion via same Delivery port |
| L6 | No Capability negotiation | Medium | Default negotiated `{ complete }` in Delivery skeleton |
| L7 | No Stream/Event path | Low (product non-stream today) | Stub Capability; out of scope for behavior-preserving refactor |

### 2.3 Minimal refactor (conceptual)

1. Add **Delivery** façade with one method: complete Turn (ACC-shaped or mapper from today’s ChatRequest).  
2. **Default Delivery** = “Direct Adapter” wrapping existing `LLMProvider`.  
3. Point `AIService` at Delivery.  
4. Move OpenAI/Mock under `adapter/`.  
5. Change `embedAIService` to `createAIService(createDefaultDelivery(...))` without naming OpenAI in Experience — **or** inject Delivery from a host binding module still outside Experience UI.

Behavior unchanged if Direct Adapter Delivery delegates to current `OpenAIProvider.chat`.

---

## 3. Contract Compliance Report (ACC-01)

### 3.1 Current Runtime ↔ “Delivery” path

```text
AIService.sendMessage
  → PromptBuilder.build → PromptPackage
  → promptPackageToChatRequest → ChatRequest
  → this.provider.chat(ChatRequest)     // LLMProvider = Adapter
  → ChatResponse
  → mapConversationError on failure
```

There is **no** ACC-01 envelope (`contractId`, Capabilities, Turn id, Context block as defined, Error classes).

### 3.2 Violations

| ID | Finding | ACC impact |
| --- | --- | --- |
| C1 | Runtime knows Adapter interface (`LLMProvider`) | Forbidden long-term — Runtime may know Delivery only |
| C2 | Runtime knows Adapter implementations via constructor injection of OpenAI from Experience | Forbidden — Experience must not select vendor |
| C3 | `ChatRole` lacks `tool`; finish reasons are vendor-ish (`stop`, `mock`, `content_filter`) | Align to AIS-01 / ACC finish reasons via mapping layer |
| C4 | `ChatResponse.content: string` only — no Message parts / Events | Acceptable interim; map into ACC Response assistant Message |
| C5 | `ConversationError` codes (`missing_api_key`, …) ≠ ACC error classes (`configuration` / `not_configured`) | Map 1:1 in Delivery/Runtime boundary without UX change |
| C6 | Vendor-specific data in Runtime error mapper (OpenAI regex / Czech OpenAI strings) | Must move to Adapter → ACC Error mapping |
| C7 | Delivery does not exist → cannot “bypass Contract”; Contract is simply absent | Introduce Delivery that *is* the Contract boundary |

### 3.3 Compliance target (behavior-preserving)

- Internally: AIService builds ACC Request (or legacy DTO mapped **inside Delivery**).  
- Delivery → Adapter → vendor.  
- Adapter → ACC Error/Response.  
- Experience still receives today’s `SendMessageResult` / `ConversationError.userMessage`.

---

## 4. Semantic Compliance Report (AIS-01)

### 4.1 Alignments (good)

| AIS-01 | Current | Notes |
| --- | --- | --- |
| Turn (lifecycle) | `sendMessage` turn + diagnostics traces | Conceptually a Turn; ids not always explicit |
| Message | `ChatMessage` / history | Exists; role set incomplete (`tool`) |
| Memory | `DecisionMemory` / `ResolvedMemory` | Present; naming conflates Decision |
| Context | `PromptContext` / object + decision inputs | Split across builders; not one Context block |
| Prompt | `PromptPackage` | Strong |
| Completion | implicit in `provider.chat` | Unnamed |
| Response | `ChatResponse` | Partial |
| Capability | absent | — |
| Attachment / Tool / Stream / Event | absent or unused in chat path | OK for current product surface |

### 4.2 Divergences / duplicates

| Issue | Action |
| --- | --- |
| **DecisionMemory** name suggests DecisionState ownership | **Unify language**: treat as AIS-01 Memory; rename in later step (compat aliases) |
| **Provider** vs **Adapter** | Terminology migrate; keep `LLMProvider` as deprecated alias |
| **Chat** vs **Conversation** | Keep types interim; document as ACC precursors |
| **sessionId** used as AI Session | Align docs; ensure ≠ Decision Session (already separate) |
| **AnalyzerProvider** name | Not AIS-01 CORE; keep as Runtime internal — do not elevate to Adapter layer noun |
| Finish reason `mock` / `stop` | Map to ACC `completed` etc. at Delivery boundary |

### 4.3 New domain nouns invented in code?

No new **platform CORE** nouns beyond local type names. Risk is **semantic drift** of Memory/Context/Provider, not extra aggregates. **No AIS-01 reopen required** for this CAP — naming cleanup only.

---

## 5. Adapter Extraction Plan

### 5.1 Move as-is (behavior-identical)

| Artifact | Notes |
| --- | --- |
| `OpenAIProvider.ts` + tests | Entire vendor HTTP/JSON mapping |
| `MockProvider.ts` + tests | Test/dev Adapter |
| `LLMProvider.ts` | Adapter port (rename later to `AIAdapter` / `complete`) |
| OpenAI-specific branches in `OpenAIProvider` error formatting | Stay in Adapter |

### 5.2 Must split before “clean” Adapter

| Piece | Today | Split |
| --- | --- | --- |
| `ConversationError` OpenAI regex | Runtime | Adapter maps to ACC Error; Runtime maps ACC → `ConversationError` for Experience compat |
| `embedAIService` key bootstrap | Experience | Delivery binding (dev-injected mode) |
| `readProviderMeta` diagnostics | Runtime reads Adapter id/model | Delivery returns capabilitiesApplied / opaque adapter id |

### 5.3 Must stay in AI Runtime

| Piece | Why |
| --- | --- |
| `AIService.sendMessage` orchestration | Turn lifecycle |
| Analyzer, Memory, PromptBuilder, Recommendation | Prompt/Context/Memory |
| Diagnostics / Recorder | Runtime observability |
| `ConversationError` **userMessage** catalog (Czech UX) | Experience-facing; fed by ACC codes |

### 5.4 CAP-AI-ADAPTER-01 (next implementation CAP)

**Intent:** Formalize Adapter package layout + Mock/OpenAI behind Adapter Contract; forbid Experience imports of vendor Adapters; map Adapter failures to ACC Error classes.

**In scope:** folder move, port rename (compat export), Experience bootstrap via Delivery factory, VendorNeutrality tests updated.  
**Out of scope:** new vendors, Gateway, streaming, public API break.

---

## 6. Target Package Structure

Proposed layout under `packages/ai/` (documentation only — not created in this CAP):

```text
packages/ai/src/
  semantic/          # re-exports / docs pointers to AIS-01 (optional thin)
  contract/          # ACC-01 conceptual types + mappers (when introduced)
    types.ts         # ConversationRequest/Response/Error (no HTTP)
    mapFromLegacy.ts # ChatRequest ↔ ACC (temporary)
  runtime/           # AI Runtime
    AIService.ts
    errors/          # ConversationError (Experience-facing)
    prompt/
    memory/
    analyzer/
    recommendation/
    diagnostics/
    recorder/
  delivery/          # AI Delivery
    AIDelivery.ts    # port: complete(request) / optional stream
    DirectAdapterDelivery.ts  # wraps Adapter (default today)
    negotiateCapabilities.ts
  adapter/           # AI Adapters only
    port.ts          # LLMProvider → AIAdapter alias
    openai/
      OpenAIAdapter.ts
    mock/
      MockAdapter.ts
  index.ts           # public façade — stable exports
```

**Rules:**

- `runtime/` must not import `adapter/openai`.  
- `delivery/` may import `adapter/port` + concrete adapters via factory.  
- `adapter/*` must not import Runtime prompt/memory.  
- Experience imports `@embed-engine/ai` Runtime façade only.

---

## 7. Refactoring Roadmap

Estimates use project XS/S/M/L (effort, not calendar). Each step = one commit family; reversible; tests green; **no product behavior change**.

### Step A — `refactor(ai): introduce delivery package boundaries`

| | |
| --- | --- |
| **Goal** | Create `delivery/` + `adapter/` folders; re-export paths; no logic change |
| **Scope** | Move files or add barrels; update imports inside package |
| **Risk** | Low (path churn) |
| **Estimate** | S |
| **AC** | Tests pass; public exports unchanged; Experience unchanged |

### Step B — `refactor(ai): isolate runtime from adapter`

| | |
| --- | --- |
| **Goal** | `AIService` depends on `AIDelivery` port; `DirectAdapterDelivery` delegates to current `LLMProvider` |
| **Scope** | `AIService`, factory, Analyzer LLM access via Delivery |
| **Risk** | Medium (call path) |
| **Estimate** | M |
| **AC** | Same chat answers; Mock/OpenAI tests pass; Runtime source has zero imports of `OpenAIProvider` |

### Step C — `refactor(ai): align implementation with ACC-01`

| | |
| --- | --- |
| **Goal** | Introduce ACC-shaped DTO + mappers; map errors to ACC classes then to existing `ConversationError` |
| **Scope** | `contract/`, Delivery, ConversationError mapping |
| **Risk** | Medium |
| **Estimate** | M |
| **AC** | Experience still sees same `userMessage` strings; `not_configured` ≡ missing key path; no vendor strings in Runtime mapper |

### Step D — `refactor(ai): extract OpenAI adapter`

| | |
| --- | --- |
| **Goal** | OpenAI lives only under `adapter/openai`; Experience bootstrap uses Delivery factory |
| **Scope** | `embedAIService`, package exports, VendorNeutrality tests |
| **Risk** | Medium (host wiring) |
| **Estimate** | S–M |
| **AC** | `AIAdvisor.tsx` unchanged; `embedAIService` does not import OpenAI symbol; IIFE still sterile key; Local still works with env |

### Step E — (optional follow) semantic naming pass

| | |
| --- | --- |
| **Goal** | Aliases `DecisionMemory` → Memory vocabulary without breaking exports |
| **Estimate** | S |
| **AC** | Types export both names; docs cite AIS-01 |

---

## 8. Engineering Debt (registered)

| ID | Item | Notes |
| --- | --- | --- |
| **ED-AI-01** | Missing AI Delivery layer; Runtime→Adapter direct | CAP-AI-DELIVERY-01 roadmap Steps A–B |
| **ED-AI-02** | Pre-ACC `ChatRequest`/`ChatResponse` vs ACC-01 | Step C |
| **ED-AI-03** | Experience constructs `OpenAIProvider` | Step D; blocks Published AI without architecture violation |
| **ED-AI-04** | `ConversationError` vendor string coupling | Step C |
| **ED-AI-05** | “Provider” vs Adapter terminology debt | CAP-AI-ADAPTER-01 |
| **ED-AI-06** | `DecisionMemory` naming vs AIS-01 Memory | Step E / later |
| **ED-AI-07** | No Capability negotiation / streaming Events | Future; not required for current UX |

---

## 9. Implementation plan — CAP-AI-ADAPTER-01

| | |
| --- | --- |
| **Prerequisite** | Steps A–B of this roadmap landed (Delivery port exists) |
| **Goal** | Adapter Framework: port stability, Mock + OpenAI as only Adapters, ACC Error mapping inside Adapter/Delivery, forbid Experience vendor imports (lint/test) |
| **Non-goals** | Anthropic/Gemini, Gateway, streaming productization |
| **Deliverables** | `adapter/` layout, Adapter Contract doc subsection, updated VendorNeutrality + pipeline tests, deprecated root export path |
| **AC** | Swap Mock↔OpenAI via Delivery config only; Experience/AIAdvisor untouched; ACC error classes produced at boundary |

---

## 10. Acceptance Criteria — answers

1. **AI Runtime only Runtime responsibility?** → **Not today**; orchestrator is Runtime-shaped but owns Adapter calls. Fix: Steps A–B.  
2. **ACC-01 sole Runtime↔Delivery interface?** → **Not today**. Fix: Step C (+ Delivery from B).  
3. **OpenAI isolatable without Experience change?** → **Yes** (UI already isolated; bootstrap must change in Step D without changing `AIAdvisor`).  
4. **No vendor logic outside Adapter?** → **Not today** (`ConversationError`, Experience bootstrap). Fix: C–D.  
5. **Incremental without behavior change?** → **Yes**, if each step keeps Direct Adapter semantics and maps errors to the same UX strings.

---

## 11. Recommended next action

**Step A (WP-A)** — package boundaries: **done** ([compliance](./WP-A-boundaries-compliance.md)).  
Next: **Step B** — isolate Runtime from Adapter via Delivery port.  
Do **not** open Gateway or new vendors until CAP-AI-PUBLISH-01 / CAP-AI-SEC-01.
