# Living Experience v0.1 — Architectural Freeze

**Status:** FROZEN  
**Date:** 2026-07-20  
**Commit baseline:** `d5d2ea16ed0ab2df1bc12e028b9b7ff720ca62ec`  
**Branch:** `feature/epic-04-cap-01-priority`  
**Scope:** Cognitive pipeline + synchronized Decision Experience (Priority / FAQ / AI Advisor)

This document freezes the first generation of Embed Engine’s Decision Experience.

Everything after this milestone must **extend behavior**, not architecture.

Related:

- [Decision Layer](./decision-layer/decision-layer.md) — Strategy → Story → Move (ADR-009)
- [Behavior Pack Contract](./behavior-pack-contract.md) — knowledge, rules, Move library, composition
- [Decision Terminal](./experience/decision-terminal.md) — Experience Surface (ADR-008 Proposed)
- [ADR-002](./adr/ADR-002-decision-state.md) — DecisionState Aggregate
- [ADR-003](./adr/ADR-003-cognitive-processing-pipeline.md) — Cognitive Processing Pipeline
- [ADR-007](./adr/ADR-007-priority-mvp-policy.md) — Priority MVP policy (closed open questions)
- [CORE-001](./core/CORE-001-cognitive-layer.md) — Cognitive Layer

---

## Priority MVP — closed open questions

Historical Priority research questions are **resolved** for Pilot / MVP. Full rationale: **ADR-007**.

| Question | MVP decision | Classification |
| --- | --- | --- |
| Absolute vs relative weights | **Absolute / independent** weights (Option A) | **Accepted** |
| Multi-user / couple Priorities | Single visitor only | **Postponed** |
| Persistence | DecisionState for **active Experience only** (Runtime memory) | **Accepted** |

Relative budget mode, collaborative actors, and durable restore are **not** open — they are postponed / future research with backlog ids in [`PRODUCT_BACKLOG.md`](../product/backlog/PRODUCT_BACKLOG.md).

---

## A. Living Experience v0.1 review

### Architecture (frozen)

```text
Signal
  ↓
reduce()
  ↓
DecisionState
  ↓
project()
  ↓
Interpretation
  ↓
React (InterpretationProvider)
  ↓
Priority · FAQ · AI Advisor   ← three renderers, one mind
```

Invariants locked by this freeze:

1. **DecisionState** is the only mutable cognitive aggregate (immutably replaced per Signal).
2. **`reduce()`** is the only writer of DecisionState.
3. **`project()`** is the only producer of Interpretation.
4. **Runtime / Kernel** orchestrate the pipeline; they do not contain scoring or recommendation rules.
5. **React** renders Interpretation and dispatches Signals; it does not invent decision meaning.
6. Priority, FAQ, and AI Advisor are **renderers of the same Interpretation**.

### Implemented capabilities

| Cap / slice | What landed |
| --- | --- |
| CAP-02 | `DecisionState` + `createInitialDecisionState` |
| CAP-03 / 03a | `Signal`, `SignalType`, `createSignal`; environment field naming |
| CAP-04 | `Focus` integrated into DecisionState |
| CAP-05 | `reduce(state, signal)` with per-`SignalType` reducers |
| CAP-06–10 slice | `project()` → Interpretation; Runtime `applySignal`; Priority wired |
| Living Experience | Walkthrough Signals (room / media / floor); timeline / reasons |
| Sync Experience | Shared `InterpretationProvider`; FAQ + AI consume Interpretation fields |

Public import path: `@embed-engine/core/cognitive`.

### Browser behavior (Pilot proof)

One user interaction (e.g. open a room) produces one Interpretation update visible across:

- **Priority** — weights, rank, highlight, reasons
- **FAQ** — `recommendedQuestions`, active topic, why
- **AI Advisor** — `conversationContext`, `recommendations`, `activeTopic`, `nextAction`

Proof artifacts:

- `docs/sync-experience-priority.png`
- `docs/sync-experience-ai-faq.png`

### Known temporary compromises

1. **Behavior content lives inside `project()`** — question bank, titles, conversation framing, next-action strings are hardcoded in the projector until Behavior Packs exist.
2. **Priority focus uses `QUESTION_OPENED`** — there is no dedicated “priority changed” Signal yet; preference is expressed through an existing SignalType.
3. **Dual runtimes in Client Studio** — `CommandRuntime` (legacy decision-flow Experience) coexists with Cognitive `Runtime` (Interpretation). Pilot path uses Cognitive Runtime for Priority / FAQ / AI.
4. **AI chat transcript is local React state** — framing comes from Interpretation; turn-by-turn chat history is not yet DecisionState.
5. **Presentation catalogs remain local** — Priority card titles/icons (`DECISION_CATEGORIES`) and FAQ section chrome are UI labels, not cognitive meaning.
6. **`EMPTY_INTERPRETATION` fallback** in `InterpretationProvider` duplicates safe defaults when Runtime is not ready.

### Technical debt (accepted, not fixed in this freeze)

| Debt | Severity | Notes |
| --- | --- | --- |
| Dual Runtime / ExperienceModel vs Interpretation | High | Docs and code still describe two eras (`experience-projection.md`, ADR-006 vs cognitive pipeline) |
| Mock `RecommendationViewModel` / static recommendation panel | Medium | Not driven by Interpretation |
| React-side topicId heuristic on send (`AIAdvisor.handleSend`) | Low | Presentation glue; should become Signal payload / Behavior Pack later |
| `useDecisionCards` thresholds (`weight > 0.5`, `weight === 1`) | Low | View selection thresholds; ideally projected flags |
| ADR-002 / ADR-003 still **Proposed** | Medium | Behavior matches freeze; status should be Accepted |
| Product backlog empty / roadmap pre-cognitive | Medium | Does not yet name Living Experience or Behavior Packs |

### Intentionally postponed

- Behavior Packs (contract defined; no implementation)
- Dedicated Signal types for priority preference / AI turn
- Merging CommandRuntime into Cognitive Runtime
- Persisted DecisionState / multi-session memory (**ADR-007**: rejected for MVP; Post-MVP backlog)
- Multi-user / couple Priority collaboration (**ADR-007**: postponed)
- Relative weight budget sum=100% (**ADR-007**: rejected for MVP; Post-MVP / research)
- Real LLM for AI Advisor replies
- Additional Behavior profiles (Young Family, Investor, Luxury Buyer, …)
- Manager Studio / Sales Studio consumption of Interpretation
- Removing presentation catalogs from apps (titles may stay in UI; meaning must not)

---

## B. Architecture verification

| # | Principle | Verdict |
| --- | --- | --- |
| 1 | DecisionState is the only mutable cognitive aggregate | **PASS** — Focus/Environment are fields; no second cognitive aggregate |
| 2 | `reduce()` is the only writer | **PASS** — Kernel calls `reduce` then replaces Runtime state; no direct DecisionState mutation elsewhere |
| 3 | `project()` is the only Interpretation producer | **PASS** — Kernel `load` / `applySignal` only |
| 4 | Runtime contains orchestration only | **PASS** — Kernel wires Signal → reduce → project; no scoring in Runtime |
| 5 | React contains rendering only | **PASS with notes** — see violations / compromises |
| 6 | Priority contains no business logic | **PASS with notes** — view thresholds & local category labels |
| 7 | FAQ contains no business logic | **PASS** — renders `recommendedQuestions` only; expand is UI chrome |
| 8 | AI Advisor contains no business logic | **PASS with notes** — transcript local; mild reply string composition |
| 9 | Interpretation is the only source consumed by renderers | **PASS with notes** — Priority labels still from local constants |

Pipeline order is unchanged and must not be redesigned.

---

## C. Detected violations

### Hard violations

**None** that break the frozen pipeline.

No React code writes DecisionState.  
No second Interpretation producer.  
No reduce bypass for the Cognitive Runtime path.

### Soft violations (document; do not fix in freeze)

1. **`AIAdvisor.handleSend` topic resolution**  
   Chooses `topicId` from elevated priority / first recommended question / fallback `'investment'`.  
   **Class:** presentation glue leaning toward decision logic.  
   **Disposition:** postpone → Behavior Pack / Signal payload.

2. **`useDecisionCards` weight thresholds**  
   `weight > 0.5` for “selected”, `weight === 1` for primary question id.  
   **Class:** derived view rules that belong as projected flags later.  
   **Disposition:** accept for v0.1; Behavior Pack / project may emit explicit UI flags.

3. **Local `DECISION_CATEGORIES` catalog**  
   Titles/icons for Priority cards are not read from Interpretation.  
   **Class:** presentation catalog. Acceptable if weights/ranks/reasons remain Interpretation-only.  
   **Disposition:** keep until Behavior Pack owns display titles or Object Package owns labels.

4. **Static recommendation panel (`MOCK_RECOMMENDATION_VIEW_MODEL`)**  
   Not synchronized with Interpretation.  
   **Class:** leftover UI not part of the synchronized Experience.  
   **Disposition:** debt; wire or hide in a later behavior slice — not an architecture change.

5. **Documentation drift (ADR-006, experience-projection.md)**  
   Still describe ExperienceModel / ReactProjector as the public contract.  
   Living Experience v0.1 uses **Interpretation** as the renderer contract for Priority / FAQ / AI.  
   **Class:** docs violation, not runtime violation.  
   **Disposition:** documentation updates listed in section F.

---

## D. Freeze report

### What is frozen

- Cognitive pipeline order and responsibilities
- DecisionState as sole cognitive aggregate
- Interpretation shape used by the three Pilot renderers
- Synchronized Experience pattern: one Signal → one Interpretation → three renderers
- Runtime role as orchestrator only

### What is not frozen

- Contents of `project()` (will move behind Behavior Pack)
- SignalType catalog (may grow; must not break reduce purity)
- Presentation chrome, layout, design tokens
- Chat transcript persistence
- Dual-runtime cleanup

### Freeze rule for future work

> New value enters the product as **Behavior** (Behavior Packs, richer Signals, richer projected fields).  
> New value does **not** enter as a new cognitive aggregate, a parallel pipeline, or renderer-owned reasoning.

### Exit criteria for v0.1 (met)

- [x] Pipeline stable in code
- [x] Browser shows synchronized Priority + FAQ + AI
- [x] Architectural review completed
- [x] Behavior Pack contract defined (not implemented)
- [x] Documentation update list produced

---

## F. Documentation updates (required list)

See also section F in the freeze deliverable summary. Documents that **should be updated** (content changes deferred to dedicated docs commits; listed here as freeze obligations):

| Document | Why |
| --- | --- |
| `docs/architecture/adr/ADR-002-decision-state.md` | Promote **Proposed → Accepted**; freeze status aligned with Living Experience v0.1 |
| `docs/architecture/adr/ADR-003-cognitive-processing-pipeline.md` | Promote **Proposed → Accepted**; note Runtime orchestrates but does not own reduce/project logic |
| `docs/architecture/adr/README.md` | Reflect Accepted statuses; link Living Experience freeze + Behavior Pack contract |
| `docs/architecture/core/CORE-001-cognitive-layer.md` | Status Draft → aligned with freeze; mention synchronized Experience + Behavior Packs as next extension point |
| `docs/architecture/core/CORE-002-decision-state.md` | Cross-link freeze; confirm sole-aggregate wording |
| `docs/architecture/adr/ADR-006-interpretation-projection-layer.md` | Reconcile with cognitive Interpretation; mark ExperienceModel path as legacy / parallel until unified |
| `docs/architecture/experience-projection.md` | Update public contract: Interpretation for Decision Experience renderers; avoid contradicting ADR-003 |
| `docs/architecture/runtime-decisions.md` / `runtime-boundaries.md` | Note Cognitive `applySignal` orchestration vs CommandRuntime |
| `docs/foundations/03-experience-model.md` | Align Experience pipeline language with Signal → reduce → project → Interpretation |
| `docs/product/pilots/README.md` | Add Living Experience v0.1 as validated Pilot path; Behavior Pack as next knowledge unit |
| `docs/product/post-foundation-development-policy.md` | State: extend via Behavior Packs, not architecture |
| `docs/roadmap/embed-engine-roadmap.md` | Insert Living Experience v0.1 freeze + Behavior Pack phase |
| `docs/product/backlog/PRODUCT_BACKLOG.md` | Reaction-driven backlog; first Behavior Pack as next epic |
| `docs/product/constitution/*` / Product Bible archive | No structural rewrite; add pointer from living product docs that Bible remains historical |
| `docs/PROJECT-MAP.md` | Link freeze + Behavior Pack contract |
| `docs/context/implementation-handover.md` | Point agents at freeze as starting SSOT for next phase |

**Do not rewrite** archived Product Bible content in place — supersede by reference from living architecture docs.

---

## G. Recommended first Behavior Pack

**Energy Conscious Buyer**

### Why this pack first

1. **Highest Pilot clarity** — Energy / operating-cost intent is immediately legible to a first-time visitor (“the app understood what I care about”).
2. **Already seeded in `project()`** — `energy` and `operating-costs` priorities and question seeds exist; the pack mostly relocates and formalizes behavior rather than inventing a new domain.
3. **Strong Signal ↔ meaning loop** — technical media, room systems, and questions map cleanly to energy focus without needing luxury narrative or investment math.
4. **Commercial fit for modular / Astav-class pilots** — operating cost and energy standard are real buying objections; the Experience can prove value without a full LLM.
5. **Tightest test of the freeze rule** — success = swap Behavior Pack content, keep pipeline, keep three renderers synchronized.

Deferred packs (not first): Young Family (layout/flexibility), Investor (yield/risk), Luxury Buyer (design/quality) — valuable later; weaker as the first proof that Behavior extends architecture.

---

## H. Recommended commit messages

```text
docs(architecture): freeze Living Experience v0.1

Lock the cognitive pipeline and synchronized Decision Experience as the
stable baseline before Behavior Packs.
```

```text
docs(architecture): define Behavior Pack contract

Specify the decision-profile contract for extending behavior without
changing the Signal → reduce → project → Interpretation pipeline.
```

```text
docs(adr): accept ADR-002 and ADR-003 for Living Experience v0.1

(Status-only follow-up; no code change.)
```

---

## Success statement

Living Experience v0.1 is frozen when:

- one intelligence is visible in the browser across Priority, FAQ, and AI Advisor, and
- the next product increment is defined as a **Behavior Pack**, not a new architecture.
