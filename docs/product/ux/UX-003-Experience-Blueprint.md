# UX-003 — Experience Blueprint

## Status

**Status:** Proposed Product Specification  
**Version:** 1.0  
**Date:** 2026-07-21  
**ID:** UX-003  
**Layer:** UX 2.0 — Experience Blueprint (canonical product specification)  
**Not SSOT for:** wireframes, layout, components, Runtime, Kernel, Blueprint Schema, serialization, Rendering, Decision State, Interpretation, Event Pipeline, Client Studio implementation

**Navazuje na:**

- [UX-001 — Decision Workspace Philosophy](./UX-001-Decision-Workspace-Philosophy.md)
- [UX-002 — Decision Workspace Meta-Model](./UX-002-Decision-Workspace-Meta-Model.md)
- [Decision Experience Grammar (DEG)](../decision-experience-grammar/DEG.md)

---

## 1. Purpose

Experience Blueprint defines the **canonical product specification** of a Decision Experience.

The Experience Blueprint serves as the single source of truth for a product-specific Decision Experience.
It specifies what the Experience is intended to be, independently of its implementation or runtime execution.

| Document | Answers |
| --- | --- |
| **UX-001** | *Why* Decision Workspace exists |
| **UX-002** | *How* Workspace is modelled (Sections, Tools) |
| **UX-003** | *What* a concrete Decision Experience is (canonical product specification) |

---

## 2. Scope

This document is a **product specification**.

It defines:

- what an Experience Blueprint is
- what the Blueprint is responsible for
- what the Blueprint is not responsible for
- the Blueprint Contract (five mandatory parts)
- Blueprint principles
- the conceptual Blueprint lifecycle
- relationship to UX-001 → UX-005

It does **not** define:

- serialization or file schema
- Runtime consumption mechanisms
- validators, APIs, or storage
- UI or Client Studio implementation

---

## 3. Experience Blueprint

### 3.1 Definition

An **Experience Blueprint** is the canonical product specification of a Decision Experience.

It defines the intended identity, structure, composition, prerequisites and expected outcomes of the Experience independently of implementation.

The Blueprint is declarative.

It specifies **what** the Experience is, not **how** it is executed.

### 3.2 Responsibilities

The Experience Blueprint:

- defines the canonical product specification
- defines the intended Decision Experience
- defines the structural composition
- references Sections and Tool Contracts
- specifies required prerequisites
- defines expected outcomes

| Responsibility | Meaning |
| --- | --- |
| **Canonical specification** | single product SSOT for this Decision Experience |
| **Intended experience** | what the Experience is meant to achieve for the decision-maker |
| **Structural composition** | which Sections form the stable mental map |
| **Contract references** | which Section / Tool Contracts are used (UX-004 / UX-005) |
| **Prerequisites** | product assumptions required before the Experience can fulfil its intent |
| **Outcomes** | intended product results of a well-run Experience |

### 3.3 Non-Responsibilities

The Blueprint does **not** define:

- Runtime execution
- Rendering
- Decision State
- Interpretation
- Event Pipeline
- Kernel behavior
- Client Studio implementation
- Blueprint serialization format

The last point is deliberate:

> Product specification ≠ Platform serialization.

UX-003 owns the product meaning of the Blueprint.
Platform Architecture owns Schema, serialization, and execution.

---

## 4. Blueprint Contract

The Experience Blueprint has **five mandatory parts**.

```text
Experience Blueprint
├── Identity
├── Structure
├── Composition
├── Prerequisites
└── Outcomes
```

### 4.1 Identity

Describes the identity of the Experience.

Examples:

- Experience ID
- Name
- Version
- Product

Identity answers: *which Decision Experience is this?*

### 4.2 Structure

Defines **Sections**.

Not their implementation.

Structure answers: *which stable decision spaces form the mental map?*

Uses the Section vocabulary from UX-002 (for example Header, Hero, Tour, Priority, Racio, Audit, Closing).

Structure references Section Contracts (UX-004) — it does not invent Section internals.

### 4.3 Composition

Defines the **Tool Contracts** used.

Not their internal behaviour.

Composition answers: *which Tools realise each Section’s purpose?*

Composition references Tool Contracts (UX-005).
Tools remain replaceable; Section purpose remains stable (UX-002).

### 4.4 Prerequisites

Defines **product prerequisites** for the Experience.

Examples:

- Assets
- Metadata
- Geometry
- Decision Matrix
- Knowledge Sources

Prerequisites answer: *what must exist for this Experience to be productively valid?*

They are product assumptions — not Runtime checks, not engineering tickets.

### 4.5 Outcomes

Defines the **expected product outcomes** of the Experience.

Examples:

- Lead Generated
- Reservation
- Comparison Completed
- Decision Confidence Increased

Outcomes answer: *what should a successful Experience achieve?*

This is **not analytics**.

This is **product intent**.

Outcomes align with UX-001 — Decision Before Conversion:
conversion may appear as an outcome, but only as a consequence of a well-supported decision.

---

## 5. Blueprint Principles

### Canonical

The Blueprint is the canonical product specification of a Decision Experience.

### Declarative

The Blueprint describes *what* the Experience is.
It does not describe *how* Runtime executes it.

### Composable

The Experience is assembled from Sections and Tools.
Assembly is intentional — not a side effect of UI.

### Product-specific

Each Blueprint expresses a concrete product intent.
It is not a universal “default page”.

### Stable

The Blueprint respects Structural Stability (UX-001 / UX-002).
It does not rebuild the Section map per visit.
Adaptation belongs to interpretation of Tool content — not to rewriting the Blueprint on every run.

### Extensible

New Tools can be added without changing the Workspace model.
A new Section appears only with a new decision purpose — not because a new component exists.

---

## 6. Blueprint Lifecycle

Conceptual lifecycle (no technical detail):

```text
Authoring
    ↓
Validation
    ↓
Publication
    ↓
Runtime Consumption
```

| Stage | Product meaning |
| --- | --- |
| **Authoring** | Product authors the Blueprint Contract (Identity → Outcomes) |
| **Validation** | Composition is checked against UX-002 and Section / Tool Contracts (UX-004 / UX-005) |
| **Publication** | The Blueprint becomes an available Decision Experience |
| **Runtime Consumption** | Platform executes the Experience — outside UX-003 |

Lifecycle describes the product flow of the artefact.
It does not describe schema, API, storage, or algorithms.

---

## 7. Relationship

```text
UX-001 → UX-002 → UX-003 → UX-004 → UX-005
```

| Document | Role |
| --- | --- |
| **UX-001** | Decision Workspace Philosophy |
| **UX-002** | Decision Workspace Meta-Model |
| **UX-003** | Experience Blueprint (Product Specification) |
| **UX-004** | Section Contract |
| **UX-005** | Tool Contract |

UX-006 (Experience Flow) remains a separate specification of decision progression — outside the Blueprint → Contract axis.

### Reference diagram

```text
Decision Workspace Philosophy
            │
            ▼
Decision Workspace Meta-Model
            │
            ▼
Experience Blueprint
(Product Specification)
            │
      ┌─────┴─────┐
      ▼           ▼
Section Contract  Tool Contract
```

This diagram assigns responsibility across UX documents and prepares UX-004 / UX-005.

### Continuity

- UX-001: why Workspace exists
- UX-002: Sections vs Tools, Structural Model
- UX-003: canonical product specification of a Decision Experience
- UX-004 / UX-005: contracts referenced by Structure and Composition

---

## 8. Out of Scope

This document does **not** define:

- Blueprint Schema
- Serialization
- Runtime execution
- Rendering
- Kernel
- Decision State
- Interpretation
- Event Pipeline
- Client Studio implementation

Also out of scope:

- wireframes and layout
- frontend components
- Section Contract detail (UX-004)
- Tool Contract detail (UX-005)
- Experience Flow (UX-006)

---

## Governance

- UX-003 is the **v1.0** Proposed product specification for Experience Blueprint.
- Vocabulary: Experience Blueprint, Blueprint Contract, Identity, Structure, Composition, Prerequisites, Outcomes.
- The Blueprint is the canonical product SSOT for a Decision Experience.
- Conflicts “Blueprint = Runtime config / schema / serialization”: **Out of Scope** — Platform Architecture.
- Conflicts “Blueprint = wireframe / page”: **UX-003 wins** (Blueprint = product specification).
- Conflicts “Blueprint defines Tool internals”: **UX-005 wins** (Blueprint only references Tool Contracts).
