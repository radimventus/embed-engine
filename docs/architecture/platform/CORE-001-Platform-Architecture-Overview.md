# CORE-001 — Platform Architecture Overview

## Status

**Status:** Final Platform Architecture Specification  
**Version:** 1.0  
**Date:** 2026-07-21  
**ID:** CORE-001  
**Domain:** Platform Architecture  
**Layer:** Platform Architecture (per ARCH-001)  
**Not SSOT for:** Product Architecture (UX), Behavior Architecture (BH), Documentation Governance (ARCH), FE implementation details, Runtime algorithms, subsystem contracts

**Navazuje na:**

- [ARCH-001 — Documentation Map](../ARCH-001-Documentation-Map.md)
- [BH-001 — Experience Architecture](../../product/bh/BH-001-Experience-Architecture.md)
- [UX-006 — Composition Rules](../../product/ux/UX-006-Composition-Rules.md)
- [ADR-011 — Renumber Cognitive Layer to CORE-101](../adr/ADR-011-core-001-platform-overview.md)

**Role:**

| Document | Answers |
| --- | --- |
| **ARCH-001** | How is documentation organized? |
| **UX** | What entities compose Experience? |
| **BH-001** | How does Experience arise? |
| **CORE-001** | How does the platform realize this model? |

---

## 1. Purpose

### Definition

The Platform Architecture defines the **canonical implementation architecture** of the Embed Engine.

It describes the platform subsystems responsible for realizing the behavioral model defined by [BH-001 Experience Architecture](../../product/bh/BH-001-Experience-Architecture.md).

The Platform Architecture specifies architectural responsibilities and subsystem boundaries.

It does **not** define implementation details.

### Goal

Provide a stable platform foundation so that subsequent CORE documents can define subsystem contracts without inventing competing platform models.

CORE-001 defines **architectural roles**.

Subsequent documents (CORE-002 … CORE-00x, CORE-101 …) define **contracts and behavior** of those roles.

CORE-001 remains an overview root — not an encyclopedia of the platform.

---

## 2. Scope

### In Scope

CORE-001 defines:

- platform layers
- core platform subsystems
- subsystem responsibilities
- architectural boundaries
- ownership principles

### Out of Scope

Implementation details are defined in subsequent CORE documents.

Also out of scope:

- UX contracts (Sections, Tools, Blueprints)
- BH Experience Model redefinition
- FE technologies (React, TypeScript, …)
- concrete Runtime APIs and algorithms

---

## 3. Platform Principles

### Behavior First

The platform realizes the Experience Model defined by the Behavior Architecture.

Behavior precedes implementation.

### Experience Driven

All platform components exist to create, execute or support Experiences.

No subsystem exists independently of the Experience Model.

### Runtime Independence

Platform architecture remains independent of any specific runtime technology.

Runtime implementations may evolve without changing the platform model.

### Kernel Orchestration

The Kernel coordinates platform execution.

It does not own business semantics or domain knowledge.

### Explicit Ownership

Every subsystem owns exactly one architectural responsibility.

Responsibilities never overlap.

### Composable Platform

Platform capabilities are composed from independent subsystems.

Subsystems communicate through explicit contracts.

### Stable Platform Model

Platform structure evolves through extension rather than modification.

Existing subsystem responsibilities remain stable.

---

## 4. Platform Layers

### Definition

Platform Layers partition the implementation architecture into cohesive architectural responsibilities.

Layers define **responsibility boundaries**.

They do not prescribe deployment topology or implementation technology.

> **Relation to BH-001:** Platform Architecture **implements** Behavior Architecture; it does not replace it.  
> In BH-001, *Experience* is a conceptual artefact (the result of Domain → Interpretation → Priority → Experience).  
> In CORE-001, the *Experience Layer* is the platform layer that **realizes** that artefact.  
> These are related but not the same entity.

### Canonical Platform Model

```text
Knowledge Layer
        │
        ▼
Interpretation Layer
        │
        ▼
Execution Layer
        │
        ▼
Experience Layer
        │
        ▼
Terminal Layer
```

> **Naming note:** This model uses **Execution Layer**, not Runtime Layer.  
> Runtime is a concrete mechanism. Execution is the architectural responsibility.  
> Parallel naming choices elsewhere: Interpretation (not Interpreter), Experience (not Client Studio).

### 4.1 Knowledge Layer

**Purpose**

Owns structured knowledge and semantic models.

Provides authoritative input to the platform.

Does not execute behavior.

### 4.2 Interpretation Layer

**Purpose**

Transforms knowledge into contextual interpretations.

Produces decision-ready representations.

Owns no execution.

### 4.3 Execution Layer

**Purpose**

Coordinates and executes platform behavior.

Includes orchestration, lifecycle and runtime services.

Owns no business semantics.

### 4.4 Experience Layer

**Purpose**

Materializes the Experience Model.

Coordinates Scenes and Modules.

Independent of rendering technology.

### 4.5 Terminal Layer

**Purpose**

Presents Experiences to users.

Includes Client Studio, Builder Studio, Manager Studio and future terminals.

Terminals never define Experiences.

### Layer Principles

#### Downward Dependency

Layers depend only on preceding architectural layers.

#### Responsibility Isolation

Each layer owns one architectural concern.

#### Behavior Preservation

Execution preserves the behavioral model defined in BH-001.

#### Technology Neutrality

Layers remain independent of implementation technologies.

#### Stable Layering

New capabilities extend existing layers.

They do not redefine them.

### Architectural Invariants

| Layer | Owns |
| --- | --- |
| Knowledge | semantics |
| Interpretation | context |
| Execution | orchestration |
| Experience | composition |
| Terminal | presentation |

No layer may assume another layer's responsibility.

---

## 5. Core Subsystems

### Definition

Core Subsystems define the canonical implementation responsibilities of the Embed Engine platform.

Each subsystem owns exactly one architectural concern.

Subsystems collaborate through explicit contracts.

Subsystems do not redefine Platform Layers.

> **Naming note:** Subsystem names identify architectural responsibilities. They do not prescribe implementation module names, package names or deployment units.

This section maps responsibilities into layers.

It does **not** define dependencies, data flows, algorithms or lifecycles.

Those belong in subsequent CORE documents.

### Canonical Platform Structure

```text
Knowledge Layer
    └── Knowledge Repository

Interpretation Layer
    ├── Interpreter
    └── Priority Engine

Execution Layer
    ├── Kernel
    ├── Runtime
    ├── Session Manager
    ├── Signal Bus
    └── Decision Engine

Experience Layer
    └── Experience Composer

Terminal Layer
    ├── Client Studio
    ├── Builder Studio
    ├── Manager Studio
    └── Future Terminals
```

### 5.1 Knowledge Repository

**Purpose**

Stores and exposes authoritative structured knowledge.

Owns persistence of semantic models.

Provides input to the Interpretation Layer.

**Layer:** Knowledge

### 5.2 Interpreter

**Purpose**

Produces contextual Interpretations from domain knowledge.

Consumes Knowledge.

Produces Interpretation artifacts.

**Layer:** Interpretation

### 5.3 Priority Engine

**Purpose**

Evaluates Interpretations according to the active decision context.

Produces Priority artifacts.

Owns no knowledge.

**Layer:** Interpretation

### 5.4 Kernel

**Purpose**

Coordinates platform execution.

Schedules subsystem collaboration.

Owns orchestration only.

The Kernel never owns semantics, interpretation or presentation.

**Layer:** Execution

### 5.5 Runtime

**Purpose**

Executes the platform lifecycle.

Provides execution services to the Kernel.

Owns execution mechanics.

**Layer:** Execution

### 5.6 Session Manager

**Purpose**

Maintains execution state across user interactions.

Owns session lifecycle.

Does not own semantic meaning.

**Layer:** Execution

### 5.7 Signal Bus

**Purpose**

Provides event-based communication between subsystems.

Signals communicate.

They never orchestrate.

**Layer:** Execution

### 5.8 Decision Engine

**Purpose**

Executes decision workflows using existing platform artifacts.

Consumes Interpretation and Priority.

Produces decision outcomes.

**Layer:** Execution

### 5.9 Experience Composer

**Purpose**

Materializes the Experience defined by BH-001.

Composes Scenes and Modules.

Does not reinterpret knowledge.

**Layer:** Experience

### 5.10 Terminal

**Purpose**

Renders Experiences.

Consumes Experience.

Produces user interaction.

Never defines Experience.

**Layer:** Terminal

Concrete terminals include Client Studio, Builder Studio, Manager Studio and future terminals. Each is an instance of the Terminal role.

### Subsystem Principles

#### Single Responsibility

Each subsystem owns exactly one architectural concern.

#### Layer Conformance

Subsystems remain within their assigned Platform Layer.

#### Explicit Collaboration

Subsystems collaborate through defined contracts.

#### Behavioral Preservation

Subsystems implement the behavioral model.

They do not redefine it.

#### Replaceability

Subsystem implementations may evolve independently.

Responsibilities remain stable.

### Architectural Invariants

| Subsystem | Owns |
| --- | --- |
| Kernel | coordination |
| Runtime | execution |
| Session Manager | state preservation |
| Signal Bus | communication |
| Interpreter | interpretation |
| Priority Engine | prioritization |
| Experience Composer | composition |
| Terminal | presentation |
| Knowledge Repository | authoritative knowledge |
| Decision Engine | decision workflow execution |

No subsystem assumes another subsystem's responsibility.

---

## 6. Platform Governance Rules

### Definition

Platform Governance Rules define the architectural constraints that preserve the integrity, stability and extensibility of the Embed Engine platform.

These rules apply to every platform subsystem regardless of implementation technology.

High-level Platform Principles (§3) state intent.

This chapter states **normative constraints**.

### 6.1 Layer Integrity

Every subsystem belongs to exactly one Platform Layer.

Responsibilities shall not span multiple layers.

Layer boundaries are normative.

### 6.2 Single Responsibility

Each subsystem owns exactly one architectural concern.

Subsystems collaborate.

They do not duplicate responsibilities.

### 6.3 Kernel Orchestration

The Kernel coordinates subsystem execution.

It never owns:

- semantic knowledge,
- interpretation,
- prioritization,
- experience composition,
- presentation.

### 6.4 Runtime Neutrality

Runtime provides execution services.

It shall not contain business knowledge or behavioral rules.

Behavior originates exclusively from BH.

### 6.5 Explicit Contracts

Subsystem collaboration occurs exclusively through explicit contracts.

Implicit dependencies are prohibited.

### 6.6 Replaceable Implementations

Subsystem implementations may change independently.

Architectural responsibilities remain stable.

Platform evolution occurs through implementation replacement, not responsibility reassignment.

### 6.7 Technology Independence

Platform Architecture defines responsibilities rather than technologies.

Programming languages, frameworks, deployment models and infrastructure are implementation concerns.

### 6.8 Experience Preservation

Every platform subsystem preserves the Experience Model defined by BH-001.

No subsystem may reinterpret or redefine Experience.

### 6.9 Implementation Follows Architecture

Every implementation artifact shall be traceable to exactly one architectural responsibility.

Every service, package, API and process must answer:

> Which architectural role do I implement?

Never:

> I implement half Kernel and half Runtime.

### Governance Principles

#### Responsibilities Before Technology

Technology follows architecture.

Never the opposite.

#### Stable Ownership

Responsibilities remain stable over time.

#### Explicit Collaboration

Every collaboration has an explicit architectural contract.

#### Replaceability

Implementations evolve independently.

Architecture remains stable.

#### Platform Neutrality

Platform Architecture is independent of deployment topology.

### Architectural Invariants

- Layers never overlap.
- Responsibilities never overlap.
- Contracts are explicit.
- Kernel orchestrates.
- Runtime executes.
- Experience is preserved.
- Technology does not define architecture.
- Implementation follows architecture.

---

## Appendix A — Canonical Platform Architecture

### Example 1 — Canonical Platform

```text
Knowledge Layer
    └── Knowledge Repository

Interpretation Layer
    ├── Interpreter
    └── Priority Engine

Execution Layer
    ├── Kernel
    ├── Runtime
    ├── Session Manager
    ├── Signal Bus
    └── Decision Engine

Experience Layer
    └── Experience Composer

Terminal Layer
    ├── Client Studio
    ├── Builder Studio
    ├── Manager Studio
    └── Future Terminals
```

**Characteristics**

- one responsibility per subsystem,
- one layer per subsystem,
- explicit ownership,
- explicit collaboration,
- technology independent.

### Example 2 — Multiple Runtime Implementations

Same Platform Architecture:

```text
        │
        ├── Runtime A
        ├── Runtime B
        └── Runtime C
```

Platform Architecture remains unchanged.

Only implementations differ.

Demonstrates **Replaceable Implementations** (§6.6).

---

## Appendix B — Invalid Platform Architectures

### Invalid 1

Kernel owns business semantics.

❌ Kernel coordinates only.

### Invalid 2

Runtime contains interpretation logic.

❌ Interpretation belongs to the Interpretation Layer.

### Invalid 3

Terminal defines Experience.

❌ Terminals render Experiences.

### Invalid 4

Subsystem belongs to two Platform Layers.

❌ Layer Integrity violated.

### Invalid 5

Package implements multiple architectural roles.

❌ Implementation Follows Architecture violated.

---

## Appendix C — Platform Architecture Checklist

### Structural Integrity

- [ ] Platform Layers defined.
- [ ] Layer ownership complete.
- [ ] Core subsystems identified.
- [ ] Layer assignments valid.

### Governance Integrity

- [ ] Layer Integrity preserved.
- [ ] Single Responsibility preserved.
- [ ] Explicit Contracts respected.
- [ ] Technology Independence preserved.
- [ ] Experience Preservation respected.

### Implementation Integrity

- [ ] Every implementation artifact maps to one architectural responsibility.
- [ ] No duplicated subsystem ownership.
- [ ] Platform Layers remain stable.
- [ ] Subsystem boundaries preserved.

**Completion Rule**

A Platform Architecture is complete only if all structural, governance and implementation integrity requirements are satisfied.

---

## Architectural Outcome

CORE-001 establishes the canonical Platform Architecture of the Embed Engine.

It defines the implementation responsibilities, platform layers and governance rules required to realize the Experience Model defined by BH-001.

Platform Architecture governs subsystem responsibilities.

It does not prescribe implementation technologies or deployment topology.

Every subsequent CORE document extends this architecture without redefining it.

### Documentation Position

| Root | Normative question |
| --- | --- |
| **ARCH-001** | How is architecture organized? |
| **UX** | What structural entities exist? |
| **BH-001** | How does Experience arise? |
| **CORE-001** | How does the platform realize Experience? |

### Outcome Checklist

| Requirement | Status |
| --- | --- |
| Platform Layers defined | ✅ |
| Core Subsystems as architectural roles | ✅ |
| Layer assignments exclusive | ✅ |
| Platform Principles normative | ✅ |
| Platform Governance Rules normative | ✅ |
| Canonical / invalid examples | ✅ |
| Experience Preservation vs BH-001 | ✅ |
| Implementation Follows Architecture | ✅ |
| Technology / deployment neutrality | ✅ |
| Foundation for subsequent CORE docs | ✅ |

---

## Definition of Done

CORE-001 is complete when:

- the canonical platform layers are defined ✅
- all core subsystems have exclusive responsibilities ✅
- ownership boundaries are explicit ✅
- platform principles are normative ✅
- platform governance rules are normative ✅
- canonical and invalid examples are documented ✅
- the Platform Architecture provides a stable foundation for all subsequent CORE documents ✅
- Cognitive Layer document ID is `CORE-101` per [ADR-011](../adr/ADR-011-core-001-platform-overview.md) ✅

---

## Sprint Plan

| Slice | Content |
| --- | --- |
| **Slice 1** | Purpose, Scope, Principles, skeleton ✅ |
| **Slice 2** | Platform Layers ✅ |
| **Slice 3** | Core Subsystems ✅ |
| **Slice 4** | Platform Governance Rules ✅ |
| **Slice 5** | Examples, Checklist, Architectural Outcome → **v1.0 Final** ✅ |

---

## Sprint Review (Slice 5 — v1.0 Final)

### Done

- ✅ Platform Structure (Purpose, Scope, Principles)
- ✅ Platform Layers
- ✅ Platform Roles (Core Subsystems)
- ✅ Platform Governance Rules
- ✅ Appendix A — Canonical Platform Architecture
- ✅ Appendix B — Invalid Platform Architectures
- ✅ Appendix C — Platform Architecture Checklist
- ✅ Architectural Outcome
- ✅ ADR-011: CORE-001 Overview / CORE-101 Cognitive Layer
- ✅ Consistency with ARCH-001 / UX / BH-001 root questions
- ✅ Overview remains free of algorithms, data flows, lifecycles and subsystem contracts

### Next (outside this document)

| Item | Intent |
| --- | --- |
| Subsequent CORE contracts | Knowledge, Interpretation, Session, Runtime, Kernel, Signal Bus, Decision Engine — extend CORE-001 without redefining it |
| Final commit | One commit closing CORE-001 v1.0 + ADR-011 renumber |

---

## Governance

- CORE-001 (this document) is **v1.0 Final**.
- Domain ownership: **Platform Architecture** per ARCH-001.
- Document identity `CORE-001` is Platform Architecture Overview; Cognitive Layer is `CORE-101` (ADR-011).
- CORE-001 defines architectural roles and governance; subsequent CORE documents define contracts and behavior.
- Subsystem names are reference roles, not mandatory implementation identifiers.
- Implementation artifacts must be traceable to exactly one architectural responsibility (§6.9).
- Platform realizes BH-001; it does not redefine Experience semantics.
- Experience Layer (platform) realizes Experience (BH artefact); the names are related, not identical.
- Platform does not redefine UX static structure.
- Conflicts “CORE-001 redefines Domain / Interpretation / Experience”: **BH-001 wins**.
- Conflicts “CORE-001 redefines Section / Tool / Blueprint”: **UX wins**.
- Conflicts “CORE-001 defines FE frameworks”: **Out of Scope** — Implementation Architecture (FE).
