# Decision Layer

**Status:** Architecture Freeze v1 (documentation only)  
**Date:** 2026-07-20  
**Depends on:** Living Experience v0.1, ADR-002, ADR-003, ADR-007  
**Related:** [Behavior Pack Contract](../behavior-pack-contract.md), [Decision Terminal](../experience/decision-terminal.md), [ADR-009](../adr/ADR-009-decision-layer.md)  
**Freeze + review:** [Decision Layer v1 Freeze](./decision-layer-v1-freeze.md)

This document is the SSOT for the **Decision Layer**: guided decision-making as domain architecture — not UI.

It does **not** authorize Runtime or React implementation by itself.

---

## Platform hierarchy (canonical)

```text
Object Package
Behavior Pack
        │
        ▼
     Kernel / Runtime          ← orchestration of Signal → reduce → project
        │
        ▼
   DecisionState
        │
        ▼
   Interpretation              ← reasoning result (what we understand)
        │
        ▼
═══════════════════════════════
     Decision Layer            ← guided decision making
═══════════════════════════════
        │
        ▼
  Decision Strategy            ← selects / composes guidance
        │
        ▼
  Decision Story               ← ordered scenario of Moves
        │
        ▼
  Decision Move                ← smallest guided step
        │
═══════════════════════════════
     Experience Layer          ← rendering only
═══════════════════════════════
        │
        ▼
  Decision Terminal            ← Experience Surface (renders Stories)
        │
        ├── Priority
        ├── FAQ
        ├── AI Advisor
        ├── Recommendation
        └── Guided Experience (other surfaces)
```

### Layer roles

| Layer | Role |
| --- | --- |
| **Object Package** | Immutable object truth |
| **Behavior Pack** | Domain knowledge, decision rules, Move library, Story composition rules |
| **Kernel / Runtime** | Orchestrates cognitive pipeline; no Decision Story authorship |
| **DecisionState** | Sole cognitive aggregate (ADR-002) |
| **Interpretation** | Pure projection of understanding (ADR-003) |
| **Decision Layer** | Turns Interpretation into guided next steps (Strategy → Story → Move) |
| **Experience Layer** | Renders; emits Signals; never owns Strategy |

---

## Reasoning vs orchestration vs guidance

| Concern | Owner |
| --- | --- |
| **Reasoning** | `project()` → Interpretation (what the situation means) |
| **Cognitive orchestration** | Kernel: Signal → reduce → DecisionState → project |
| **Decision guidance** | Decision Strategy → Story → Move (what guided step comes next) |
| **Presentation** | Experience surfaces (Terminal, Priority, FAQ, AI, …) |

Do not collapse these four into UI components or into Kernel.

---

## Decision Move

### Definition

**Decision Move** is the smallest guided step that can change the user’s decision state.

It is a **domain primitive**.

It is **not**:

- UI  
- a React component  
- a Question widget  
- a Card  
- a Screen  

A Move may *later* be presented as any of those, but presentation is Experience Layer concern.

### Responsibilities

- Name a discrete guided step in the decision process  
- Declare what must be true before / after (preconditions / effects) at the domain level  
- Relate to Interpretation (why this Move is relevant now)  
- Optionally declare which Signal kinds completing the Move may produce  

### Non-responsibilities

- Rendering  
- Calling `reduce` / `project` directly  
- Owning Object Package facts  
- Being a Priority card or FAQ row  

### Lifecycle (conceptual)

```text
eligible (given Interpretation + Strategy)
    → offered (in a Story)
    → active (user engaged)
    → completed | skipped | deferred
    → effects reflected via Signals → DecisionState → Interpretation
```

Moves do not mutate DecisionState themselves. Completion produces **Signals** (or equivalent Runtime inputs); Cognitive Layer remains the only writer via `reduce()`.

### Relationship to Story

A **Decision Story** is an ordered sequence of Decision Moves.  
Moves are the atoms; Stories are the molecules.

### Relationship to Strategy

**Decision Strategy** selects or composes which Moves appear, in which order, for the current Interpretation.

### Relationship to Interpretation

Interpretation answers “what do we understand?”  
A Move answers “what guided step should we offer because of that?”  

Strategy reads Interpretation (and Behavior Pack rules) to choose Moves. Moves must not invent a second Interpretation.

---

## Decision Story

### Definition

**Decision Story** is an ordered sequence of Decision Moves.

It represents **one guided decision scenario**.

### Properties

- May be **assembled dynamically** from a Move library + composition rules  
- Is **not** a hardcoded page flow  
- Is **not** a fixed Client Studio route  
- May differ according to Interpretation (and Behavior Pack)  
- May be re-composed when Interpretation changes  

### Conceptual stages (optional vocabulary)

Stories may be *described* using stage language (Confirmation, Discovery, Interpretation, Reality Check, Recommendation). Those labels are **narrative aids**, not mandatory UI screens and not a substitute for Moves.

### Relationship to Terminal

**Decision Terminal** (Experience Layer) **renders** Decision Stories.  
It does not author Stories.

---

## Decision Strategy

### Definition

**Decision Strategy** selects or composes the appropriate Decision Story based on the current **Interpretation**.

### Responsibility

**Orchestration of decision guidance** — the adaptive brain between understanding and guided steps.

```text
Interpretation
      ↓
Decision Strategy
      ↓
Decision Story (sequence of Decision Moves)
```

### Does

- Choose Story templates or compose Moves dynamically  
- Adapt when Interpretation changes  
- Apply Behavior Pack Story composition rules  
- Decide emphasis, ordering, and which Moves are eligible  

### Does not

- Render UI  
- Write DecisionState  
- Replace `project()`  
- Live inside React components  

### Future adaptive behavior

This is where long-horizon adaptive guidance will live (together with future Decision Trajectory inputs). Strategy is the extension point for “the Experience guides differently for different minds” without redesigning Kernel.

---

## Decision Trajectory

**Status: Future Architecture — NOT MVP.**

### Definition

**Decision Trajectory** represents the long-term evolution of the user’s decision process.

### Potential inputs

- repeated visits  
- priority evolution  
- intensity changes  
- interaction order  
- timestamps  
- behavioral patterns  

### Why it exists

Interpretation is a **snapshot** of understanding. Trajectory is the **history and pattern** of how deciding evolved — enabling Strategy to guide differently for returning visitors, stalled decisions, or oscillating priorities.

### Rules

- Trajectory **extends** the platform; it does **not** replace Interpretation  
- Trajectory is **not** a second DecisionState  
- Persistence of Trajectory requires a future ADR (MVP remains active-Experience-only per ADR-007)  
- Do not implement under Living Experience or Decision Terminal epics without that ADR  

---

## Decision Terminal (Experience Layer)

Full SSOT for the surface: [Decision Terminal](../experience/decision-terminal.md).

Summary for Decision Layer:

- **Experience Surface** that renders Decision Stories (and related Interpretation context)  
- **Not** part of Kernel or Runtime  
- **Not** synonymous with any one layout  

May be rendered as:

- right panel  
- fullscreen  
- bottom sheet  
- AI conversation  
- voice  
- future interfaces  

---

## Behavior Pack (inputs to Decision Layer)

Behavior Pack provides (see contract):

- domain knowledge  
- decision rules  
- **Decision Move library**  
- **Story composition rules**  

It does **not** modify UI. Experience surfaces only render composed Stories / Interpretation.

---

## Invariants

1. Cognitive pipeline stays: Signal → reduce → DecisionState → project → Interpretation.  
2. Decision Layer sits **after** Interpretation for guidance; it does not bypass `project()`.  
3. Experience Layer never owns Strategy or Move libraries.  
4. Completing a Move affects cognition only through Signals.  
5. Decision Trajectory is future-only until ADR’d.

---

## Terminology supersessions

| Old / ambiguous language | Canonical |
| --- | --- |
| Right panel (as architecture) | One possible **rendering** of Decision Terminal |
| Priority Detail | Not a domain concept; use Active Focus + Moves / Story |
| Static Story / hardcoded flow | **Rejected** — Stories are composed sequences of Moves |
| Decision Story = five UI screens | **Rejected** — stages are optional narrative; Moves are primitives |
| Behavior Pack changes UI | **Rejected** — Pack supplies knowledge, rules, Moves, composition |
| Terminal in Kernel | **Rejected** — Experience Layer only |
