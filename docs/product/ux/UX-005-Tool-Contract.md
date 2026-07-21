# UX-005 — Tool Contract

## Status

**Status:** Final Product Specification  
**Version:** 1.0  
**Date:** 2026-07-21  
**ID:** UX-005  
**Layer:** UX 2.0 — Tool Contract  
**Not SSOT for:** Runtime, Kernel, Rendering, UI styling, state management, Event Pipeline, Platform APIs, Decision Session, Interpretation Engine, Client Studio implementation

**Navazuje na:**

- [UX-001 — Decision Workspace Philosophy](./UX-001-Decision-Workspace-Philosophy.md)
- [UX-002 — Decision Workspace Meta-Model](./UX-002-Decision-Workspace-Meta-Model.md)
- [UX-003 — Experience Blueprint](./UX-003-Experience-Blueprint.md)
- [UX-004 — Section Contract](./UX-004-Section-Contract.md)

---

## 1. Purpose

### Definition

This document defines the **canonical product contract** of a Tool.

A **Tool Contract** specifies the purpose, responsibilities, inputs, outputs and interaction boundaries of the smallest reusable product component within a Workspace Section.

It serves as the reusable specification referenced by Section Contracts (UX-004).

### Goal

Provide a stable contract for reusable product capabilities that can be composed into Sections without redefining their behaviour or purpose.

| Document | Answers |
| --- | --- |
| **UX-001** | *Why* Workspace exists |
| **UX-002** | *How* Workspace is modelled (Section vs Tool) |
| **UX-003** | *What* a Decision Experience is (Blueprint) |
| **UX-004** | *What* a Section is allowed / required to be |
| **UX-005** | *What* a Tool is allowed / required to be (Tool Contract) |

---

## 2. Scope

This document defines:

- Tool identity
- Purpose
- Responsibilities
- Inputs
- Outputs
- Interaction boundary
- Prerequisites

This document does **not** define:

- Runtime
- Rendering implementation
- UI styling
- State management
- Event processing
- Platform services

---

## 3. Tool Contract

### 3.1 Definition

A **Tool Contract** is the canonical product specification of a reusable Tool.

It defines what the Tool exists to accomplish, what information it consumes, what it produces, and what interaction capability it provides.

The contract is implementation-independent.

It does not invent a new Workspace model.
It binds the Tool concept from UX-002 into a reusable product contract.

### 3.2 Responsibilities

A Tool Contract:

- defines one reusable capability
- defines its product purpose
- declares required inputs
- declares produced outputs
- defines interaction boundary
- defines prerequisites

### 3.3 Non-Responsibilities

A Tool Contract does **not** define:

- visual implementation
- runtime lifecycle
- framework
- rendering engine
- persistence
- platform APIs
- business logic implementation

---

## 4. Tool Contract Model

Every Tool Contract consists of **seven mandatory parts**.

```text
Tool Contract
├── Identity
├── Purpose
├── Responsibilities
├── Inputs
├── Outputs
├── Interaction Boundary
└── Prerequisites
```

### 4.1 Identity

Defines:

- Tool ID
- Name
- Version
- Category

Purpose: stable reusable identity for referencing from Section Contracts and Experience Blueprints.

### 4.2 Purpose

Defines **why the Tool exists**.

Purpose is a product capability — not a widget name.

Examples:

| Tool | Purpose |
| --- | --- |
| **Image Gallery** | Browse media |
| **Comparison Table** | Compare alternatives |
| **Timeline** | Understand chronology |
| **Calculator** | Estimate values |

### 4.3 Responsibilities

Defines the **capability guaranteed** by the Tool.

Example — Comparison Table:

- displays alternatives
- highlights differences
- supports comparison

Responsibilities describe what the Tool is accountable for as a product capability.
They do not describe DOM, components, or frameworks.

### 4.4 Inputs

Defines **required product information**.

Examples:

- Images
- Metadata
- Decision Matrix
- Pricing
- Documents
- Geometry

Inputs are product-level information classes — not Runtime payloads or API schemas.

### 4.5 Outputs

Defines **information exposed** by the Tool.

Examples:

- Selected Item
- Compared Values
- Estimated Result
- Selected Variant

Outputs are **product-level outcomes**, not runtime events.

They describe what the decision process may learn or select through the Tool.

### 4.6 Interaction Boundary

Defines **how the Tool participates** in user interaction.

Examples:

- Display only
- Selection
- Comparison
- Navigation
- Calculation
- Exploration

It describes interaction **capability**, not implementation.

Interaction Boundary must stay compatible with the parent Section’s Composition Boundary (UX-004).

### 4.7 Prerequisites

Defines information that must exist before the Tool can be composed.

Examples:

- Assets
- Metadata
- Knowledge Sources
- Pricing Data
- Geometry

Prerequisites are product assumptions — not engineering tickets and not Runtime readiness checks.

---

## 5. Tool Principles

Every Tool Contract follows these principles.

### Single Capability

A Tool solves **one** reusable problem.

### Reusable

The Tool can appear in multiple Sections (within allowed Composition Boundaries).

### Stateless Specification

The contract defines capability, not runtime state.

### Implementation-independent

No framework, rendering or UI details.

### Product-oriented

The Tool exists to support a product decision (UX-001).

---

## 6. Relationship

```text
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

Section Contracts **reference** Tool Contracts.

They **never redefine** Tools.

(Aligns with UX-004 Rule 2.)

#### Rule 2

Tool Contracts define **capabilities**, not implementations.

#### Rule 3

**Multiple implementations** may satisfy the same Tool Contract.

Example: one Comparison Tool Contract may be implemented as a table, as cards, or as an interactive slider — without changing the product specification.

Rule 3 separates product architecture from technological implementation.

---

## 7. Out of Scope

This document intentionally excludes:

- Runtime
- Kernel
- Rendering
- State management
- Event Pipeline
- Platform APIs
- Decision Session
- Interpretation Engine
- Client Studio implementation

Also out of scope:

- wireframes and layout
- Section Contract internals (UX-004)
- Experience Flow (UX-006)
- Blueprint Schema / serialization (Platform Architecture)

---

## Appendix A — Reference Applicability

Validation against reference Tool types:

| Tool type | Purpose (draft) | Interaction Boundary | Fits seven-part model |
| --- | --- | --- | --- |
| **Gallery** | Browse media | Exploration / Selection | ✅ |
| **Carousel** | Browse sequenced media | Navigation / Exploration | ✅ |
| **Floor Plan** | Explore spatial layout | Exploration / Selection | ✅ |
| **Timeline** | Understand chronology | Display / Exploration | ✅ |
| **Comparison Table** | Compare alternatives | Comparison / Selection | ✅ |
| **Calculator** | Estimate values | Calculation | ✅ |
| **Video Player** | Consume video media | Display / Exploration | ✅ |
| **Document Viewer** | Read documents | Display / Exploration | ✅ |
| **CTA** | Invite next decision step | Selection | ✅ |
| **AI Conversation** | Dialogue for understanding | Exploration / Selection | ✅ |
| **Progress Indicator** | Show decision progress | Display only | ✅ |
| **Badge** | Signal status / emphasis | Display only | ✅ |
| **KPI Card** | Present key measure | Display only | ✅ |

### Findings

- Each reference Tool type can be described without a concrete implementation or framework.
- Inputs / Outputs stay at product-information level (Assets, Metadata, Selected Item, …).
- Interaction Boundaries are capability categories — compatible with Section Composition Boundaries (UX-004).
- Display-only Tools (Badge, KPI Card, Progress Indicator) remain valid Tools: single capability, reusable, implementation-independent.
- AI Conversation fits as a Tool under Racio (UX-002) — capability, not a Section.
- All reference types pass the Capability Test in Appendix C.

---

## Appendix B — Completeness Checklist

### Purpose

This checklist defines the minimum criteria that every Tool Contract must satisfy before it can be considered complete.

It makes UX-005 **self-validating**:
the document defines both the Tool Contract structure and the objective criteria for judging a concrete contract complete.

### Validation Checklist

| Criterion | Status |
| --- | --- |
| Identity defined | ✅ |
| Purpose defined | ✅ |
| Responsibilities defined | ✅ |
| Inputs defined | ✅ |
| Outputs defined | ✅ |
| Interaction Boundary defined | ✅ |
| Prerequisites defined | ✅ |
| Platform concerns excluded | ✅ |
| Reusable across Sections | ✅ |
| Implementation-independent | ✅ |
| Capability Boundary respected | ✅ |

### Completion Criteria

A Tool Contract is considered **complete** when all validation criteria are satisfied.

If any criterion is not fulfilled, the contract remains **Proposed** and should not be referenced by a Section Contract as a finalized specification.

### Design Intent

The checklist guarantees that every Tool Contract remains:

- canonical
- implementation-independent
- reusable
- product-oriented
- consistent with the UX specification hierarchy
- limited to a single reusable capability (Appendix C)

---

## Appendix C — Capability Boundary

### Purpose

This appendix defines the architectural boundary between Workspace Sections and Tools.

Its purpose is to preserve the long-term consistency of the UX architecture by ensuring that reusable product capabilities remain independent from higher-level compositions.

### Design Rule

A Tool represents **exactly one** reusable capability.

A Tool must **not** become a composition of multiple independent decision capabilities.

Whenever multiple capabilities need to work together toward a common decision objective, they belong to a **Workspace Section** rather than a Tool.

### Capability Test

A component qualifies as a Tool only if it satisfies **all** of the following:

| Criterion | Description |
| --- | --- |
| **Single Capability** | Solves one reusable product problem. |
| **Independent Purpose** | Has one clearly defined purpose. |
| **Reusable** | Can be reused across multiple Sections. |
| **Composable** | Can be combined with other Tools. |
| **Implementation-independent** | Does not depend on rendering or framework. |

If any criterion is not satisfied, the component should be modeled as a Section or another higher-level composition.

### Reference Examples

#### Valid Tools

- Gallery
- Carousel
- Timeline
- Floor Plan
- Comparison Table
- Calculator
- Video Player
- Document Viewer
- CTA
- AI Conversation
- KPI Card
- Badge

Each provides one reusable capability.

#### Not Tools

- Property Explorer
- Priority Experience
- Complete Audit
- Decision Workspace
- Client Studio

These aggregate multiple capabilities and therefore belong to higher architectural layers.

### Relationship

```text
Experience
    │
contains
    ▼
Sections
    │
contain
    ▼
Tools
    │
provide
    ▼
Capabilities
```

| Layer | Responsibility |
| --- | --- |
| **Experience** | Complete decision experience |
| **Section** | Solve one decision problem |
| **Tool** | Provide one reusable capability |

### Governance Rule

A Tool Contract must **never** introduce responsibilities that belong to a Workspace Section.

If a Tool begins to coordinate multiple independent capabilities, it should be refactored into:

- multiple Tool Contracts, or
- a new Section composed of those Tools.

This preserves a clear separation of concerns and prevents architectural drift over time.

---

## Governance

- UX-005 is **v1.0 Final**.
- Vocabulary: Tool Contract, Identity, Purpose, Responsibilities, Inputs, Outputs, Interaction Boundary, Prerequisites, Capability.
- Section Contracts must reference Tool Contracts (Rule 1).
- Tool Contracts define capabilities, not implementations (Rule 2).
- Multiple implementations may satisfy one Tool Contract (Rule 3).
- A Tool represents exactly one reusable capability (Appendix C).
- A concrete Tool Contract may be referenced as finalized only when Appendix B is fully satisfied.
- Conflicts “Tool = component / widget / React module”: **UX-002 / UX-005 win** (Tool = reusable product capability).
- Conflicts “Tool Contract = Runtime / rendering / API”: **Out of Scope** — Platform / frontend.
- Conflicts “Tool coordinates multiple decision capabilities”: **Appendix C wins** — refactor to Tools + Section.

### Specification hierarchy

```text
UX-001  Decision Workspace Philosophy
        │
        ▼
UX-002  Decision Workspace Meta-Model
        │
        ▼
UX-003  Experience Blueprint
        │
   references
        ▼
UX-004  Section Contract
        │
   references
        ▼
UX-005  Tool Contract
        │
   defines
        ▼
Reusable Product Capabilities
```

Further UX artefacts (Experience Flow, concrete Hero / Priority / Audit contracts) reuse this hierarchy — they do not redefine it.
