# PT-004 — Decision Story is the Product

| Field | Value |
| --- | --- |
| **ID** | PT-004 |
| **Title** | Decision Story is the Product |
| **Status** | Proposed |
| **Type** | Platform Theory (PT) / Product Thesis |
| **Version** | 0.1 |
| **Date** | 2026-07-22 |
| **Owner** | Platform Architecture |
| **Scope** | Embed Engine Platform |
| **SSOT for** | Decision Story as the canonical semantic narrative of the current decision state; narrative ownership vs presentation and AI; story position in the interpretation pipeline |
| **Not SSOT for** | Decision Story DTO / engine API (→ CAP-DST-001), Session Experience schema (→ Runtime projection), AI Advisor UX, Decision Report layout |
| **Depends on** | [PT-001](./PT-001-house-package-canonical-object-contract.md), [PT-002](./PT-002-interpretation-is-the-product.md), [PT-003](./PT-003-decision-sessions-are-reproducible.md), [ADR-012](../adr/ADR-012-interpretation-first-class-artifact.md), [ADR-006](../adr/ADR-006-interpretation-projection-layer.md) |
| **Authorizes** | [CAP-DST-001 — Decision Story Engine](#cap-mapping) |

> **Numbering note:** PT-003 is already allocated to [Decision Sessions are Reproducible](./PT-003-decision-sessions-are-reproducible.md). This thesis is therefore registered as **PT-004**.

---

## Purpose

Extend the product thesis of Embed Engine beyond Interpretation and Decision Focus.

The platform already:

- interprets an Object through deterministic Priority Signals and Interpretation Rules,
- exposes a canonical Decision Focus that identifies what deserves attention.

Users do not make decisions from isolated facts.

They make decisions from **coherent explanations**.

This document defines **Decision Story** as the canonical semantic explanation of the current interpretation.

---

## Problem

Knowing what is important is insufficient.

The Experience must also explain:

- why it is important,
- how it relates to the user's priorities,
- what should be considered next.

Without a structured explanation:

- Hero becomes a headline without context,
- AI generates explanations independently,
- Recommendations appear disconnected,
- the Experience loses narrative continuity.

---

## Thesis

The product of Embed Engine is not the Object.

The product is the **Decision Story** generated from the Object.

The Decision Story is the canonical explanation of the current interpretation.

It transforms semantic interpretation into a coherent decision narrative.

Aligned with [PT-002](./PT-002-interpretation-is-the-product.md): Interpretation owns meaning; Decision Story owns the **narrative of that meaning**.

---

## Architectural Principle

Decision Story belongs to the **semantic layer**.

Not to:

- Hero
- Gallery
- Navigator
- AI Advisor
- Decision Terminal

Presentation modules **render** the Story.

They never create it.

---

## Canonical Flow

```text
Object Package
        │
        ▼
Decision Runtime
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
Session Interpretation
        │
        ▼
Experience Context
        │
        ├── Hero
        ├── Gallery
        ├── AI Advisor
        ├── Decision Terminal
        └── Decision Report
```

Decision Story is produced after Decision Focus and before Experience Context projection.

It is part of Session Interpretation meaning — not a presentation concern.

---

## Decision Story Responsibilities

Decision Story defines:

- primary explanation
- ordered supporting arguments
- recommendation sequence
- semantic transitions
- next decision step

It does **not** render content.

It does **not** perform AI reasoning.

---

## Required Properties

Decision Story MUST be:

| Property | Meaning |
| --- | --- |
| **Deterministic** | Identical semantic inputs → identical Story |
| **Reproducible** | Replayable from Decision Session history ([PT-003](./PT-003-decision-sessions-are-reproducible.md)) |
| **Explainable** | Machine-readable reasons and ordered arguments |
| **Composable** | Built from Object + Signals + Interpretation + Focus |
| **Presentation-independent** | No UI, layout, or chrome ownership |
| **AI-independent** | No LLM authorship of canonical narrative |

---

## Story Composition

A Decision Story is composed from:

- Object characteristics
- Priority Signals
- Interpretation outputs
- Decision Focus

Changing any of these inputs may produce a different Story.

Changing presentation **never** may.

---

## AI Principle

AI never invents the Decision Story.

AI **consumes** the Decision Story.

The LLM may:

- explain,
- summarize,
- elaborate,
- answer questions,

but never determine the canonical reasoning.

The semantic truth always originates from the deterministic engine.

Aligned with [PT-002](./PT-002-interpretation-is-the-product.md) Principle 8 (Interpretation is deterministic) and the living Experience rule that renderers do not invent meaning.

---

## Consequences

1. Every Experience module receives the **same** explanation.
2. There is exactly **one** canonical narrative for a given Runtime state.
3. No module constructs its own reasoning independently.
4. Hero, Gallery, AI Advisor, Decision Terminal, and Decision Report are narrative **consumers**.
5. Behavior Packs and analytics may observe Story identity without re-deriving narrative.

---

## Benefits

Decision Story becomes the semantic backbone for:

- Hero messaging
- Recommendation ordering
- AI Advisor
- Decision Report
- Decision Terminal
- Analytics
- Future Behavior Packs

---

## Invariants

The following MUST always remain true:

1. Objects never author Stories.
2. Presentation never authors Stories.
3. AI never authors the canonical Story.
4. Decision Story is deterministic given Object + Runtime State + Rules + Signals + Focus.
5. Experience Context exposes Story; modules do not invent parallel narratives.
6. Changing presentation technology does not change Story identity.

---

## Relationship to Architecture

| Document | Owns |
| --- | --- |
| [PT-001](./PT-001-house-package-canonical-object-contract.md) | Canonical Object Contract |
| [PT-002](./PT-002-interpretation-is-the-product.md) | Interpretation as product / meaning |
| [PT-003](./PT-003-decision-sessions-are-reproducible.md) | Session reproducibility |
| **PT-004 (this document)** | Decision Story as canonical narrative |
| CAP-DST-001 | Decision Story Engine (implementation) |
| [PT-005](./PT-005-decision-experience-composed-from-moves.md) | Decision Moves as Experience composition |

### Why this PT matters

PT-002 answered: **What meaning does the platform produce?**

PT-004 answers: **How is that meaning explained as a decision narrative?**

The answer is not “Hero copy” or “AI chat.”

The answer is a **Decision Story**.

---

## Acceptance Criteria

The platform defines Decision Story as the canonical semantic explanation of the current decision state.

- Presentation modules consume it.
- AI consumes it.
- No presentation layer generates its own narrative.

---

## CAP Mapping

This PT **authorizes**:

### CAP-DST-001 — Decision Story Engine

Implement the deterministic Decision Story Engine that:

- composes Story from Object characteristics, Priority Signals, Interpretation outputs, and Decision Focus,
- attaches Story to Session Interpretation / Experience Context,
- remains presentation-independent and AI-independent,
- enables Hero, Gallery, AI Advisor, Decision Terminal, and Decision Report to consume one narrative.

**Implementation status:** Done in `@embed-engine/runtime` (`session/decision-story`, wired through `interpretDecisionSession` → `ExperienceContext.decision.story`).

---

## Success Criteria

The Embed Engine no longer produces only an interpreted Experience.

It produces a **deterministic decision narrative** that every module presents consistently.

---

## Related documents

- [PT-001 — House Package as the Canonical Object Contract](./PT-001-house-package-canonical-object-contract.md)
- [PT-002 — Interpretation is the Product](./PT-002-interpretation-is-the-product.md)
- [PT-003 — Decision Sessions are Reproducible](./PT-003-decision-sessions-are-reproducible.md)
- [PT-005 — Decision Experience is Composed from Decision Moves](./PT-005-decision-experience-composed-from-moves.md)
- [ADR-012 — Interpretation as first-class artifact](../adr/ADR-012-interpretation-first-class-artifact.md)
- [ADR-006 — Interpretation & Projection Layer](../adr/ADR-006-interpretation-projection-layer.md)
- [Experience Projection Principles](../experience-projection.md)
- [Object Package — Product Contract](../../product/object-package.md)
