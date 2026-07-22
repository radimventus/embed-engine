# PT-009 — The Experience is the Product Surface

| Field | Value |
| --- | --- |
| **ID** | PT-009 |
| **Title** | The Experience is the Product Surface |
| **Status** | Proposed |
| **Type** | Platform Theory (PT) / Product Thesis |
| **Version** | 0.1 |
| **Date** | 2026-07-22 |
| **Owner** | Platform Architecture |
| **Scope** | Embed Engine Platform — presentation boundary of the Decision Engine |
| **SSOT for** | Experience as exclusive user-facing surface; presentation consumes Experience Context + Decision Outcome only; user intent → Runtime commands; semantic consistency across clients |
| **Not SSOT for** | Visual design, layout systems, Client Studio chrome, specific module UX, CAP implementation schemas |
| **Depends on** | [PT-002](./PT-002-interpretation-is-the-product.md), [PT-003](./PT-003-decision-sessions-are-reproducible.md), [PT-004](./PT-004-decision-story-is-the-product.md), [PT-005](./PT-005-decision-experience-composed-from-moves.md), [PT-006](./PT-006-ai-explains-never-decides.md), [PT-007](./PT-007-decision-terminal-is-the-outcome.md), [PT-008](./PT-008-every-decision-experience-produces-outcome.md), [Decision Architecture v1.0 Freeze](../decision-architecture-v1.0-freeze.md) |
| **Authorizes** | None — constrains every future capability |

> **Freeze note:** Decision Architecture v1.0 is **FROZEN**. This PT does not add foundational Decision Architecture concepts. It formalizes the presentation boundary already implied by Experience Context / Decision Outcome contracts and [AR-001](../review/AR-001-decision-architecture-v1.md).

---

## Purpose

Define the relationship between the Decision Engine and the user interface.

The Decision Architecture transforms an Object Package into a deterministic Decision Outcome through Runtime, Interpretation, Decision Story, and Decision Moves.

The user never interacts with those internal components directly.

The only visible manifestation of the platform is the Experience.

---

## Problem

Without a clear architectural boundary between semantic generation and user interaction:

- UI modules begin reconstructing semantics,
- presentation logic leaks into the Runtime,
- different clients expose different meanings,
- product consistency degrades.

The platform needs a single principle describing the relationship between the Decision Engine and the user interface.

---

## Thesis

**The Experience is the Product Surface.**

The Experience is the only surface through which users interact with the Decision Engine.

It presents semantic truth.

It never creates semantic truth.

---

## Architectural Principle

The Experience belongs to the **presentation boundary**.

It is driven entirely by canonical semantic contracts.

It consumes:

- Experience Context
- Decision Outcome

It never consumes internal Runtime structures directly.

Aligned with [PT-002](./PT-002-interpretation-is-the-product.md) (Interpretation → Projection → Experience), [PT-006](./PT-006-ai-explains-never-decides.md) (AI as presentation consumer), and [PT-008](./PT-008-every-decision-experience-produces-outcome.md) (Outcome as integration contract).

### Terminology

| Term | Meaning in this PT |
| --- | --- |
| **Experience** | The presentation surface (Client Studio, Embed, mobile, partner widget) and its modules |
| **Decision Experience** | The semantic journey composed of Decision Moves ([PT-005](./PT-005-decision-experience-composed-from-moves.md)) — rendered *by* the Experience, not authored by it |
| **Decision Terminal** | One Experience module / destination surface ([PT-007](./PT-007-decision-terminal-is-the-outcome.md)) |

---

## Canonical Flow

```text
House Package
        │
        ▼
Decision Runtime
        │
        ▼
Interpretation
        │
        ▼
Decision Story
        │
        ▼
Decision Moves
        │
        ▼
Experience Context
        │
        ▼
Decision Outcome
        │
        ▼
Experience
        │
        ├── Hero
        ├── House Navigator
        ├── Media Explorer
        ├── AI Advisor
        ├── Decision Terminal
        └── Lead Capture
```

Semantic generation ends at Experience Context / Decision Outcome.

Everything below that line is presentation.

---

## Experience Responsibilities

The Experience:

- visualizes semantic state,
- guides user interaction,
- renders Decision Story,
- presents Decision Moves,
- exposes Decision Outcome,
- forwards user intent to the Runtime.

It does **not**:

- interpret,
- prioritize,
- compose stories,
- generate outcomes.

---

## User Intent Principle

Every user interaction becomes an explicit Runtime command.

The Experience never mutates semantic state directly.

```text
User Action
      │
      ▼
Experience
      │
      ▼
Runtime Command
      │
      ▼
Decision Runtime
      │
      ▼
Updated Experience
```

---

## Consistency Principle

Every client presenting the same Experience Context and Decision Outcome must present the **same semantic meaning**.

Different layouts are allowed.

Different semantic interpretations are not.

---

## Benefits

This principle guarantees:

- consistent UX across channels,
- interchangeable presentation layers,
- deterministic behavior,
- simplified testing,
- future support for web, mobile, embedded widgets, and partner integrations.

---

## Invariants

The following MUST always remain true:

1. The Experience is the exclusive presentation surface of the Decision Engine.
2. Presentation consumes Experience Context and Decision Outcome only.
3. Presentation never consumes Runtime state, Interpretation, Signals, or Story internals as public contracts.
4. The Experience never mutates semantic state except by dispatching Runtime commands.
5. Identical Context + Outcome → identical semantic meaning across clients.
6. AI Advisor, Hero, Gallery, Terminal, and Lead Capture are Experience modules — not semantic authorities.

---

## Relationship to Architecture

| Document | Owns |
| --- | --- |
| **PT-009 (this document)** | Experience as exclusive product surface / presentation boundary |
| [PT-002](./PT-002-interpretation-is-the-product.md) | Interpretation as product meaning |
| [PT-004](./PT-004-decision-story-is-the-product.md) | Story as narrative product (engine-side) |
| [PT-005](./PT-005-decision-experience-composed-from-moves.md) | Moves as progression units |
| [PT-006](./PT-006-ai-explains-never-decides.md) | AI as Experience consumer |
| [PT-007](./PT-007-decision-terminal-is-the-outcome.md) | Terminal as destination surface |
| [PT-008](./PT-008-every-decision-experience-produces-outcome.md) | Outcome as portable artifact |
| [Decision Architecture v1.0 Freeze](../decision-architecture-v1.0-freeze.md) | Frozen foundations this PT constrains |
| ED-DA-01…04 | Enforcement of Context-only presentation contracts |

### Why this PT matters

Earlier PTs answer **what the engine produces**.

PT-009 answers **how humans are allowed to touch it**.

Without it, every client can invent a private path to Runtime internals — and semantic truth fragments.

---

## Acceptance Criteria

- The Experience is formally defined as the exclusive presentation surface of the Decision Engine.
- Presentation consumes canonical contracts only (Experience Context, Decision Outcome).
- Semantic generation remains entirely inside the Decision Architecture.

---

## CAP Mapping

**None.**

This PT does not authorize a capability.

It constrains every future capability.

---

## Success Criteria

Every future UI module, client application, or embedded experience follows the same rule:

**Present semantic truth.**

**Never generate semantic truth.**

---

## Related documents

- [PT-002 — Interpretation is the Product](./PT-002-interpretation-is-the-product.md)
- [PT-003 — Decision Sessions are Reproducible](./PT-003-decision-sessions-are-reproducible.md)
- [PT-004 — Decision Story is the Product](./PT-004-decision-story-is-the-product.md)
- [PT-005 — Decision Experience is Composed from Decision Moves](./PT-005-decision-experience-composed-from-moves.md)
- [PT-006 — AI Explains, Never Decides](./PT-006-ai-explains-never-decides.md)
- [PT-007 — Decision Terminal is the Outcome](./PT-007-decision-terminal-is-the-outcome.md)
- [PT-008 — Every Decision Experience Produces a Decision Outcome](./PT-008-every-decision-experience-produces-outcome.md)
- [Decision Architecture v1.0 Freeze](../decision-architecture-v1.0-freeze.md)
- [AR-001 — Decision Architecture Review v1.0](../review/AR-001-decision-architecture-v1.md)
- [RI-003 — Experience Kernel](../../04-reference-implementation/RI-003-Experience-Kernel.md)
- [Engineering Debt](../../implementation/Engineering%20Debt.md)
