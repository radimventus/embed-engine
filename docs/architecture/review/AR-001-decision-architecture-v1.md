# Architecture Review v1.0 — Decision Architecture

| Field | Value |
| --- | --- |
| **ID** | AR-001 |
| **Title** | Decision Architecture Review v1.0 |
| **Status** | **PASSED (Conditional)** |
| **Architecture state** | **FROZEN** — [Decision Architecture v1.0 Freeze](../decision-architecture-v1.0-freeze.md) |
| **Type** | Architecture Review (AR) |
| **Version** | 1.0 |
| **Date** | 2026-07-22 |
| **Owner** | Platform Architecture |
| **Scope** | First-generation Decision Architecture — Product Theses, Runtime, semantic pipeline, Experience projection, public contracts, layer boundaries, extension points |
| **Out of scope** | UI polish, performance optimization, visual design, pilot-specific content |
| **Remaining work** | Implementation only (CAPs + ED-DA-\*) |

---

## Purpose

Validate that the first generation of the Decision Architecture forms a coherent, deterministic, and implementation-ready system.

This review evaluates **architectural integrity** rather than implementation quality.

---

## Scope Notes

**Included**

- Product Theses [PT-001](../pt/PT-001-house-package-canonical-object-contract.md) → [PT-008](../pt/PT-008-every-decision-experience-produces-outcome.md)
- Runtime architecture (`@embed-engine/runtime` Decision Session)
- Semantic pipeline (Signals → Rules → Focus → Context)
- Experience projection / Experience Context
- Public contracts and layer boundaries
- Extension points

**Note on PT numbering:** The review brief referenced PT-001 → PT-007. The repository also contains **PT-008 (Decision Outcome)**. Both PT-007 (Terminal surface) and PT-008 (Outcome artifact) are in scope.

---

## Executive Verdict

**PASSED (Conditional).** Architecture **FROZEN** at v1.0 — remaining work is implementation only.

Foundations strong; narrative layer (Story / Moves / Outcome / Terminal) not yet on the session pipeline — authorized as CAP work, not open architecture.

The Decision Session Runtime correctly implements:

```text
Command → Event → Mutation → Priority Signals → Interpretation Rules
  → Decision Focus → Session Interpretation → Experience Context
```

Product Theses PT-001 → PT-008 form a coherent principle stack and authorize CAP implementation paths.

Exit criteria are **not fully met** until:

1. Decision Story / Moves / Outcome / Terminal engines join the **same** session pipeline,
2. Client Studio retires the **dual Experience** (cognitive `interpretAndCompose` vs Decision Session Runtime),
3. Experience Context is hardened as the **only** presentation contract (no leaked Runtime / Interpretation to modules).

Remaining work should proceed as **CAPs and Engineering Debt** — not new foundational PTs.

---

## AR-01 — Domain Model

### Expected model

```text
House Package
        ↓
Runtime
        ↓
Interpretation
        ↓
Decision Story
        ↓
Decision Moves
        ↓
Experience Context
        ↓
Decision Terminal / Decision Outcome
```

### Findings

| Check | Result |
| --- | --- |
| Single responsibility for House Package | **Pass** — PT-001 / HP-001 |
| Runtime owns state + commands + events | **Pass** — CAP-HP-002.5 pipeline |
| Interpretation owns meaning | **Pass** — rules + signals + focus |
| Decision Story / Moves ownership | **Done** — CAP-DST-001 + CAP-DST-002 on session Runtime (Story → Moves) |
| Experience Context ownership | **Pass** — Runtime projection + Client Studio enrichment |
| Terminal vs Outcome | **Pass with clarification** — PT-007 = surface; PT-008 = portable artifact (must not collapse into one concept) |

### Issues

- **Dual Decision Layer stacks:** Decision Layer vocabulary + Core `composeDecisionStory` coexist with Decision Session Runtime without a single executable Story path.
- Flat `SessionExperience` fields **duplicate** `experience.context` (intentional transition; should converge).

### Verdict

**Pass with debt** — domain vocabulary is clear; Story/Moves/Outcome engines are authorized but not unified in Runtime.

---

## AR-02 — Layer Separation

### Expected dependency direction

```text
Presentation
    ↑
Experience Context
    ↑
Decision Terminal / Outcome
    ↑
Decision Story / Moves
    ↑
Interpretation
    ↑
Runtime
    ↑
House Package
```

### Findings

| Violation check | Result |
| --- | --- |
| UI mutates Runtime | **Pass** — mutations via `dispatch(command)` only |
| AI mutates Runtime | **Pass** — AI Advisor is presentation FAQ; no Runtime writes observed |
| Hero generates Story | **Partial Fail** — Hero projection assembles narrative *copy* from Focus keys; no Story engine yet |
| Gallery interprets media | **Partial Fail** — media resolution lives in Client Studio `synchronizedExperience` / presentation assets |
| Modules own semantic state | **Fail (Priority stack)** — Priority Engine still drives Terminal via cognitive `interpretAndCompose` |

### Verdict

**Conditional Fail on Client Studio dual authority** — Runtime boundary is healthy; Experience host still hosts a second semantic producer.

---

## AR-03 — Runtime Integrity

### Must own

| Responsibility | Status |
| --- | --- |
| State | **Pass** — `SessionRuntimeState` |
| Commands | **Pass** — `RuntimeCommand` |
| Events | **Pass** — `DecisionEvent` |
| Projections | **Pass** — `projectFromInterpretation` / `ExperienceContext` |

### Must not own

| Concern | Status |
| --- | --- |
| Rendering | **Pass** |
| UI | **Pass** |
| Copywriting / layout | **Pass** at Runtime (labels appear in Client Studio projection) |

### Questions

| Question | Answer |
| --- | --- |
| Are all mutations command-driven? | **Yes** for Decision Session Runtime |
| Is every state reproducible? | **Yes** for Runtime state + events (`serialize` / `replay`) |
| Identical inputs → identical sessions? | **Yes** when `now` is controlled; wall-clock default exists if omitted |

### Verdict

**Pass** for Decision Session Runtime integrity.

---

## AR-04 — Projection Review

### Required form

```text
Runtime State (+ Interpretation)
        ↓
Projection
        ↓
Experience Context
```

### Findings

| Property | Status |
| --- | --- |
| Pure function (Runtime projection) | **Pass** — no side effects / persistence |
| Deterministic | **Pass** — covered by tests |
| Serializable | **Partial** — Session serializes; Experience Context itself is re-derived |
| UI knowledge in Runtime | **Pass** |
| UI knowledge in Client Studio sync projection | **Fail (by design today)** — presentation media catalog |

### Verdict

**Pass for Runtime projection; debt for app-layer media projection.**

---

## AR-05 — Experience Context

### Rule

Modules may consume `experience.context`.

Modules may not consume: `runtime.state`, raw `interpretation`, signals, story internals.

### Findings

| Check | Status |
| --- | --- |
| Context exists and is used by Hero / Gallery / Navigator | **Pass** |
| Provider exposes only Context | **Fail** — also exposes `runtime`, `interpretation` |
| Internals on Context | **Risk** — `appliedRuleIds`, `rulesetId`, machine `interpretationSummary` |
| Duplicate contracts | **Risk** — flat SessionExperience + nested context; Priority cognitive Experience parallel |

### Verdict

**Conditional Pass** — contract exists; public surface not yet strict.

---

## AR-06 — Product Thesis Consistency

| PT | One principle? | CAP authorized? | Notes |
| --- | --- | --- | --- |
| PT-001 Object Contract | Yes | HP / Object Package path | Approved |
| PT-002 Interpretation product | Yes | ADR-012 / Runtime interpret | Approved |
| PT-003 Sessions reproducible | Yes | RI-002 / Runtime session | Proposed |
| PT-004 Decision Story | Yes | CAP-DST-001 | Proposed |
| PT-005 Decision Moves | Yes | CAP-DST-002 | Proposed |
| PT-006 AI Explains | Yes | CAP-AI-001 | Proposed |
| PT-007 Decision Terminal | Yes | CAP-DTR-001 | Proposed |
| PT-008 Decision Outcome | Yes | CAP-OUT-001 | Proposed — clarifies Terminal vs Outcome |

### Duplication check

- PT-007 vs PT-008: **intentional split** (surface vs artifact). Keep both; do not merge.
- PT-002 vs PT-004: complementary (meaning vs narrative).

### Verdict

**Pass** — each PT defines one principle and authorizes implementation.

---

## AR-07 — CAP Coverage

| Principle | CAP / Path | Implementation on Decision Session Runtime |
| --- | --- | --- |
| Pipeline | CAP-HP-002.5 | **Done** |
| Interpretation Rules + Context | CAP-HP-003.x | **Done** |
| Priority Signals | CAP-PRI-001 | **Done** |
| Decision Focus | CAP-PRI-002 | **Done** |
| Decision Story | CAP-DST-001 | **Done** |
| Decision Moves | CAP-DST-002 | **Done** |
| AI Context Reader | CAP-AI-001 | **Not done** |
| Decision Terminal Engine | CAP-DTR-001 | **Not done** (UI only) |
| Decision Outcome Engine | CAP-OUT-001 | **Done** |

No CAP without a principle was found.

Several principles lack session-pipeline implementation — expected for this review stage.

### Verdict

**Pass for mapping; Fail for complete coverage.**

---

## AR-08 — Determinism Audit

| Component | Creates semantic truth? | Required |
| --- | --- | --- |
| Runtime (+ Rules / Signals / Focus) | **Yes** | Allowed |
| Hero | Copy assembly only | Must not invent Story |
| Gallery | Renders projected media | Must not interpret Object Package |
| Navigator | Dispatches SelectRoom | Pass |
| AI Advisor | Presentation FAQ | Pass (no mutation) |
| Decision Terminal (today) | Uses parallel compose stack | **Must migrate** |
| Reports / CRM | N/A / future | Must consume Outcome |

### Verdict

**Fail until dual Experience authority is removed.**

---

## AR-09 — AI Boundary (PT-006)

| Rule | Status |
| --- | --- |
| AI explains / summarizes | Presentation FAQ only today |
| AI does not interpret / prioritize / recommend canonically | **Pass** (no engine path observed) |
| AI does not mutate Runtime | **Pass** |
| Prompt / tool architecture | **Not reviewed in depth** — CAP-AI-001 not implemented |

### Verdict

**Pass on principle; CAP-AI-001 still required for production AI.**

---

## AR-10 — Decision Flow Audit

### Target flow

```text
House → Signals → Interpretation → Story → Moves → Experience → Terminal / Outcome
```

### Actual session flow

```text
House → Signals → Interpretation Rules → Focus → Experience Context
  → Hero / Gallery / Navigator
```

| Layer | Present |
| --- | --- |
| House Package | Yes |
| Priority Signals | Yes |
| Interpretation | Yes |
| Decision Focus | Yes |
| Decision Story | **No** (session) |
| Decision Moves | **No** (session) |
| Experience Context | Yes |
| Decision Terminal (semantic engine) | **No** |
| Decision Outcome | **No** |

Bypass risk: Priority Engine Terminal path skips Decision Session Story/Moves.

### Verdict

**Incomplete flow — no missing foundational concept; missing CAP engines.**

---

## AR-11 — Public API Review

### Recommended public contracts

1. **House Package** (Object)
2. **Experience Context** (semantic presentation contract)
3. **Decision Outcome** (integration / completion contract — CAP-OUT-001)
4. **Decision Terminal** as *surface* of Outcome (CAP-DTR-001), not a second truth

### Current risks

- Runtime package exports pipeline internals (`validateCommand`, `applyDecisionEvent`, rule evaluators, …).
- Provider exposes `runtime` + `interpretation` to the app tree.

### Verdict

**Needs hardening** — capture as Engineering Debt; do not invent new PT.

---

## AR-12 — Extension Review

Can Energy / Financing / Sustainability / Neighborhood Packs, AI Coach, multi-object comparison integrate without new foundations?

**Yes**, if they attach as:

- Object Package / Behavior Pack knowledge,
- Interpretation Rules / Priority Signal catalogs,
- Story / Move libraries (CAP-DST-*),
- Outcome consumers,

without adding parallel Runtimes or UI-owned semantics.

### Verdict

**Pass** — extension model is sound once Story/Moves/Outcome land on the session pipeline.

---

## AR-13 — Pilot Readiness

| Question | Answer |
| --- | --- |
| Can one pilot object execute House → Priorities → Signals → Focus → Experience? | **Yes** (live Client Studio + Runtime) |
| Full Story → Moves → Terminal? | **Not on one pipeline** |
| Demonstrable live? | **Yes** for Signals → Focus → Hero/Gallery change |
| Explainable in five minutes? | **Yes** for “priorities change meaning without changing Object” |

### Verdict

**Pilot-ready for interpretation demo; not yet for full Decision Journey demo.**

---

## Strengths

Architectural decisions that should remain unchanged:

1. **House Package as passive Object contract** (PT-001).
2. **Command → Event → Interpret → Project** as sole mutation path.
3. **Priority Signals as the only priority input to Rules** (PT / CAP-PRI-001).
4. **Decision Focus as attention entry point** (CAP-PRI-002).
5. **Experience Context as the intended presentation contract**.
6. **AI explains, never decides** (PT-006) — keep absolute.
7. **Terminal vs Outcome split** (PT-007 / PT-008) — keep distinct.
8. **No new foundational PTs required** — remaining work is CAP execution.

---

## Risks

| ID | Risk | Impact |
| --- | --- | --- |
| R-01 | Dual Experience authorities in Client Studio | Narrative drift; non-reproducible Terminal |
| R-02 | Media / hero projection in app layer | Bypass of Object → Runtime → Context |
| R-03 | Over-exported Runtime internals | Accidental UI coupling to pipeline |
| R-04 | Story/Moves implemented only on cognitive Kernel | Permanent fork if not migrated |
| R-05 | PT-007 / PT-008 conflation in implementation | Duplicate “outcome” DTOs |

---

## Engineering Debt

Captured for non-blocking follow-up (also listed in [Engineering Debt](../../implementation/Engineering%20Debt.md)):

| ID | Item |
| --- | --- |
| ED-DA-01 | Unify Client Studio on Decision Session Runtime only (retire Priority `interpretAndCompose` as semantic producer) |
| ED-DA-02 | Move room media / hero projection into Runtime or Object-owned projection (out of walkthrough catalog ownership) |
| ED-DA-03 | Narrow `@embed-engine/runtime` public exports to façade + Experience Context + Outcome |
| ED-DA-04 | Remove Provider exposure of `runtime` / raw `interpretation` to presentation modules |
| ED-DA-05 | Converge flat `SessionExperience` fields into `experience.context` only |
| ED-DA-06 | Clock injection required in production create/dispatch paths (no silent `Date.now()` for reproducibility demos) |

---

## Open Questions

| ID | Question |
| --- | --- |
| OQ-01 | Should Decision Focus remain a peer of Interpretation outputs, or become a Decision Story chapter cursor? |
| OQ-02 | Is Client Studio synchronized media enrichment allowed long-term, or must all media URLs come from House Package projection? |
| OQ-03 | Does CAP-DTR-001 own Terminal *projection* only, with CAP-OUT-001 owning the serializable artifact — confirmed by PT-007/008; needs RI contract? |
| OQ-04 | When does PT-003 / PT-004–008 move from Proposed → Approved relative to CAP completion? |

---

## Recommended CAP Priority

Ordered roadmap after this review — **no new foundational architecture**:

1. ~~**CAP-DST-001** — Decision Story Engine~~ **Done**
2. ~~**CAP-DST-002** — Decision Move Engine~~ **Done**
3. ~~**CAP-OUT-001** — Decision Outcome Engine~~ **Done**
4. **CAP-DTR-001** — Decision Terminal Engine (consume Outcome via Experience Context)
5. **CAP-AI-001** — AI Context Reader (read Context/Story/Outcome only; commands via Runtime)
6. **ED-DA-01…06** — boundary hardening in parallel or immediately after DST-001

---

## Exit Criteria Assessment

| Criterion | Status |
| --- | --- |
| Every Product Thesis has a clear architectural role | **Met** (PT-001–008) |
| Dependencies flow in one direction | **Met in Runtime; not met in Client Studio dual stack** |
| Runtime remains the single semantic authority | **Met for Session Runtime; violated by parallel compose path** |
| Experience Context is the only presentation contract | **Intent met; enforcement incomplete** |
| AI fully isolated from semantic generation | **Met** |
| Every completed Decision Session produces a deterministic Decision Terminal | **Not met** — Terminal engine / Outcome not on session pipeline |
| Remaining work proceeds via CAPs without new foundations | **Met** |

### Overall disposition

| Gate | Status |
| --- | --- |
| Architecture review | **PASSED (Conditional)** |
| Architecture freeze | **FROZEN** — [v1.0 freeze](../decision-architecture-v1.0-freeze.md) |
| Implementation completeness | **Open** — CAP-DST-001…CAP-AI-001 + ED-DA-01…06 |

Conditional gaps do **not** reopen foundations. Reopen only via ADR + AR-001.1 if a CAP proves a frozen invariant wrong.

---

## Related documents

- [Decision Architecture v1.0 Freeze](../decision-architecture-v1.0-freeze.md)
- [Platform Theory index](../pt/README.md)
- [Decision Layer vocabulary](../decision-layer/README.md)
- [RI-001 Runtime Kernel](../../04-reference-implementation/RI-001-Runtime-Kernel.md)
- [RI-002 Decision Session](../../04-reference-implementation/RI-002-Decision-Session.md)
- [RI-003 Experience Kernel](../../04-reference-implementation/RI-003-Experience-Kernel.md)
- [Engineering Debt](../../implementation/Engineering%20Debt.md)
