# UX-004 — Section Contract

## Status

**Status:** Final Product Specification  
**Version:** 1.0  
**Date:** 2026-07-21  
**ID:** UX-004  
**Layer:** UX 2.0 — Section Contract  
**Not SSOT for:** Runtime, Kernel, Rendering, UI, layout, Tool implementation, Platform contracts, Blueprint Schema, Client Studio implementation

**Navazuje na:**

- [UX-001 — Decision Workspace Philosophy](./UX-001-Decision-Workspace-Philosophy.md)
- [UX-002 — Decision Workspace Meta-Model](./UX-002-Decision-Workspace-Meta-Model.md)
- [UX-003 — Experience Blueprint](./UX-003-Experience-Blueprint.md)

---

## 1. Purpose

### Definition

This document defines the **canonical product contract** of a Workspace Section.

A **Section Contract** specifies the purpose, responsibilities and composition boundaries of a reusable decision space within a Decision Workspace.

It serves as the reusable specification referenced by Experience Blueprints (UX-003).

### Goal

Provide a stable contract that allows Sections to be reused consistently across multiple Decision Experiences without redefining their responsibilities.

| Document | Answers |
| --- | --- |
| **UX-001** | *Why* Workspace exists |
| **UX-002** | *How* Workspace is modelled (Section vs Tool) |
| **UX-003** | *What* a Decision Experience is (Blueprint) |
| **UX-004** | *What* a Section is allowed / required to be (Section Contract) |

---

## 2. Scope

This document defines:

- Section identity
- Purpose
- Responsibilities
- Composition boundaries
- Prerequisites
- Outcomes

This document does **not** define:

- Runtime behaviour
- Rendering
- UI implementation
- Layout
- Tool implementation
- Platform contracts

---

## 3. Section Contract

### 3.1 Definition

A **Section Contract** is the canonical product specification of a Workspace Section.

It defines what the Section exists to accomplish, what it may contain, what it requires, and what decision outcome it is intended to produce.

The contract is implementation-independent.

It does not invent a new Workspace model.
It binds the Section concept from UX-002 into a reusable product contract.

### 3.2 Responsibilities

A Section Contract:

- defines the role of the Section
- defines its decision purpose
- defines composition boundaries
- references Tool Contracts
- defines prerequisites
- defines expected outcomes

### 3.3 Non-Responsibilities

A Section Contract does **not** define:

- rendering
- runtime execution
- interaction logic
- visual layout
- implementation of Tools
- platform behaviour

---

## 4. Section Contract Model

Every Section Contract consists of **six mandatory parts**.

```text
Section Contract
├── Identity
├── Purpose
├── Responsibilities
├── Composition Boundary
├── Prerequisites
└── Outcomes
```

### 4.1 Identity

Defines:

- Section ID
- Name
- Version
- Category

Purpose: provide a stable identity for referencing the Section from Experience Blueprints and Tool Contracts.

### 4.2 Purpose

Defines **why this Section exists**.

Purpose is a decision purpose — not a UI label.

Examples:

| Section | Purpose |
| --- | --- |
| **Hero** | Orientation |
| **Priority** | Prioritization |
| **Audit** | Verification |

Purpose must remain stable across products (UX-001 — Structural Stability).

### 4.3 Responsibilities

Defines the **decision responsibilities** of the Section.

Example — Priority:

- presents decision priorities
- supports comparison
- explains differentiators

Responsibilities describe what the Section is accountable for in the decision process.
They do not describe widgets, panels, or screens.

### 4.4 Composition Boundary

Defines **what kinds of Tool Contracts** may belong to this Section.

It defines **categories**, not concrete Tools.

Example — Priority may contain:

- Decision Tools
- Comparison Tools
- Summary Tools

It should not contain unrelated Tool categories.

Composition Boundary protects Sections vs Tools (UX-002):

- Section purpose stays stable
- Tools stay replaceable inside the allowed categories

Concrete Tools are specified by Tool Contracts (UX-005) and selected by Experience Blueprints (UX-003).

### 4.5 Prerequisites

Defines the **product-level information** required before the Section can be composed.

Examples:

- Assets
- Metadata
- Geometry
- Decision Matrix
- Knowledge Sources

Prerequisites are product assumptions — not Runtime checks and not engineering tickets.

They must not hard-code a single vertical.
A Section Contract may require *a class of* knowledge (for example Decision Matrix), not a house-specific field list.

### 4.6 Outcomes

Defines the **intended decision outcome** after the user completes this Section.

Examples:

| Section | Outcome |
| --- | --- |
| **Hero** | understands the offer |
| **Priority** | understands differentiators |
| **Audit** | is ready to contact |

These are **product outcomes**, not analytics metrics.

They align with UX-001 — Decision Before Conversion:
contact readiness may be an outcome of Audit; conversion is a consequence of a supported decision, not the Section’s UI goal.

---

## 5. Section Principles

Every Section Contract follows these principles.

### Purpose-driven

Every Section exists to solve **one** decision problem.

### Stable

Its responsibility remains stable across products.

### Composable

Sections are assembled into Experiences through Experience Blueprints (UX-003).

### Tool-agnostic

A Section defines boundaries, not concrete implementations.

### Outcome-oriented

Every Section is responsible for producing a clear decision outcome.

---

## 6. Relationship

```text
UX-001
Decision Workspace Philosophy
        │
        ▼
UX-002
Decision Workspace Meta-Model
        │
        ▼
UX-003
Experience Blueprint
(Product Specification)
        │
   references
        ▼
UX-004
Section Contract
        │
   references
        ▼
UX-005
Tool Contract
```

### Architectural rules (ADR)

#### Rule 1

Experience Blueprints **reference** Section Contracts.

They **never redefine** Sections.

#### Rule 2

Section Contracts **reference** Tool Contracts.

They **never define** Tool implementations.

These rules keep the specification hierarchy free of duplication:

```text
Blueprint → Section Contract → Tool Contract
```

---

## 7. Out of Scope

This document intentionally excludes:

- Runtime
- Kernel
- Rendering
- Event Pipeline
- Decision State
- Interpretation
- Blueprint Schema
- Platform Contracts
- Client Studio implementation

Also out of scope:

- wireframes and layout
- concrete Tool catalogues beyond category boundaries
- Experience Flow (UX-006)

---

## Appendix A — Applicability check

Reference Section set from UX-002:

Header · Hero · Tour · Priority · Racio · Audit · Closing

| Section | Purpose | Composition Boundary (categories) | Outcome |
| --- | --- | --- | --- |
| **Header** | Orientation in Workspace | Navigation Tools, Context Tools | knows where they are |
| **Hero** | Orientation to the offer | Framing Tools, Entry Tools | understands the offer |
| **Tour** | Object discovery | Media Tools, Spatial Tools, Navigator Tools | has seen the object |
| **Priority** | Prioritization | Decision Tools, Comparison Tools, Summary Tools | understands differentiators |
| **Racio** | Rational understanding | FAQ Tools, Dialogue Tools, Documentation Tools, Calculator Tools | can justify the direction |
| **Audit** | Verification | Form Tools, Recommendation Tools, Report Tools | is ready to contact |
| **Closing** | Continuity / exit | Summary Tools, Next-step Tools | leaves with a clear state |

### Findings

- All reference Sections can fill the six mandatory parts.
- Composition Boundaries use **Tool categories**, not concrete Tools — avoids locking the contract to one vertical.
- Prerequisites remain class-level (Assets, Metadata, Geometry, Decision Matrix, Knowledge Sources) — not house-specific fields.
- Audit outcome is **readiness**, not forced conversion UI — consistent with UX-001.
- Each reference Section can be validated against Appendix B before being referenced by a Blueprint as finalized.

---

## Appendix B — Completeness Checklist

### Purpose

This checklist defines the minimum criteria that every Section Contract must satisfy before it can be considered complete.

It serves as a validation mechanism for future Section Contracts and ensures consistency across all Decision Experiences.

UX-004 is therefore **self-validating**:
it defines not only the structure of a Section Contract,
but also the objective criteria by which a concrete contract
(for example Hero Contract or Priority Contract) can be judged complete.

### Validation Checklist

| Criterion | Description | Status |
| --- | --- | --- |
| **Identity** | The Section has a stable identity (ID, Name, Version, Category). | ✅ |
| **Purpose** | The decision purpose is explicitly defined. | ✅ |
| **Responsibilities** | Responsibilities are clearly described and implementation-independent. | ✅ |
| **Composition Boundary** | Allowed Tool categories are defined without referencing concrete implementations. | ✅ |
| **Prerequisites** | Required product prerequisites are explicitly declared. | ✅ |
| **Outcomes** | Expected decision outcomes are clearly defined. | ✅ |
| **Platform Independence** | No Runtime, Kernel, Rendering or Platform Architecture concepts are included. | ✅ |
| **Tool References** | The Section references Tool Contracts rather than defining Tools directly. | ✅ |
| **Reusability** | The contract can be reused across multiple products and Experience Blueprints. | ✅ |
| **Implementation Independence** | No UI, layout or implementation details are specified. | ✅ |

### Completion Criteria

A Section Contract is considered **complete** when all validation criteria are satisfied.

If any criterion is not fulfilled, the contract remains **Proposed** and should not be referenced by an Experience Blueprint as a finalized specification.

### Design Intent

The checklist exists to guarantee that every Section Contract remains:

- canonical
- implementation-independent
- reusable
- product-oriented
- consistent with the UX specification hierarchy

---

## Governance

- UX-004 is **v1.0 Final**.
- Vocabulary: Section Contract, Identity, Purpose, Responsibilities, Composition Boundary, Prerequisites, Outcomes.
- Blueprints must reference Section Contracts (Rule 1).
- Section Contracts must reference Tool Contracts, not implement Tools (Rule 2).
- A concrete Section Contract may be referenced by a Blueprint as finalized only when Appendix B is fully satisfied.
- Conflicts “Section = component / page / module”: **UX-002 / UX-004 win** (Section = stable decision space).
- Conflicts “Section Contract = Runtime / layout”: **Out of Scope** — Platform / frontend.
