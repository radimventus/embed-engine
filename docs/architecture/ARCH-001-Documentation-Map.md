# ARCH-001 — Documentation Map

## Status

**Status:** Final Documentation Architecture Specification  
**Version:** 1.0  
**Date:** 2026-07-21  
**ID:** ARCH-001  
**Layer:** Documentation Architecture (meta)  
**Not SSOT for:** product functionality, Runtime behaviour, Platform Architecture behaviour, software implementation

**Role:**

ARCH-001 is the **only** document in the ARCH series that is purely meta.
It does not define product, platform or implementation architecture.
It defines the **organization of knowledge**.

> Further ARCH documents should not be created unless a genuine need arises.
> ARCH-001 remains the sole root document of documentation governance.
> Subsequent work belongs in domain series (BH, Platform Architecture, FE, ADR, …).

---

## 1. Purpose

The purpose of this document is to define the **canonical documentation architecture** of the Embed Engine.

It establishes the documentation domains, their responsibilities, ownership boundaries, and dependency rules.
It serves as the primary entry point into the project documentation for engineers, architects, contributors, reviewers and AI agents.

ARCH-001 governs the **documentation system itself**.
It does not define product, platform or implementation behaviour.

---

## 2. Scope

### In Scope

This document specifies:

- documentation domains
- documentation hierarchy
- ownership model
- dependency rules
- navigation model
- document lifecycle
- documentation governance

### Out of Scope

This document does **not** define:

- product functionality
- runtime behaviour
- software implementation
- UX contracts (UX-001 … UX-006)
- Platform Architecture mechanisms
- Decision Layer vocabulary

Those remain in their own authoritative documents.
ARCH-001 only maps and governs how those documents relate.

---

## 3. Documentation Principles

The documentation architecture follows these principles.

### Single Source of Truth

Every architectural concept has exactly one authoritative document.

Duplicate specifications are not permitted.

### One Responsibility per Document

Each document defines one primary architectural concern.

Cross-cutting concerns are expressed through references rather than duplication.

### Layered Documentation

Documentation is organized into hierarchical layers with explicit dependency rules.

Higher layers define intent.

Lower layers define realization.

### Stable References

Documents reference stable artifacts rather than implementation details.

References remain valid across implementation changes.

### Explicit Ownership

Every document belongs to exactly one documentation domain.

Ownership is never shared.

### Incremental Evolution

Documentation evolves through controlled revisions.

Each finalized document becomes a stable architectural reference.

---

## 4. Documentation Domains

### Definition

Documentation Domains partition the architectural knowledge of the Embed Engine into cohesive, independently owned areas.

Each domain has a single responsibility, a clearly defined scope, and explicit ownership.

Every document belongs to **exactly one** Documentation Domain.

### 4.1 Documentation Governance (ARCH)

**Purpose**

Defines the structure, organization and governance of the documentation system itself.

**Owns**

- Documentation architecture
- Documentation standards
- Navigation model
- Documentation lifecycle

**Examples**

- ARCH-001 Documentation Map

### 4.2 Product Architecture (UX)

**Purpose**

Defines the static structure of the product independently of its implementation.

**Owns**

- Product philosophy
- Meta-model
- Experience composition
- Section contracts
- Tool contracts
- Composition rules

**Examples**

- UX-001 … UX-006

### 4.3 Behavior Architecture (BH)

**Purpose**

Defines how the product behaves during a Decision Session.

Behavior Architecture builds upon Product Architecture but **never modifies** it.

**Typical Topics**

- Experience Flow
- Interaction Model
- Adaptation Model
- Decision Session
- Interpretation Pipeline

### 4.4 Platform Architecture

**Purpose**

Defines the platform capabilities required to realize the product architecture.

Platform concepts remain independent from frontend implementation.

**Typical Topics**

- Kernel
- Runtime
- Session
- Signals
- Services
- Decision Engine

**Document series**

Within this domain, concrete document series (for example **CORE**, Runtime, Kernel, Signals) are peers.
The domain name is **Platform Architecture**; series names label document families — they are not nested “sub-domains” of CORE.

### 4.5 Implementation Architecture (FE)

**Purpose**

Defines the concrete software implementation.

Implementation realizes Platform Architecture without redefining Product Architecture.

**Typical Topics**

- React
- TypeScript
- Components
- APIs
- State Management
- Infrastructure

### 4.6 Governance Artifacts

Governance artifacts document architectural decisions, standards and proposed changes.

They complement, but never replace, the normative architecture documents.

| Artifact | Role |
| --- | --- |
| **ADR** | Architecture Decision Records — capture accepted architectural decisions |
| **RFC** | Requests for architectural changes — capture proposals before acceptance |
| **STD** | Engineering Standards — capture reusable engineering conventions and practices |

### Domain Relationships

```text
ARCH
│
├── UX
├── BH
├── Platform Architecture
│     ├── CORE (document series)
│     ├── Runtime / Kernel / Signals (document series)
│     └── …
├── FE
└── Governance
      ├── ADR
      ├── RFC
      └── STD
```

Each domain is independent in ownership but participates in the overall documentation hierarchy defined by ARCH.

---

## 5. Documentation Layers

### Definition

Documentation is organized into hierarchical layers.

Each layer answers a distinct class of architectural questions and establishes the foundation for the layers below it.

Lower layers may refine concepts defined by higher layers, but they must **never redefine** their semantics.

### Layer 1 — Documentation Governance

**Question**

How is architectural knowledge organized?

**Purpose**

Defines the documentation system itself, including its structure, lifecycle, navigation and governance.

**Primary Domain**

ARCH

This layer is independent of product, platform and implementation.

### Layer 2 — Product Architecture

**Question**

What is the product?

**Purpose**

Defines the canonical product model independently of technical realization.

This layer establishes the vocabulary and structural concepts of the product.

**Primary Domains**

- UX
- BH

Product Architecture is the authoritative source for product semantics.

### Layer 3 — Platform Architecture

**Question**

How does the platform realize the product?

**Purpose**

Defines the architectural mechanisms that implement Product Architecture.

This layer introduces execution concepts, services and runtime capabilities without redefining product semantics.

**Primary Domain**

Platform Architecture

**Typical Document Series**

- CORE
- RT
- Kernel
- Session
- Signals

### Layer 4 — Implementation Architecture

**Question**

How is the platform implemented?

**Purpose**

Defines concrete software realization.

Implementation Architecture is responsible for technologies, components, APIs and infrastructure.

**Primary Domain**

FE

### Documentation Stack

```text
ARCH
──────────────────────────────────
Documentation Governance

UX
BH
──────────────────────────────────
Product Architecture

Platform Architecture
(CORE · RT · Kernel · Session)
──────────────────────────────────
Platform Architecture

FE
──────────────────────────────────
Implementation Architecture
```

### Layer Invariants

The following invariants shall always hold:

- Every layer has a distinct responsibility.
- Lower layers depend on higher layers.
- Higher layers remain implementation-independent.
- Architectural semantics originate only once.

---

## 6. Dependency Rules

### Definition

Dependency Rules define the permitted flow of architectural knowledge between documentation layers.

Dependencies always flow from higher abstraction toward lower abstraction.

Reverse dependencies are prohibited.

### 6.1 Dependency Hierarchy

```text
Documentation Governance
            │
            ▼
Product Architecture
            │
            ▼
Platform Architecture
            │
            ▼
Implementation Architecture
```

Every dependency shall follow this hierarchy.

### 6.2 Allowed Dependencies

#### Documentation Governance

May reference no architectural layer.

Acts as the root of the documentation system.

#### Product Architecture

May reference:

- Documentation Governance

Must not reference:

- Platform Architecture
- Implementation Architecture

#### Platform Architecture

May reference:

- Documentation Governance
- Product Architecture

Must not reference:

- Implementation Architecture

#### Implementation Architecture

May reference all higher layers.

Must never redefine concepts owned by higher layers.

### 6.3 Dependency Principles

All dependencies shall be:

- explicit
- directional
- acyclic
- traceable
- stable

Implicit dependencies are not permitted.

### 6.4 Semantic Integrity

Architectural concepts have exactly one authoritative definition.

Lower documentation layers may refine those concepts but shall never redefine their meaning.

Semantic ownership always remains with the layer that introduced the concept.

### 6.5 Runtime Independence

Runtime implementations are consumers of architectural knowledge.

They do not define architectural concepts.

Implementation artifacts, prototypes and experimental technologies do not become architectural references by their existence.

### Architectural Invariants

The following invariants shall always hold:

#### Single Semantic Ownership

Every architectural concept has exactly one authoritative owner.

#### Downward Knowledge Flow

Knowledge flows from higher layers to lower layers.

#### Upward Independence

Higher layers remain independent of realization technologies.

#### Stable References

References remain valid across implementation changes.

#### No Parallel Truth

No document may redefine concepts owned by another documentation layer.

Architectural evolution shall occur through the owning document or through approved governance artifacts (ADR/RFC).

> Note: Future Product/Behavior concepts (for example Domain → Interpretation → Experience → Scenes → Modules) belong in UX/BH or Platform Architecture — not in ARCH-001.
> ARCH-001 protects them via Single Semantic Ownership, No Parallel Truth and Runtime Independence.

---

## 7. Document Ownership

### Definition

Document Ownership defines the authority responsible for maintaining a document and the architectural concepts it governs.

Ownership ensures that every concept has a single authoritative source.

### Ownership Principles

Every document:

- belongs to exactly one Documentation Domain
- has exactly one owning domain
- governs one primary architectural concern
- may be referenced by multiple documents

Ownership is **exclusive**.

References do **not** imply ownership.

### Ownership Matrix

| Domain | Owns | Examples |
| --- | --- | --- |
| **ARCH** | Documentation governance | Documentation Map |
| **UX** | Static Product Architecture | UX-001 … UX-006 |
| **BH** | Behavior Architecture | Experience Flow, Interaction Model |
| **Platform Architecture** | Platform concepts | CORE, RT, Kernel, Session |
| **FE** | Software implementation | React, Components, APIs |
| **ADR** | Accepted architectural decisions | ADR-xxx |
| **RFC** | Proposed architectural changes | RFC-xxx |
| **STD** | Engineering standards | STD-xxx |

### Ownership Constraints

- Ownership may change only through an accepted architectural decision.
- Documents must never have multiple owners.
- Architectural concepts inherit the ownership of the document that defines them.

---

## 8. Navigation Model

### Definition

The Navigation Model defines the recommended reading paths through the documentation.

It is optimized for different audiences while preserving a single documentation hierarchy.

### Primary Entry Point

All documentation begins with:

**ARCH-001**

ARCH-001 is the canonical entry point into the documentation system.

### Recommended Reading Order

#### Product Architecture

```text
ARCH-001
    ↓
UX-001
    ↓
UX-002
    ↓
UX-003
    ↓
UX-004
    ↓
UX-005
    ↓
UX-006
    ↓
BH Series
```

#### Platform Architecture

```text
ARCH-001
    ↓
UX Series
    ↓
BH Series
    ↓
Platform Architecture
    ↓
CORE Series
    ↓
Runtime Series
```

#### Implementation

```text
ARCH-001
    ↓
UX
    ↓
BH
    ↓
Platform Architecture
    ↓
FE
```

### Navigation Principles

Documentation navigation shall be:

- hierarchical
- predictable
- domain-oriented
- implementation-independent

---

## 9. Documentation Lifecycle

### Definition

Every document progresses through a controlled lifecycle.

Lifecycle states communicate architectural maturity.

### Lifecycle States

```text
Draft
    ↓
Proposed
    ↓
Review
    ↓
Final
    ↓
Deprecated
    ↓
Archived
```

### State Definitions

| State | Meaning |
| --- | --- |
| **Draft** | Initial work in progress. No architectural authority. |
| **Proposed** | Structurally complete. Open for review and discussion. |
| **Review** | Under formal architectural review. Normative changes require reviewer approval. |
| **Final** | Approved reference document. Acts as the Single Source of Truth for its scope. |
| **Deprecated** | Superseded by another document. May still be referenced for historical context. |
| **Archived** | Retained for traceability only. No longer participates in active documentation. |

### Lifecycle Rules

A document:

- occupies exactly one lifecycle state
- progresses sequentially through the lifecycle
- may be deprecated but never silently replaced
- retains stable identifiers throughout its lifecycle

### Stable Document Identity

The document identifier (for example `UX-004`, `ARCH-001`) is **immutable** for the lifetime of the document.

Versions change (`v0.1`, `v1.0`, `v1.1`, …).

Identity does not.

This keeps long-term references from ADR, RFC and implementation documentation stable.

### Change Control

Normative changes to a Final document require one of:

- an accepted ADR
- an approved RFC
- or a documented version revision

---

## Appendix A — Documentation Tree

### Purpose

Illustrates the canonical organization of the Embed Engine documentation.

The tree is **informative only**.

The normative definitions remain in the main chapters of this document.

```text
ARCH
│
├── Product Architecture
│   ├── UX
│   │   ├── UX-001 Decision Workspace Philosophy
│   │   ├── UX-002 Decision Workspace Meta-Model
│   │   ├── UX-003 Experience Blueprint
│   │   ├── UX-004 Section Contract
│   │   ├── UX-005 Tool Contract
│   │   └── UX-006 Composition Rules
│   │
│   └── BH
│       ├── BH-001 Experience Flow
│       ├── BH-002 Interaction Model
│       ├── BH-003 Adaptation Model
│       └── ...
│
├── Platform Architecture
│   ├── CORE
│   ├── RT
│   ├── Kernel
│   ├── Session
│   └── Signals
│
├── Implementation Architecture
│   └── FE
│
└── Governance
    ├── ADR
    ├── RFC
    └── STD
```

The structure may evolve without changing the architectural responsibilities defined by each domain.

---

## Appendix B — Dependency Matrix

### Purpose

Summarizes the permitted dependency directions between documentation layers.

| From \\ To | ARCH | Product | Platform | Implementation |
| --- | --- | --- | --- | --- |
| **ARCH** | — | ❌ | ❌ | ❌ |
| **Product** | ✅ | — | ❌ | ❌ |
| **Platform** | ✅ | ✅ | — | ❌ |
| **Implementation** | ✅ | ✅ | ✅ | — |

### Dependency Invariants

Every dependency shall satisfy all of the following:

- explicit
- downward
- acyclic
- traceable
- semantically consistent

Violating any invariant makes the dependency architecturally invalid.

---

## Appendix C — Documentation Checklist

### Purpose

Defines the minimum quality criteria for a finalized architectural document.

### Structural Integrity

- ☐ Purpose defined
- ☐ Scope defined
- ☐ Responsibilities clearly assigned
- ☐ Ownership identified
- ☐ Dependencies documented

### Architectural Integrity

- ☐ No duplicate ownership
- ☐ No semantic conflicts
- ☐ No circular dependencies
- ☐ No implementation leakage
- ☐ Single Source of Truth preserved

### Documentation Integrity

- ☐ Stable document identifier
- ☐ Lifecycle state assigned
- ☐ References verified
- ☐ Terminology consistent
- ☐ Cross-references validated

### Completion Rule

A document may transition to **Final** only when every applicable checklist item is satisfied.

---

## Architectural Outcome

With ARCH-001 completed:

- the documentation system has a canonical entry point
- documentation domains have explicit ownership
- dependency rules are formally defined
- documentation lifecycle is standardized
- architectural knowledge has a single governance model

ARCH-001 governs the **documentation system itself**.

It does not redefine concepts owned by Product Architecture, Platform Architecture or Implementation Architecture.

Its role is to provide the framework within which those domains evolve.

### Global Invariants (v1.0 Review)

| Invariant | Status |
| --- | --- |
| **Single Ownership** — every document and concept has one owner | ✅ |
| **No Parallel Truth** — no alternative definitions of existing concepts | ✅ |
| **Layer Separation** — ARCH governs documentation, not product or runtime | ✅ |
| **Stable Identity** — document ID is permanent; only version changes | ✅ |

---

## Definition of Done (ARCH-001)

ARCH-001 is complete when it:

- defines all documentation domains ✅
- assigns unambiguous ownership to every document ✅
- establishes dependency rules between layers ✅
- describes the document lifecycle ✅
- provides a project navigation map ✅
- includes a validation checklist ✅
- contains **no** product or implementation logic ✅

---

## Sprint Review

### Slice 1 — Done

- ✅ Document role defined (meta documentation architecture)
- ✅ Principles defined
- ✅ Skeleton prepared

### Slice 2 — Done

- ✅ Documentation Domains (§4)
- ✅ Platform Architecture domain vs CORE document series

### Slice 3 — Done

- ✅ Documentation Layers + Dependency Rules (§5–§6)
- ✅ Semantic Integrity · Runtime Independence · No Parallel Truth

### Slice 4 — Done

- ✅ Ownership · Navigation · Lifecycle (§7–§9)
- ✅ Stable Document Identity · Change Control

### Slice 5 — Done

- ✅ Appendix A — Documentation Tree
- ✅ Appendix B — Dependency Matrix
- ✅ Appendix C — Documentation Checklist
- ✅ Architectural Outcome
- ✅ Global invariant review
- ✅ Document promoted to **v1.0 Final**

### Outcome

- ✅ Complete
- ✅ Self-validating
- ✅ Meta-only (no product / platform / implementation behaviour)
- ✅ Canonical entry point for Embed Engine documentation

---

## Governance

- ARCH-001 is **v1.0 Final**.
- ARCH-001 is the sole meta / root document of documentation governance.
- Further ARCH-series documents should not be created without genuine need; domain work proceeds in UX, BH, Platform Architecture, FE, ADR, RFC, STD.
- Every document belongs to exactly one Documentation Domain and has exactly one owner.
- Document identifiers are immutable; versions evolve.
- Knowledge flows downward only; reverse dependencies are prohibited.
- Architectural concepts have exactly one authoritative owner (No Parallel Truth).
- A document may become Final only when Appendix C is satisfied.
- Conflicts “ARCH-001 defines Runtime / UX / product behaviour”: **Out of Scope** — owned by the respective domain SSOT.
- Conflicts “duplicate SSOT for the same concept”: **Single Source of Truth** wins — one authoritative document only.
