# Priority Experience Integration Model

**Status:** APPROVED (v1.0)  
**Version:** 1.0  
**Date:** 2026-07-21  
**SSOT for:** Integrace Priority Experience napříč product / architecture / runtime vrstvami — toky, odpovědnosti, ownership, lifecycle, uzavření Open Questions  
**Not SSOT for:** Nové UX principy, nové Journey fáze, React, konkrétní package API

**Integrates:**

| Artifact | Role |
| --- | --- |
| [Priority Experience Bible](../product/Priority%20Experience%20Bible.md) | Filozofie, principy, jazyk |
| [Priority Decision Journey Blueprint](../product/Priority%20Decision%20Journey%20Blueprint.md) | Univerzální Journey kostra |
| [Priority Experience Content Model](../product/Priority%20Experience%20Content%20Model.md) | Obsahové typy a textové kontrakty |
| [Garden Decision Journey](../product/content/priority-garden.md) | Referenční content instance |
| [Priority Experience Runtime Contract](./contracts/Priority%20Experience%20Runtime%20Contract.md) | Runtime vstupy/výstupy/gate/události |
| [ADR-012](./adr/ADR-012-interpretation-first-class-artifact.md) | Interpretation → Experience pipeline |
| [ADR-007](./adr/ADR-007-priority-mvp-policy.md) | MVP Priority policy |
| [RI-003](../04-reference-implementation/RI-003-Experience-Kernel.md) | Experience Layer responsibilities |

This document **does not invent** new architecture. It connects existing SSOTs and classifies open items as **Resolved**, **Deferred**, or **Needs ADR**.

---

## 1. End-to-End Flow

### 1.1 Layered flow (product → presentation)

```text
Priority Experience Bible          (why / principles / language)
        ↓
Priority Decision Journey Blueprint (stages + gates)
        ↓
Priority Experience Content Model   (what content exists)
        ↓
content/priority-<id>.md            (instance content)
        ↓
Priority Experience Runtime Contract (when / what Runtime exchanges)
        ↓
Object + PrioritySelection
        ↓
Interpretation                      (machine meaning — ADR-012)
        ↓
Experience                          (communication — ADR-012)
        ↓
Priority Experience surface         (Journey stages + renderers — RI-003)
        ↓
UI / HTML / Terminal / Report       (presentation only)
```

### 1.2 Runtime journey flow (Blueprint stages)

```text
[Selection]
   priority.selection.changed
        ↓
[Confirmation]  ← intent content only (Content Model §4.1)
   priority.confirmation.accepted
        ↓
[Transition]    ← ephemeral bridge (Blueprint §3.3)
   priority.transition.completed
        ↓
[Interpretation]
   Object + confirmed PrioritySelection
        → Interpretation
        → Experience
   priority.interpretation.ready
        ↓
[House Mapping]
   Experience claims → Object anchors
   priority.mapping.ready
        ↓
[Follow-up]
   priority.followup.selected
```

Invalidation (Blueprint §4):

```text
priority.selection.changed
        →
priority.context.invalidated
        →
clear Interpretation + Experience + House Mapping for previous context
```

### 1.3 Facts → Meaning → Communication → Presentation

Aligned with ADR-012:

| Step | Artifact | Layer |
| --- | --- | --- |
| Facts | Object Package | Knowledge |
| Intent | PrioritySelection (+ Confirmation) | Product / Experience surface |
| Meaning | Interpretation | Core / Kernel |
| Communication | Experience | Core → Experience Layer |
| Journey chrome | Confirmation / Transition / Mapping / Follow-up copy | Content Model |
| Presentation | Renderers | RI-003 hosts |

---

## 2. Responsibility Matrix

| Concern | Bible | Blueprint | Content Model | Runtime Contract | Core (Interpretation/Experience) | Experience Kernel (RI-003) | Renderers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Philosophy / tone intent | **Owns** | — | Applies | — | — | — | — |
| Stage order & gates | Refs | **Owns** | Must not change | Enforces | Must respect gates | Must respect gates | Must not skip |
| Content types & text contracts | Language Guide | Stage contracts | **Owns** | Consumes binding | Produces Experience fields | Renders / binds | Displays |
| Priority instance copy | — | — | Template | Loads binding | — | — | — |
| Object facts | R02 | — | Must not invent | Read-only input | Reads | Must not mutate | Must not invent |
| Interpretation (machine) | R01–R07 | — | No UI wording here | Requires output | **Owns** | Reads | Never interprets |
| Experience (semantic UI content) | P08 | §5 fields | Field contracts | Requires output | **Owns** composition | Reads / presents | Renders only |
| Confirmation / Transition copy | P01 | §3.2–3.3 | **Owns** shape | Exposes payloads | Does not own | May hold local stage UI | Renders |
| House Mapping | R04 | §6 | Mapping content | Requires mapping set | May assist from Object+Experience | Presents anchors | Highlights / navigates |
| Journey events semantics | — | Transitions | — | **Owns** event meaning | — | Emits / handles | Triggers |
| Cognitive Signals / DecisionState | — | — | — | OQ-04 | Via Runtime if ADR says so | Emits Signals (RI-003) | — |
| Lead / conversion | P06 forbids early | Forbids early | Forbids in contracts | C8 | — | — | Must not gate Journey |

**Invariant:** Renderers never perform interpretation (ADR-012, Bible R07, RI-003).

---

## 3. Resolution of Open Questions

Status legend:

| Status | Meaning |
| --- | --- |
| **Resolved** | Closed using existing SSOT; implementers may rely on it for MVP |
| **Deferred** | Explicitly out of MVP or non-blocking; do not invent in code as architecture |
| **Needs ADR** | Cannot be closed from current SSOT without new architectural decision |

### 3.1 From Runtime Contract

| ID | Question | Status | Resolution / next step |
| --- | --- | --- | --- |
| **OQ-01** | Priority content package schema (file format, locale, versioning) | **Resolved (MVP authoring)** / **Needs ADR (runtime package)** | **Resolved:** MVP content instances live as `docs/product/content/priority-<id>.md` conforming to Content Model hierarchy (Blueprint §7, Content Model §3, Garden). **Needs ADR** only if a machine-loadable versioned package format is required beyond markdown/SSOT authoring. |
| **OQ-02** | Where Experience Composer runs (Kernel vs Interpretation Engine vs Experience Kernel) | **Resolved (MVP)** | ADR-012: pipeline is Object → PrioritySelection → Interpretation → Experience → Renderers; Composer **may remain combined internally** until evolved to Interpretation Engine → Experience Generator; **no immediate refactor required**. Boundary that matters: Experience exists after Confirmation and is renderer-independent. |
| **OQ-03** | Canonical `objectAnchor` ID schema | **Needs ADR** | Blueprint/Content Model define conceptual shape only (claim → anchor + why). Canonical IDs (room/media/path) require Object Package / mapping ADR — do not invent ad-hoc IDs as platform SSOT. |
| **OQ-04** | Journey events = Cognitive Signals vs Experience-local | **Resolved (MVP split)** / **Needs ADR (Cognitive write)** | **Resolved from RI-003:** Experience-local presentation state may hold Journey UI stage (Confirmation pending, Transition ephemeral) without being Cognitive truth. User intent entering Cognition uses Signals via Runtime. **Needs ADR** before Confirmation/Selection persistence writes DecisionState or new Signal vocabulary becomes Cognitive SSOT. |
| **OQ-05** | Transition timeout / auto-complete | **Resolved** | Blueprint: Transition is short / may be ephemeral; MUST NOT skip Confirmation. No SSOT-mandated timeout. Auto-advance timing is presentation policy, not architecture. |
| **OQ-06** | Multi-priority precedence at runtime | **Deferred (MVP)** / **Needs ADR (composition)** | **Deferred:** Blueprint MVP = one dominant lens per Journey run; Content Model one-lens copy. ADR-007 absolute weights ≠ merged-journey rules. **Needs ADR** for multi-lens Interpretation/Experience composition. |

### 3.2 From Content Model

| ID | Question | Status | Resolution / next step |
| --- | --- | --- | --- |
| **OQ-C01** | May Possible Meanings show in UI? | **Resolved (MVP)** | Garden + Content Model: system does not guess motive; default **authoring-only**. Showing meanings in UI needs explicit product SSOT update (not silent). |
| **OQ-C02** | Multi-priority merged copy | **Deferred** / **Needs ADR** | Same as OQ-06. MVP content = single active lens. |
| **OQ-C03** | Post-MVP locales / fallback / code glossary | **Resolved (MVP)** / **Deferred (post-MVP)** | Bible: Czech user-facing MVP. Post-MVP locale matrix Deferred; glossary for machine codes **Needs ADR** if treated as platform contract. |
| **OQ-C04** | Max field lengths | **Deferred** | No architectural requirement in SSOT. Limits may be added later as content/design guidance without new Journey principles. |
| **OQ-C05** | AI live Experience generation vs authoring-time | **Resolved (authoring)** / **Needs ADR (live)** | **Resolved:** Authoring-time AI drafts allowed if Content Model AI MUST/MUST NOT pass. **Needs ADR** for live runtime generation that produces Interpretation/Experience in-session (pipeline ownership + determinism). |

### 3.3 Already closed elsewhere (do not reopen)

| Topic | Authority | Status |
| --- | --- | --- |
| Absolute vs relative Priority weights | ADR-007 | Accepted — absolute/independent |
| Multi-user Priority | ADR-007 | Postponed (not MVP) |
| Persistence of Priority/DecisionState | ADR-007 | Active Experience only (MVP) |
| Interpretation vs Experience separation | ADR-012 | Accepted |
| Experience surfaces must not own Cognition | RI-003 | Frozen |

---

## 4. Data Ownership

| Data | Owner layer | Writable by | Readable by | Must not |
| --- | --- | --- | --- | --- |
| Object facts | Object Package | Object authors / knowledge pipeline | Interpretation, Mapping | Be mutated by Priority Experience / Renderers |
| PrioritySelection | User intent via Experience surface | Experience → Runtime (event/Signal path) | Confirmation, Interpretation inputs | Be silently rewritten by AI/Interpretation |
| Confirmation state | Experience-local Journey state (MVP) | Priority surface | Runtime gates | Imply Object quality |
| Interpretation | Core Interpretation producer | Interpretation Engine / Core | Experience composition, Trace/analytics | Contain UI copy |
| Experience | Core Experience composition | Composer from Interpretation + communication rules | All Priority semantic renderers | Be invented in UI |
| Stage microcopy | Content Model / `priority-*.md` | Product content | Confirmation, Transition, Follow-up | Replace Experience semantic fields |
| House Mapping set | Produced for Journey (Object + Experience) | Mapping producer (Core or contracted projection) | Mapping stage / Navigator | Change Experience meaning |
| UI chrome | Locale / design | Product | Renderer | Carry new interpretation |
| DecisionState / Cognitive Interpretation | Cognitive Layer | reduce/project only | Surfaces via Session | Be written by Priority UI directly |

### Ownership diagram

```text
Object Package          owns facts
Priority Content Pack   owns priority-specific copy
Core                    owns Interpretation + Experience
Experience Kernel       owns surface composition + Signals out + local Journey UI state
Renderers               own pixels only
```

---

## 5. Lifecycle

### 5.1 Content lifecycle

```text
Author priority-*.md (Content Model)
        ↓
Review against Bible tone + Blueprint contracts
        ↓
Bind to priorityId in Runtime
        ↓
Use in Confirmation / Transition / Mapping / Follow-up
        ↓
Revise content without changing Journey order
```

### 5.2 Single Journey run lifecycle

```text
1. Enter Selection
2. Emit selection.changed until Selection non-empty
3. Confirmation (accept | edit→Selection)
4. Transition (ephemeral)
5. Build Interpretation → Experience (confirmed context only)
6. Build House Mapping from Experience + Object
7. Follow-up handoff (optional modules)
8. On selection.changed → invalidate → restart at Confirmation/Selection
```

### 5.3 Session / persistence lifecycle (MVP)

Per ADR-007:

- Active Experience only — no product promise of cross-visit Priority persistence
- Reload may lose Journey stage unless host adds non-SSOT persistence (**Deferred**, not invent here)

### 5.4 Evolution lifecycle

| Change type | Update which SSOT | Requires ADR? |
| --- | --- | --- |
| New priority copy | `content/priority-*.md` | No |
| Tone / language rule | Bible (+ Content Model) | No (unless Cognitive) |
| New Journey stage | Blueprint + Runtime Contract + Integration Model | **Yes** (architecture) |
| Live AI Experience generation | Content Model + Runtime | **Yes** (OQ-C05) |
| Anchor ID schema | Object / mapping | **Yes** (OQ-03) |
| Multi-lens composition | Bible + Blueprint + Runtime | **Yes** (OQ-06) |

---

## 6. Acceptance Criteria

Integration is acceptable for implementation when:

### Traceability

- [ ] Every Journey stage maps to Blueprint + Runtime Contract events/gates
- [ ] Every semantic UI string maps to Content Model type (or UI chrome)
- [ ] Experience fields match Blueprint §5 / ADR-012 communication layer
- [ ] Garden remains an instance, not a hardcoded Runtime path

### Separation

- [ ] Interpretation has no UI wording
- [ ] Renderers do not interpret
- [ ] Confirmation content does not judge the Object
- [ ] House Mapping does not mutate Experience

### Open Questions discipline

- [ ] Implementers follow Resolved items for MVP
- [ ] Deferred items are not coded as platform SSOT
- [ ] Needs ADR items have no silent “temporary architecture”
- [ ] Closing an OQ updates the owning SSOT listed in §3

### Team interface clarity

| Team | Uses this model to know |
| --- | --- |
| Product / content | What to author in `priority-*.md` |
| Core / Interpretation | When to produce Interpretation/Experience; what not to present |
| Experience / Client Studio | Stage gates, what to render, what events to emit |
| Architecture | Which OQs need ADR before expanding scope |

---

## Governance

```text
Bible → Blueprint → Content Model → Runtime Contract → Integration Model (this)
                              ↓
                     content/priority-*.md
                              ↓
                     Implementation
```

- This Integration Model **reconciles** SSOTs; it does not outrank Bible/Blueprint/ADR on their owned concerns.
- If documents conflict: **ADR > Runtime Contract (gates) > Blueprint (stages) > Content Model (copy) > instance markdown**.
- Philosophy conflicts: **Bible wins**.
- New behavior not listed as Resolved above: **Needs ADR** or product SSOT update — never silent.

### Related Open Question index

Runtime: OQ-01 … OQ-06  
Content: OQ-C01 … OQ-C05  
Closed priors: ADR-007, ADR-012, RI-003
