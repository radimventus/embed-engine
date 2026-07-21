# Decision Experience Grammar (DEG)

**Status:** APPROVED  
**Version:** 1.0  
**Date:** 2026-07-21  
**Scope:** Product layer between stable architecture and concrete UX  
**SSOT for:** Decision Experience Grammar — how Embed Engine designs change in user decision-making  
**Not SSOT for:** Runtime, Session, Experience Kernel contracts, React, UI components, layout, Object Package, Behavior Pack structure

**Related**

- Product Vision: [product-vision.md](../vision/product-vision.md)
- Product Constitution: [product-constitution.md](../constitution/product-constitution.md)
- Post-Foundation policy: [post-foundation-development-policy.md](../post-foundation-development-policy.md)
- Decision Layer vocabulary (architecture): [../../architecture/decision-layer/README.md](../../architecture/decision-layer/README.md)
- Experience Kernel (impl contract): [../../04-reference-implementation/RI-003-Experience-Kernel.md](../../04-reference-implementation/RI-003-Experience-Kernel.md)
- First pilot story: [../../pilot/README.md](../../pilot/README.md)

---

## 1. Decision

Architecture stabilization is complete for Epoch I / II reference path:

- Runtime Kernel (RI-001)
- Decision Session (RI-002)
- Experience Kernel (RI-003)
- Cognitive Runtime
- Priority Experience
- Decision Terminal
- Commercial Readiness (pilot)

**Architecture is considered stable.**

Further evolution of Embed Engine is **product-led**, not architecture-led.

Architecture changes still require ADR. Product design no longer waits on architecture invention.

---

## 2. New principle

Embed Engine is **not** a system for presenting information.

Embed Engine is a system for **governing decision experience**.

| Not the goal | The goal |
| --- | --- |
| Present the object | Change how the user thinks about the object |
| Showcase media and specs | Reach an informed decision |

Canonical sentence (platform North Star):

> **We do not want to build the best real-estate configurator.**  
> **We want to build the best environment for changing a decision.**

This sentence is the primary product criterion for all future product decisions.

---

## 3. Layer stack (product → runtime)

```text
Product Vision
      ↓
Decision Experience Grammar     ← this SSOT
      ↓
Decision Story
      ↓
Experience Chapters
      ↓
Experience Modules
      ↓
UI Components
      ↓
Runtime
```

DEG sits **between** stable architecture and concrete UX.

It does **not** redefine Runtime, Session, or Experience Kernel Public Contracts.

---

## 4. What DEG defines — and does not

### DEG defines

The **language** used to design change in the user’s decision-making:

- Mental States
- Experience operations (psychological operations)
- Experience Chapters
- Design order and evaluation questions
- Decision Workspace authorship model
- Backlog prioritization for product work

### DEG does not define

- architecture
- implementation
- React
- UI components
- layout
- Runtime orchestration
- Behavior Pack schema (see Behavior Pack contract)

---

## 5. Basic paradigm — Mental State

The product is no longer designed by components.

It is no longer designed by screens.

It is designed by **change in the user’s mental state**.

The primary design unit is:

**Mental State**

Examples:

- Orientation
- Curiosity
- Understanding
- Confidence
- Commitment
- Decision

Every part of the product must exist to move the user from one Mental State to the next.

If a surface does not cause a Mental State transition, it is decoration — not Decision Experience.

---

## 6. Experience Grammar — psychological operations

DEG introduces psychological operations as the elementary building blocks of the product.

Initial set:

| Operation | Role (product meaning) |
| --- | --- |
| Orientation | Establish where the user is and what this journey is for |
| Focus | Narrow attention to what matters now |
| Discovery | Encounter object truth through exploration |
| Contrast | Make trade-offs visible |
| Evidence | Ground judgment in concrete facts |
| Reassurance | Reduce fear without hiding risk |
| Validation | Confirm the user’s emerging judgment |
| Recommendation | Offer a clear next interpretation |
| Commitment | Ask for an explicit stance |
| Confirmation | Lock the stance as Decision |
| Closure | Complete the chapter and hand off |

These operations are **not** UI components.

They are elementary operations of Decision Experience.

A Decision Story and its Experience Chapters are composed from these operations.

---

## 7. Experience Chapters

Experience Chapters are higher product units composed of psychological operations.

Initial structure:

1. **Orientation**
2. **Discovery**
3. **Prioritization**
4. **Decision**
5. **Commitment**
6. **Consultation**

Chapters map to product journey arcs — not to React section folders by name alone.

Current Client Studio pilot chapters (Orientation → Discovery → Prioritization → Decision → Commitment → Lead/Consultation) should be read through this grammar. UI naming may lag; DEG naming is authoritative for product design.

---

## 8. Mandatory design order

Every design must be created in this order:

```text
Desired Outcome
      ↓
Mental Transformation
      ↓
Experience Grammar
      ↓
Experience Chapter
      ↓
Experience Module
      ↓
UI Component
      ↓
Implementation
```

This order is **binding**.

**Never start with a component.**

If work begins as “we need a card / slider / panel,” it violates DEG until Desired Outcome and Mental Transformation are stated.

---

## 9. Decision Workspace

Client Studio is **not** a page editor or page builder.

New definition:

**Client Studio is a Decision Workspace.**

In a Decision Workspace the author does not design pages.

The author designs a **decision trajectory**.

Primary building blocks:

- Desired Outcome
- Mental State
- Experience Transition
- Experience Operation
- Experience Chapter

UI emerges as a **consequence** of that design — not as the starting point.

Builder / authoring product work must target this model. Page-builder metaphors are legacy.

---

## 10. Four questions (product quality gate)

Every part of Experience must answer:

1. What should the user **see** right now?
2. What should the user **understand** right now?
3. What should the user **feel** right now?
4. What **next action** is natural right now?

If any part cannot answer all four, it is not sufficiently designed.

---

## 11. Backlog prioritization

From this point, product backlog is prioritized by:

```text
Business Value
  ×  Pilot Experience
  ×  User Transformation
```

**Not** by technical components, package count, or UI novelty.

Architecture and Runtime work enter the backlog only when a product transformation requires them (see Post-Foundation Development Policy).

---

## 12. Relationship to Decision Layer (architecture)

| DEG (product) | Decision Layer (architecture) |
| --- | --- |
| Mental State / Experience Operation | Decision Move / Story / Strategy (execution vocabulary) |
| Experience Chapter | Product arc that may span one or more Stories |
| Decision Workspace authorship | Behavior Pack + Strategy composition (knowledge → Runtime) |
| Desired Outcome | Product intent; Outcome in Runtime is the executed result |

DEG does not replace Decision Layer SSOT.

DEG tells **why** and **in what psychological order** we compose experience.

Decision Layer tells **how** Runtime executes Story and Move.

---

## 13. Governance

- DEG is **APPROVED** product direction for Embed Engine.
- Conflicts with historical Product Bible presentation chapters: **DEG wins** for product design intent.
- Conflicts with Decision Layer / RI Public Contracts: **architecture SSOTs win** for contracts; raise ADR if product intent requires contract change.
- Future UX 2.0 work must start from Desired Outcome → Mental Transformation → Experience Grammar (this document).

---

## 14. One-line summary

**Embed Engine designs Mental State transitions; UI is only how those transitions become visible.**
