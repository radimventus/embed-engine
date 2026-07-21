# BH-001 — Experience Architecture

## Status

**Status:** Final Product Specification  
**Version:** 1.0  
**Date:** 2026-07-21  
**ID:** BH-001  
**Domain:** Behavior Architecture (BH)  
**Layer:** Product Architecture  
**Not SSOT for:** Static Product Architecture (UX-001 … UX-006), Platform Architecture, Runtime, Rendering, Implementation, Documentation Governance (ARCH-001)

**Navazuje na:**

- [ARCH-001 — Documentation Map](../../architecture/ARCH-001-Documentation-Map.md)
- [UX-001 — Decision Workspace Philosophy](../ux/UX-001-Decision-Workspace-Philosophy.md)
- [UX-002 — Decision Workspace Meta-Model](../ux/UX-002-Decision-Workspace-Meta-Model.md)
- [UX-006 — Composition Rules](../ux/UX-006-Composition-Rules.md)

**Role:**

BH-001 is the first reference document of the **Behavior Architecture** branch.

UX-001 … UX-006 define the **static** product structure.
BH-001 begins the definition of how product knowledge becomes a lived Decision Experience.

---

## 1. Purpose

### Definition

This document defines the **canonical Experience Architecture** of the Embed Engine.

It specifies how product knowledge is transformed into an Experience that can be rendered across Client Studio, Builder Studio and future terminals — without granting privileged status to any one terminal.

### Goal

Provide a single Experience model that unifies:

```text
Knowledge
        ↓
Interpretation
        ↓
Experience
        ↓
Rendered Experience
```

This transformation is the behavioral centre of the platform.

Static UX architecture (Sections, Tools, Blueprints) remains intact.
BH-001 does not redefine UX contracts.
It defines how Experience behaviour is structured above them.

---

## 2. Scope

### In Scope

This document will define (across slices):

- Experience Hierarchy
- Relationships (containment, ownership, identity)
- Behavior Principles
- Reference examples and validation checklist

### Out of Scope

This document does **not** define:

- Workspace Sections / Tools / Composition Rules (UX-002 … UX-006)
- Runtime execution algorithms
- Kernel behaviour
- Rendering / UI implementation
- Client Studio or Builder Studio specifics as privileged terminals
- Platform Architecture mechanisms

Rendered Experience is a consumer of this architecture — not its owner.

---

## 3. Principles

### Interpretation First

Experience is produced from Interpretation of Knowledge.

UI does not invent product meaning.

### Single Experience Model

There is one Experience Architecture for the platform.

Client Studio, Builder Studio and future terminals are **renderings** of Experience — not separate product architectures.

### Runtime Independence

Experience Architecture defines behaviour concepts.
It does not define Runtime pipelines, state machines or execution code.

### Terminal Independence

No terminal owns Experience semantics.

A terminal may present Experience.
It may not redefine Domain, Interpretation or Experience structure.

### Builds on Static UX

Behavior Architecture builds upon Product Architecture (UX) and **never modifies** it (ARCH-001 §4.3).

Sections, Tools and Blueprints remain the static composition vocabulary.
BH-001 describes the behavioral hierarchy that uses that vocabulary.

### No Parallel Truth

Experience concepts introduced here have a single authoritative definition in BH.
Lower layers may refine realization — they must not redefine meaning (ARCH-001).

---

## 4. Experience Hierarchy

### Definition

Experience Architecture defines the canonical transformation from structured domain knowledge into an interactive decision experience.

The hierarchy describes **architectural relationships only**.

It does not define runtime execution or UI rendering.

### Canonical Experience Model

```text
Domain
    │
    ▼
Interpretation
    │
    ▼
Priority
    │
    ▼
Experience
    │
    ▼
Scenes
    │
    ▼
Modules
```

### 4.1 Domain

**Purpose**

Represents the authoritative source of structured knowledge.

A Domain owns **semantics**.

Domains are independent of presentation.

Examples include Object, Portfolio and Company.

### 4.2 Interpretation

**Purpose**

Transforms domain knowledge into a context-specific understanding.

Interpretation **never changes** the Domain.

It produces an interpretation suitable for a particular decision context.

### 4.3 Priority

**Purpose**

Ranks interpreted information according to the current decision context.

Priority determines **relevance** rather than truth.

Different users may obtain different priorities while sharing the same Domain.

### 4.4 Experience

**Purpose**

Experience is the canonical decision model presented to the user.

Experience is independent of runtime implementation.

Experience is independent of any specific Studio.

Exactly **one** Experience is produced for one Interpretation.

### 4.5 Scene

**Purpose**

A Scene represents one coherent decision context within an Experience.

Scenes partition the Experience into navigable units.

Scenes **never own** domain knowledge.

### 4.6 Module

**Purpose**

Modules provide reusable interaction capabilities within a Scene.

Modules are compositional.

Modules **never own** interpretation.

### Experience Principles

#### Interpretation Before Presentation

Presentation is derived from Interpretation.

Never the opposite.

#### Priority Before Layout

Information importance is determined before UI composition.

#### Experience Before Runtime

Runtime renders Experience.

Runtime never defines Experience.

#### Scene Before Navigation

Navigation emerges from Scene composition.

#### Module Reuse

Modules are reusable interaction units.

They remain independent of individual Experiences.

### Architectural Invariants

| Layer | Owns |
| --- | --- |
| **Domain** | semantics |
| **Interpretation** | context |
| **Priority** | relevance |
| **Experience** | composition |
| **Scene** | decision context |
| **Module** | interaction capability |

No layer may assume the responsibility of another.

### Explicitly out of this chapter

The following belong to Platform Architecture or later BH documents — **not** to BH-001:

- Decision Filter
- Evidence Matrix
- Context Package
- Knowledge Model
- Interpretation Engine

BH-001 defines the conceptual Experience model.
Realization mechanisms remain outside this document.

---

## 5. Relationship Model

### Definition

The Relationship Model defines how the architectural layers of the Experience Model relate to one another.

Relationships describe **ownership, containment and transformation** only.

They do not define execution order or runtime behaviour.

### 5.1 Transformation Chain

The Experience Model follows a strict transformation hierarchy.

```text
Domain
    │
    ▼
Interpretation
    │
    ▼
Priority
    │
    ▼
Experience
    │
    ▼
Scenes
    │
    ▼
Modules
```

| From | To | Relationship |
| --- | --- | --- |
| Domain | Interpretation | transformation |
| Interpretation | Priority | prioritization |
| Priority | Experience | composition |
| Experience | Scenes | containment |
| Scenes | Modules | containment |

Each relationship has exactly one semantic meaning.

Verbs used in diagrams (transforms into, prioritizes into, composes, contains) are **explanatory**.
The normative model is defined by entities and relationship kinds above — not by wording of verbs.

### 5.2 Ownership

Ownership defines which layer governs each architectural concern.

| Layer | Owns |
| --- | --- |
| **Domain** | Semantic knowledge |
| **Interpretation** | Context |
| **Priority** | Relevance |
| **Experience** | Composition |
| **Scene** | Decision context |
| **Module** | Interaction capability |

Ownership is exclusive.

Responsibilities never overlap.

### 5.3 Identity

Each architectural layer has its own independent identity.

Changing one layer does not change the identity of another.

Examples:

- the same Domain may produce multiple Interpretations
- the same Interpretation may produce different Priorities
- the same Experience may be rendered by multiple terminals
- the same Module may appear in multiple Scenes

Identity is preserved across transformations.

### 5.4 Containment

Containment begins at the Experience layer.

```text
Experience
│
├── Scene
│     ├── Module
│     ├── Module
│     └── Module
│
└── Scene
      ├── Module
      └── Module
```

**Rules:**

- Experiences contain Scenes.
- Scenes contain Modules.
- Modules contain no architectural layers.

Interpretation and Priority are **transformational** layers and therefore are **not** containment layers.

### 5.5 Cardinality

| Relationship | Cardinality |
| --- | --- |
| Domain → Interpretation | 1..N |
| Interpretation → Priority | 1..N |
| Priority → Experience | 1..N |
| Experience → Scene | 1..N |
| Scene → Module | 1..N |

The model permits multiple contextual realizations while preserving semantic ownership.

### Relationship Principles

#### Transformation over Mutation

Every layer derives the next.

No layer mutates its predecessor.

#### Stable Identity

Identity remains stable throughout the transformation chain.

#### Exclusive Ownership

Responsibilities are never shared.

#### Composition after Interpretation

Structural composition begins only after interpretation and prioritization.

#### Runtime Independence

Relationships exist independently of any runtime implementation.

### Architectural Invariants

| Rule |
| --- |
| Domain never contains UI. |
| Interpretation never owns semantics. |
| Priority never changes meaning. |
| Experience never owns knowledge. |
| Scene never owns priority. |
| Module never owns context. |

Every layer consumes the previous one and contributes exactly one new architectural responsibility.

---

## 6. Behavioral Principles

### Definition

Behavioral Principles define the architectural constraints that preserve the integrity, consistency and universality of the Experience Model.

These principles govern every Experience regardless of domain, runtime or terminal.

### 6.1 Interpretation First

Interpretation always precedes presentation.

No Experience may be composed directly from raw domain knowledge.

Presentation is the result of interpretation, never its substitute.

### 6.2 Single Experience Model

For a given Interpretation and decision context, there exists exactly **one** canonical Experience Model.

Different terminals may render that Experience differently.

They must not redefine it.

### 6.3 Terminal Independence

Experience exists independently of any terminal.

Client Studio, Builder Studio, Manager Studio or future terminals are **renderers** of Experience.

They are not the source of Experience.

> Terminals render Experiences. They do not define them.

Studios need not be enumerated as normative special cases.
The general Terminal Independence rule applies to all of them.

### 6.4 Runtime Independence

Runtime executes Experience.

Runtime does not define Experience.

Execution concerns belong to Platform Architecture.

### 6.5 Domain Independence

The Experience Model is independent of the originating domain.

Whether the source domain represents an Object, Portfolio, Company or another domain, the transformation model remains identical.

### 6.6 Separation of Responsibilities

Each architectural layer contributes exactly one responsibility.

| Layer | Responsibility |
| --- | --- |
| **Domain** | Semantic knowledge |
| **Interpretation** | Contextual understanding |
| **Priority** | Relevance |
| **Experience** | Decision composition |
| **Scene** | Decision context |
| **Module** | Interaction capability |

Responsibilities are exclusive.

### 6.7 No Parallel Interpretation

Interpretation shall occur exactly once within the transformation chain.

No downstream layer may reinterpret upstream semantics.

Subsequent layers consume Interpretation; they do not recreate it.

### Behavioral Invariants

The following invariants shall always hold:

#### Interpretation Before Composition

Experience composition begins only after Interpretation and Priority have been established.

#### One Semantic Source

Semantic meaning originates only in the Domain.

#### Stable Transformation

Every transformation preserves the identity of its predecessor.

#### Renderer Neutrality

Rendering technologies do not affect the Experience Model.

#### Universal Applicability

The Experience Model applies uniformly across all domains and terminals.

### Architectural Outcome (normative preview)

With BH-001 completed:

- Experience becomes a first-class architectural concept.
- Studios are positioned as renderers rather than owners.
- Interpretation is formally separated from presentation.
- Product semantics remain independent of runtime realization.
- A single canonical transformation model governs every decision experience.

Derived consequences (non-exhaustive):

- Builder Studio is not a Domain.
- Builder Studio is not a CRM.
- Client Studio is not Experience.
- Manager Studio is not a Portfolio.

These follow from Terminal Independence — they are not special-case norms.

---

## Appendix A — Canonical Experience Examples

### Purpose

Demonstrate correct use of the Experience Model without binding to a concrete product.

### Example 1 — Single Experience

```text
Domain
    ↓
Interpretation
    ↓
Priority
    ↓
Experience
    ├── Scene A
    │      ├── Module
    │      └── Module
    └── Scene B
           └── Module
```

**Emphasized:**

- one Interpretation
- one Experience
- multiple Scenes
- reusable Modules

### Example 2 — Multiple Interpretations

```text
Same Domain
      │
      ├── Interpretation A
      │         ↓
      │   Experience A
      │
      └── Interpretation B
                ↓
          Experience B
```

**Key message:**

- Domain remains identical
- only the interpretive context changes
- no new Domain is created

---

## Appendix B — Invalid Architectures

### Invalid 1

```text
Domain
   ↓
Experience
```

❌ Missing Interpretation.  
**Violates:** §6.1 Interpretation First · §6 Interpretation Before Composition

### Invalid 2

```text
Domain
      ↓
Experience

Terminal modifies Experience
```

❌ Terminal must not define Experience.  
**Violates:** §6.3 Terminal Independence · §6.2 Single Experience Model

### Invalid 3

```text
Scene
owns Priority
```

❌ Priority is an upstream layer.  
**Violates:** §5.2 Ownership · §5 Architectural Invariants (Scene never owns priority)

### Invalid 4

```text
Module
stores Interpretation
```

❌ Module does not provide interpretation.  
**Violates:** §5.2 Ownership · §6.7 No Parallel Interpretation · Module never owns context

---

## Appendix C — Experience Checklist

### Purpose

Defines the minimum quality criteria for a complete Experience Architecture.

### Structural Integrity

- ☐ Canonical hierarchy preserved
- ☐ Required layers present
- ☐ Containment valid
- ☐ Cardinalities respected

### Behavioral Integrity

- ☐ Interpretation precedes Experience
- ☐ Priority precedes composition
- ☐ No Parallel Interpretation
- ☐ Runtime independent
- ☐ Terminal independent

### Architectural Integrity

- ☐ Ownership preserved
- ☐ Stable identities
- ☐ No semantic duplication
- ☐ Responsibilities isolated

### Completion Rule

An Experience Architecture is complete only if all structural, behavioral and architectural requirements are satisfied.

---

## Architectural Outcome

BH-001 establishes the **canonical transformation model** of the Embed Engine.

It formally separates semantic knowledge, interpretation, prioritization and experience composition.

Every runtime, terminal and implementation must preserve this transformation model.

The document serves as the **normative behavioral foundation** for all future platform capabilities.

### Role relative to other domains

| Domain | Role |
| --- | --- |
| **ARCH** | How documentation is organized |
| **UX** | Static structure of Experience (Sections, Tools, Blueprints) |
| **BH** | How Experience is produced and which behavioral principles it must satisfy |
| **Platform Architecture** | Mechanisms that realize this model |

### Global Invariants (v1.0 Review)

| Invariant | Status |
| --- | --- |
| Interpretation First | ✅ |
| Single Experience Model | ✅ |
| Terminal Independence | ✅ |
| Runtime Independence | ✅ |
| No Parallel Interpretation | ✅ |
| No Parallel Truth vs UX / Platform | ✅ |

---

## Sprint Plan

| Slice | Content |
| --- | --- |
| **Slice 1** | Purpose, Scope, Principles, skeleton ✅ |
| **Slice 2** | Experience Hierarchy ✅ |
| **Slice 3** | Relationships ✅ |
| **Slice 4** | Behavior Principles ✅ |
| **Slice 5** | Examples, Checklist, Architectural Outcome → **v1.0 Final** ✅ |

---

## Sprint Review

### Slice 1 — Done

- ✅ BH branch opened
- ✅ Document role defined
- ✅ Scope boundary clarified
- ✅ Skeleton prepared

### Slice 2 — Done

- ✅ Canonical Experience Model
- ✅ Domain · Interpretation · Priority · Experience · Scene · Module

### Slice 3 — Done

- ✅ Relationship Model
- ✅ Ownership · Identity · Containment · Cardinality

### Slice 4 — Done

- ✅ Behavioral Principles
- ✅ Normative core complete

### Slice 5 — Done

- ✅ Appendix A — Canonical Experience Examples
- ✅ Appendix B — Invalid Architectures
- ✅ Appendix C — Experience Checklist
- ✅ Architectural Outcome
- ✅ Document promoted to **v1.0 Final**

### Outcome

- ✅ Complete
- ✅ Self-validating
- ✅ First reference document of Behavior Architecture
- ✅ Foundation for Platform Architecture (CORE, Runtime, Kernel, Session, Signals, …)

---

## Governance

- BH-001 is **v1.0 Final**.
- Domain ownership: **BH** (Behavior Architecture) per ARCH-001.
- Document identity `BH-001` is immutable; versions evolve.
- BH builds on UX and never modifies static Product Architecture.
- Canonical Experience Model: Domain → Interpretation → Priority → Experience → Scenes → Modules.
- Ownership and containment are exclusive; transformational layers are not containment layers.
- Terminals render Experiences; they do not define them.
- Runtime executes Experience; it does not define Experience.
- Interpretation occurs once; downstream layers do not reinterpret semantics.
- An Experience Architecture is complete only when Appendix C is satisfied.
- Conflicts “BH-001 redefines Section / Tool / Blueprint”: **UX-002 … UX-006 win**.
- Conflicts “BH-001 defines Runtime / Kernel / Interpretation Engine”: **Out of Scope** — Platform / later BH.
- Conflicts “Client Studio / Builder Studio owns Experience semantics”: **Terminal Independence** — BH-001 wins.
- Conflicts “duplicate Experience hierarchy elsewhere”: **No Parallel Truth** — BH-001 wins.
