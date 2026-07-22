# PT-002 — Interpretation is the Product

| Field | Value |
| --- | --- |
| **ID** | PT-002 |
| **Title** | Interpretation is the Product |
| **Status** | Approved |
| **Type** | Platform Theory (PT) |
| **Version** | 0.1 |
| **Date** | 2026-07-22 |
| **Approved** | 2026-07-22 |
| **Owner** | Platform Architecture |
| **Scope** | Embed Engine Platform |
| **SSOT for** | Execution philosophy — Interpretation as the canonical platform product; Runtime → Interpretation → Projection → Experience model |
| **Not SSOT for** | Interpretation DTO schema (→ [ADR-012](../adr/ADR-012-interpretation-first-class-artifact.md) / CORE), Runtime Kernel API (→ [RI-001](../../04-reference-implementation/RI-001-Runtime-Kernel.md)), House Package schema (→ [HP-001](../../03-specification-standard/HP-001-House-Package-Specification.md)), Object Package product meaning (→ [object-package.md](../../product/object-package.md)) |
| **Depends on** | [PT-001](./PT-001-house-package-canonical-object-contract.md), [ADR-012](../adr/ADR-012-interpretation-first-class-artifact.md), [ADR-006](../adr/ADR-006-interpretation-projection-layer.md), [Object Package](../../product/object-package.md) |

---

## Approval Note

PT-002 v0.1 is **Approved** as platform theory for Interpretation as the product of Embed Engine.

It formalizes execution philosophy already established by Architecture Freeze, Object Package / House Package loading, Projection boundaries, [ADR-012](../adr/ADR-012-interpretation-first-class-artifact.md), and [ADR-013](../adr/ADR-013-room-selection-semantic.md). It does not invent new Runtime APIs.

---

## Purpose

Define the fundamental execution philosophy of Embed Engine.

The platform does not deliver Objects.

The platform does not deliver UI.

The platform delivers **Interpretations**.

Everything else exists to support this goal.

---

## Motivation

Traditional software exposes data.

Embed Engine exposes meaning.

The same Object may produce multiple valid Experiences without changing the Object itself.

Interpretation is therefore the **primary product** of the platform.

---

## Principle 1 — Objects are passive

Object Packages contain knowledge.

They never contain behavior.

They never execute decisions.

They never adapt themselves.

Objects describe.

They never interpret.

Aligned with [PT-001](./PT-001-house-package-canonical-object-contract.md) Principles 1 and 4.

---

## Principle 2 — Runtime creates meaning

Runtime combines:

- Object Package
- Runtime State
- Interpretation Rules

to produce an Interpretation.

Meaning does not exist inside the Object.

Meaning emerges during execution.

---

## Principle 3 — Interpretation precedes Experience

Every Experience originates from an Interpretation.

Never directly from data.

```text
Object
    ↓
Interpretation
    ↓
Experience
```

Removing Interpretation collapses the platform into a data viewer.

Aligned with [ADR-012](../adr/ADR-012-interpretation-first-class-artifact.md).

---

## Principle 4 — Experience is a projection

Experience is a projection of an Interpretation.

It is not the Interpretation itself.

Multiple Experiences may represent the same Interpretation.

Examples:

- desktop
- mobile
- AI conversation
- PDF
- voice interface

All may project identical Interpretation.

Aligned with [Experience Projection Principles](../experience-projection.md) and [ADR-006](../adr/ADR-006-interpretation-projection-layer.md).

---

## Principle 5 — Rendering is replaceable

Presentation technologies may change.

Examples:

- React
- Native
- VisionOS
- Voice
- AR

Interpretation remains unchanged.

---

## Principle 6 — Decisions belong to Runtime

All decision logic belongs to Runtime.

Never inside:

- components
- pages
- layouts
- widgets
- adapters

---

## Principle 7 — Inputs modify Runtime

Every interaction follows the same model:

```text
Input
    ↓
Runtime
    ↓
Interpretation
    ↓
Projection
    ↓
Experience
```

Input never modifies Experience directly.

Aligned with [ADR-013](../adr/ADR-013-room-selection-semantic.md) (Input Adapters emit semantic commands such as `selectRoom(roomId)`).

---

## Principle 8 — Interpretation is deterministic

Given identical:

- Object Package
- Runtime State
- Interpretation Rules

the Interpretation MUST always be identical.

This guarantees reproducibility.

---

## Principle 9 — Experiences are disposable

Experiences may be regenerated at any time.

They are projections.

Not sources of truth.

The Runtime remains authoritative.

---

## Principle 10 — Embed Engine is an Interpretation Platform

The platform should never be described as:

- UI framework
- visualization library
- CMS
- configurator

Its primary responsibility is:

> Transform structured domain knowledge into personalized decision interpretations.

Everything else supports this mission.

---

## Invariants

The following MUST always remain true:

1. Objects never execute.
2. Runtime owns decisions.
3. Interpretation owns meaning.
4. Projection owns translation.
5. Experience owns presentation.
6. Input Adapters never contain business logic.
7. Rendering technologies are replaceable.
8. Interpretation is reproducible.
9. Experiences are disposable.

---

## Relationship to Architecture

| Document | Owns |
| --- | --- |
| [Object Package](../../product/object-package.md) | Domain knowledge (product meaning) |
| [HP-001](../../03-specification-standard/HP-001-House-Package-Specification.md) | House Package schema / distribution |
| [PT-001](./PT-001-house-package-canonical-object-contract.md) | Canonical Object Contract |
| **PT-002 (this document)** | Interpretation execution philosophy |
| [PT-003](./PT-003-decision-sessions-are-reproducible.md) | Decision Session reproducibility philosophy |
| [ADR-012](../adr/ADR-012-interpretation-first-class-artifact.md) | Interpretation as first-class domain artifact |
| [ADR-013](../adr/ADR-013-room-selection-semantic.md) | Semantic Room Selection |
| [RI-001](../../04-reference-implementation/RI-001-Runtime-Kernel.md) | Runtime Kernel public contract |

### Why this PT matters

PT-001 answered: **What is the canonical contract of an Object?**

PT-002 answers: **What is the actual product produced by the platform?**

The answer is not “an Experience.”

The answer is an **Interpretation**.

Experiences are merely one possible projection of that Interpretation.

---

## Canonical Platform Pipeline

```text
Object Package
        ↓
Loader
        ↓
Runtime State
        ↓
Interpretation
        ↓
Projection
        ↓
Experience
        ↓
Presentation
```

---

## Related documents

- [PT-001 — House Package as the Canonical Object Contract](./PT-001-house-package-canonical-object-contract.md)
- [PT-003 — Decision Sessions are Reproducible](./PT-003-decision-sessions-are-reproducible.md)
- [Object Package — Product Contract](../../product/object-package.md)
- [HP-001 — House Package Specification](../../03-specification-standard/HP-001-House-Package-Specification.md)
- [ADR-012 — Interpretation as first-class artifact](../adr/ADR-012-interpretation-first-class-artifact.md)
- [ADR-013 — Room Selection is Semantic, not Graphical](../adr/ADR-013-room-selection-semantic.md)
- [ADR-006 — Interpretation & Projection Layer](../adr/ADR-006-interpretation-projection-layer.md)
- [Experience Projection Principles](../experience-projection.md)
- [Architecture Freeze v0.1](../../releases/Architecture%20Freeze%20v0.1.md)
