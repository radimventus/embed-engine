# PT-005 — Decision Experience is Composed from Decision Moves

| Field | Value |
| --- | --- |
| **ID** | PT-005 |
| **Title** | Decision Experience is Composed from Decision Moves |
| **Status** | Proposed |
| **Type** | Platform Theory (PT) / Product Thesis |
| **Version** | 0.1 |
| **Date** | 2026-07-22 |
| **Owner** | Platform Architecture |
| **Scope** | Embed Engine Platform |
| **SSOT for** | Decision Move as the smallest semantic progression unit; Decision Story composition through ordered Moves; interaction semantics vs presentation; analytics and AI consumption principles for Moves |
| **Not SSOT for** | Decision Move DTO / engine API (→ CAP-DST-002), Decision Layer vocabulary schema detail (→ [decision-layer/](../decision-layer/README.md)), Behavior Pack Move libraries, UI screen definitions |
| **Depends on** | [PT-001](./PT-001-house-package-canonical-object-contract.md), [PT-002](./PT-002-interpretation-is-the-product.md), [PT-003](./PT-003-decision-sessions-are-reproducible.md), [PT-004](./PT-004-decision-story-is-the-product.md), [ADR-009](../adr/ADR-009-decision-layer.md), [Decision Layer](../decision-layer/README.md) |
| **Authorizes** | [CAP-DST-002 — Decision Move Engine](#cap-mapping) |

> **Numbering note:** PT-004 is already allocated to [Decision Story is the Product](./PT-004-decision-story-is-the-product.md). This thesis is therefore registered as **PT-005**.

---

## Purpose

Extend the product thesis from Decision Story ([PT-004](./PT-004-decision-story-is-the-product.md)) to **interaction progression**.

The Embed Engine produces a deterministic Decision Story that explains the current interpretation of an object.

A Story alone is not an interaction model.

Users progress through a decision by completing a sequence of meaningful decision steps.

This document defines **Decision Moves** as those steps.

---

## Problem

A Decision Story provides explanation.

It does not define interaction.

Without a structured interaction model:

- Experiences become long static narratives,
- Navigation becomes presentation-driven,
- AI has no semantic progression,
- Analytics cannot measure decision progress.

The platform explains decisions but does not orchestrate them.

---

## Thesis

Every Decision Experience is composed from an ordered sequence of **Decision Moves**.

A Decision Move is the smallest meaningful semantic step that advances the user's decision.

The Experience is the ordered composition of those Moves.

Aligned with Decision Layer vocabulary ([decision-layer/](../decision-layer/README.md)): Story = ordered Moves; Strategy composes the Story; Terminal renders it.

---

## Architectural Principle

Decision Moves belong to the **semantic layer**.

Not to:

- Hero
- Gallery
- Navigator
- AI Advisor
- Decision Terminal

Presentation **renders** Moves.

It never defines them.

---

## Canonical Flow

```text
Object Package
        │
        ▼
Priority Signals
        │
        ▼
Interpretation Rules
        │
        ▼
Decision Focus
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
        ├── Hero
        ├── Navigator
        ├── Gallery
        ├── AI Advisor
        ├── Decision Terminal
        └── Analytics
```

Decision Moves express the Story as an executable progression.

Experience Context exposes the active Move and its successors.

Presentation never invents the Move graph.

---

## Decision Move Responsibilities

A Decision Move defines:

- semantic objective
- required context
- recommended action
- completion criteria
- successor move

A Move represents **meaning**.

It is not a UI screen.

---

## Required Properties

Decision Moves MUST be:

| Property | Meaning |
| --- | --- |
| **Deterministic** | Identical semantic inputs → identical Move sequence |
| **Composable** | Ordered into Stories; reusable across Experiences |
| **Resumable** | Restorable from Decision Session history ([PT-003](./PT-003-decision-sessions-are-reproducible.md)) |
| **Explainable** | Objective, action, and completion criteria are machine-readable |
| **Presentation-independent** | No layout, route, or chrome ownership |
| **Analytics-friendly** | Completion is a first-class measurable event |

---

## Story Composition

A Decision Story is expressed as an ordered sequence of Decision Moves.

Example:

```text
Understand priorities
        ↓
Evaluate disposition
        ↓
Inspect outdoor space
        ↓
Compare operating costs
        ↓
Confirm recommendation
```

The Story determines **why**.

The Moves determine **how**.

Aligned with [PT-004](./PT-004-decision-story-is-the-product.md): Story is the canonical narrative; Moves are its progression units.

---

## Analytics Principle

Analytics records completed Decision Moves.

Not page views.

Not clicks.

The primary behavioral unit is the **Decision Move**.

---

## AI Principle

AI may explain a Move.

AI never creates canonical Moves.

Moves originate from the deterministic engine.

Aligned with [PT-004](./PT-004-decision-story-is-the-product.md) AI Principle: semantic truth originates from the deterministic engine; LLM elaborates, never authors.

---

## Consequences

1. Every Experience module references the same **active Decision Move**.
2. Navigation, Hero, AI, and Decision Terminal remain synchronized.
3. No module invents its own interaction flow.
4. Analytics and Behavior Packs observe Move completion, not presentation events.
5. Changing presentation technology does not change Move identity or order.

---

## Benefits

Decision Moves become the canonical unit for:

- Experience progression
- Analytics
- AI conversations
- Decision Terminal
- Behavior Packs
- Future adaptive Experiences

---

## Invariants

The following MUST always remain true:

1. Presentation never authors Moves.
2. AI never authors canonical Moves.
3. A Decision Story is an ordered composition of Decision Moves.
4. There is exactly one active Move for a given Runtime progression cursor.
5. Move completion is deterministic given completion criteria and Runtime state.
6. Experience Context exposes Moves; modules consume them.

---

## Relationship to Architecture

| Document | Owns |
| --- | --- |
| [PT-004](./PT-004-decision-story-is-the-product.md) | Decision Story as canonical narrative |
| **PT-005 (this document)** | Decision Moves as Experience composition / progression |
| [Decision Layer](../decision-layer/README.md) | Vocabulary SSOT — Move · Story · Strategy · Terminal |
| [ADR-009](../adr/ADR-009-decision-layer.md) | Decision Layer definitions freeze |
| CAP-DST-001 | Decision Story Engine |
| CAP-DST-002 | Decision Move Engine (authorized here) |
| [PT-006](./PT-006-ai-explains-never-decides.md) | AI explains Moves; never authors them |

### Why this PT matters

PT-004 answered: **What narrative does the platform produce?**

PT-005 answers: **How does the user advance through that narrative?**

The answer is not “screens” or “clicks.”

The answer is an ordered sequence of **Decision Moves**.

---

## Acceptance Criteria

The platform defines Decision Move as the smallest semantic progression unit.

- A Decision Story is composed of ordered Decision Moves.
- Presentation consumes Moves.
- Analytics measures Moves.
- AI explains Moves.

---

## CAP Mapping

This PT **authorizes**:

### CAP-DST-002 — Decision Move Engine

Implement the deterministic Decision Move Engine that:

- expresses Decision Story as an ordered Move sequence,
- defines objective, context, action, completion criteria, and successor for each Move,
- exposes active Move through Experience Context,
- remains presentation-independent and AI-independent,
- enables Analytics to record Move completion as the primary behavioral unit.

---

## Success Criteria

The Experience evolves from presenting information to orchestrating a guided decision journey through deterministic semantic steps.

---

## Related documents

- [PT-001 — House Package as the Canonical Object Contract](./PT-001-house-package-canonical-object-contract.md)
- [PT-002 — Interpretation is the Product](./PT-002-interpretation-is-the-product.md)
- [PT-003 — Decision Sessions are Reproducible](./PT-003-decision-sessions-are-reproducible.md)
- [PT-004 — Decision Story is the Product](./PT-004-decision-story-is-the-product.md)
- [PT-006 — AI Explains, Never Decides](./PT-006-ai-explains-never-decides.md)
- [Decision Layer vocabulary](../decision-layer/README.md)
- [ADR-009 — Decision Layer](../adr/ADR-009-decision-layer.md)
- [Behavior Pack Contract](../behavior-pack-contract.md)
