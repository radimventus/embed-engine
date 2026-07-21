# UX-006 — Composition Rules

## Status

**Status:** Final Product Specification  
**Version:** 1.0  
**Date:** 2026-07-21  
**ID:** UX-006  
**Layer:** UX 2.0 — Composition Rules  
**Not SSOT for:** Runtime execution, rendering, interaction behaviour, Platform Architecture, contract versioning, implementation details

**Navazuje na:**

- [UX-001 — Decision Workspace Philosophy](./UX-001-Decision-Workspace-Philosophy.md)
- [UX-002 — Decision Workspace Meta-Model](./UX-002-Decision-Workspace-Meta-Model.md)
- [UX-003 — Experience Blueprint](./UX-003-Experience-Blueprint.md)
- [UX-004 — Section Contract](./UX-004-Section-Contract.md)
- [UX-005 — Tool Contract](./UX-005-Tool-Contract.md)

---

## 1. Purpose

### Definition

This document defines the **canonical rules for composing Decision Experiences** from reusable product contracts.

It specifies how Experience Blueprints, Section Contracts and Tool Contracts are assembled into a consistent product architecture.

### Goal

Provide a single composition model that guarantees architectural consistency across all Decision Experiences.

| Document | Answers |
| --- | --- |
| **UX-001** | *Why* Workspace exists |
| **UX-002** | *How* Workspace is modelled |
| **UX-003** | *What* a Decision Experience is (Blueprint) |
| **UX-004** | *What* a Section Contract is |
| **UX-005** | *What* a Tool Contract is |
| **UX-006** | *How* contracts are composed together |

### Important

Composition Rules define how **existing** contracts are assembled.

They introduce **no new architectural entities**.

---

## 2. Scope

### In Scope

This document defines:

- composition hierarchy
- ownership rules
- reference rules
- validation rules
- governance rules

### Out of Scope

This document does **not** define:

- runtime execution
- rendering
- interaction behaviour
- platform architecture
- contract versioning
- implementation details

---

## 3. Composition Hierarchy

Every Decision Experience follows the same architectural hierarchy.

```text
Experience Blueprint
        │
contains
        ▼
Section Contracts
        │
contain
        ▼
Tool Contracts
        │
provide
        ▼
Capabilities
```

Each layer composes the layer immediately below it.

No component may bypass this hierarchy.

This hierarchy is continuous with UX-002 (Workspace → Sections → Tools → Capabilities)
and with the contract chain UX-003 → UX-004 → UX-005.

---

## 4. Composition Rules

### Definition

Composition Rules define how reusable product contracts are assembled into a Decision Experience.

They describe **structural relationships only**.

They do not define runtime behaviour, rendering or implementation.

### Core invariant

> Composition never changes contracts. It only assembles them.

An Experience Blueprint is not a configuration of a Section — it is its **orchestrator**.
A Section is not a configuration of a Tool — it is its **composition**.

Referenced contracts remain stable, reusable and independent of any one product.

### 4.1 Containment

Composition follows a strict containment hierarchy.

```text
Experience Blueprint
        │
contains
        ▼
Section Contracts
        │
contain
        ▼
Tool Contracts
        │
provide
        ▼
Capabilities
```

Each layer may contain only the layer immediately below it.

Containment is transitive but never bypasses intermediate layers.

Forbidden examples of bypass:

- Experience Blueprint → Tool Contract (without Section)
- Experience Blueprint → Capability (without Section and Tool)
- Section → Capability (without Tool Contract)

### 4.2 Ownership

Ownership determines which architectural layer is responsible for composition.

| Owner | Owns |
| --- | --- |
| **Experience** | Section Contracts |
| **Section** | Tool Contracts |
| **Tool** | its capability |

A Tool owns **no** additional architectural components.

Ownership is **exclusive**.

An architectural component has exactly one owner within a composed Experience.

### 4.3 Cardinality

| Relation | Cardinality | Rule |
| --- | --- | --- |
| Experience → Sections | **1..N** | An Experience must contain at least one Section. |
| Section → Tools | **0..N** | A Section may temporarily contain no Tools during design. A finalized Section should satisfy its own contract requirements. |
| Tool → Capability | **exactly 1** | A Tool must never aggregate multiple independent capabilities. |

If multiple capabilities are required, they shall be represented as multiple Tool Contracts composed by a Section (UX-005 Appendix C).

### 4.4 Reuse

Reusable contracts may participate in multiple compositions.

| Contract | Reuse |
| --- | --- |
| **Section Contracts** | may be referenced by multiple Experience Blueprints |
| **Tool Contracts** | may be referenced by multiple Section Contracts |

Reuse never changes:

- ownership
- responsibilities
- contract identity
- contract semantics

Only composition changes.

### 4.5 Ordering

Ordering is defined only by the composing layer.

| Layer | Defines order of |
| --- | --- |
| **Experience** | Sections |
| **Section** | Tools |
| **Tool** | — (defines no ordering) |

A Tool represents a reusable capability rather than a workflow.

### Composition Principles

Every composition follows these principles.

#### Hierarchical

Composition always respects the architectural hierarchy.

#### Explicit

Every composed element is explicitly referenced.

Implicit composition is not allowed.

#### Reusable

Contracts are reused rather than duplicated.

#### Stable

Composition does not modify referenced contracts.

#### Declarative

Composition specifies structure rather than execution.

---

## 5. Validation Rules

### Definition

Validation Rules define the conditions that every composition must satisfy before it can be considered architecturally valid.

Validation applies to **contracts and their relationships**, not to runtime behaviour.

Validation does not define implementation checks, UI tests, or Runtime execution.

### Division of responsibility

| Chapter | Question |
| --- | --- |
| **§4 Composition Rules** | *How* do contracts compose? |
| **§5 Validation Rules** | *When* is a composition valid? |

### 5.1 Contract Integrity

Every referenced contract must exist.

Broken references invalidate the composition.

### 5.2 Contract Status

Only **Final** contracts may participate in a finalized Experience Blueprint.

**Proposed** contracts may be used only during design and review.

A composition that references Proposed contracts remains non-finalized.

### 5.3 Prerequisite Satisfaction

Every Section Contract and Tool Contract declares its prerequisites.

A composition is valid only if all declared prerequisites are satisfied.

Missing prerequisites invalidate the composition.

### 5.4 Reference Integrity

Every reference must point to the appropriate architectural layer.

**Allowed:**

- Experience → Section
- Section → Tool

**Not allowed:**

- Experience → Tool
- Tool → Section
- Tool → Experience

This rule reasserts containment from §4.1 at validation time.

### 5.5 Contract Compatibility

Referenced contracts must be mutually compatible.

Compatibility is determined by the contracts themselves.

This document defines the **requirement** for compatibility but does not define versioning semantics.

### 5.6 Structural Completeness

A composition is structurally complete when:

- all mandatory Sections are present
- all mandatory Tools are present
- all required references are resolved
- all prerequisites are satisfied

Structural Completeness is product-architectural completeness — not Runtime readiness.

### Validation Principles

Every validation follows these principles.

#### Deterministic

The same composition always produces the same validation result.

#### Contract-based

Validation evaluates contracts rather than implementations.

#### Layer-aware

Validation respects the architectural hierarchy.

#### Implementation-independent

Validation never depends on runtime or UI.

---

## 6. Governance Rules

### Definition

Governance Rules define the architectural constraints that preserve consistency, reusability and separation of concerns across all product contracts.

Unlike Validation Rules, Governance Rules define **what is architecturally permitted** rather than whether a particular composition is structurally valid.

| Chapter | Question |
| --- | --- |
| **§4 Composition Rules** | *How* do contracts compose? |
| **§5 Validation Rules** | *When* is a composition valid? |
| **§6 Governance Rules** | *What* must the architecture preserve over time? |

### 6.1 Separation of Concerns

Each architectural layer owns exactly one responsibility.

| Layer | Responsibility |
| --- | --- |
| **Experience Blueprint** | Compose Sections |
| **Section Contract** | Compose Tools |
| **Tool Contract** | Define reusable capabilities |

Responsibilities must never overlap.

### 6.2 Contract Immutability

Composition never modifies referenced contracts.

Referenced contracts remain independent from every Experience Blueprint that composes them.

Contracts evolve only through their own lifecycle.

This restates the core invariant from §4:

> Composition never changes contracts. It only assembles them.

### 6.3 Reference Discipline

References may only point to the immediately adjacent architectural layer.

**Allowed:**

- Experience → Section
- Section → Tool

**Forbidden:**

- Experience → Tool
- Tool → Section
- Tool → Experience

This preserves the architectural hierarchy.

### 6.4 Reuse Preservation

Reusable contracts must remain reusable.

A product-specific requirement must never be introduced into a shared contract unless it benefits every composition that references it.

Otherwise the specialization belongs in the Experience Blueprint rather than the contract itself.

### 6.5 Composition Independence

Composition defines relationships only.

It never defines:

- implementation
- rendering
- runtime behaviour
- state management
- platform services

These belong to other architectural layers (Platform Architecture / frontend).

### Governance Principles

Every composition follows these principles.

#### Stable

Contracts evolve independently.

#### Predictable

Composition behaves consistently across products.

#### Layered

Responsibilities remain separated.

#### Explicit

Dependencies are always declared.

#### Reusable

Contracts remain product-independent.

---

## 7. Relationship

```text
UX-001 Decision Workspace Philosophy
        │
        ▼
UX-002 Decision Workspace Meta-Model
        │
        ▼
UX-003 Experience Blueprint
        │
        ▼
UX-004 Section Contract
        │
        ▼
UX-005 Tool Contract
        │
        ▼
UX-006 Composition Rules
```

Composition Rules sit **above assembly practice** and **below contract definition**:

- UX-003 / UX-004 / UX-005 define *what* may be referenced
- UX-006 defines *how* those references may be assembled, *when* the assembly is valid, and *what* architectural constraints must be preserved

UX-006 introduces **no new architectural entities**.
It formalizes relationships between existing contracts.

---

## Appendix A — Valid Composition Examples

### Purpose

Demonstrate canonical composition patterns that comply with all Composition, Validation and Governance Rules.

### Example 1 — House Experience

```text
House Experience
│
├── Hero
│   ├── Gallery
│   ├── KPI Card
│   └── CTA
│
├── Tour
│   ├── Timeline
│   ├── Floor Plan
│   └── Video Player
│
├── Priority
│   ├── Comparison Table
│   ├── Badge
│   └── AI Conversation
│
└── Audit
    ├── Calculator
    └── CTA
```

#### Validation

| Check | Status |
| --- | --- |
| Hierarchy respected | ✅ |
| Ownership respected | ✅ |
| Reuse allowed | ✅ |
| Layer separation preserved | ✅ |

Notes:

- Experience contains Sections only.
- Sections contain Tools only.
- CTA is reused across Hero and Audit without changing the Tool Contract.
- AI Conversation remains a Tool under Priority (capability), not a Section.

### Example 2 — Apartment Experience

```text
Apartment Experience
│
├── Hero
│   ├── Gallery
│   └── CTA
│
├── Priority
│   ├── Comparison Table
│   └── Badge
│
└── Audit
    └── CTA
```

Shows that Experiences may differ in composition while reusing the same contracts.

Same Section Contracts and Tool Contracts can participate in multiple Blueprints (§4.4 Reuse).
Product-specific selection of Sections/Tools belongs in the Experience Blueprint — not in the contracts themselves (§6.4).

---

## Appendix B — Invalid Composition Examples

### Invalid 1

```text
Experience
└── Calculator
```

**Reason:** Experience may contain Sections only.  
**Violates:** §4.1 Containment · §5.4 Reference Integrity · §6.3 Reference Discipline

### Invalid 2

```text
Section
└── Section
```

**Reason:** Sections are not composable within Sections.  
**Violates:** §4.1 Containment · §6.1 Separation of Concerns

### Invalid 3

```text
Tool
└── Tool
```

**Reason:** Tools provide capabilities only.  
**Violates:** §4.1 Containment · §4.3 Cardinality · UX-005 Appendix C

### Invalid 4

```text
Experience
└── Tool
```

**Reason:** Reference hierarchy violated.  
**Violates:** §4.1 Containment · §5.4 Reference Integrity · §6.3 Reference Discipline

### Invalid 5

```text
Section
└── Runtime Component
```

**Reason:** Runtime artifacts are outside Product Architecture.  
**Violates:** §6.5 Composition Independence · Out of Scope

---

## Appendix C — Composition Checklist

### Purpose

This checklist defines the minimum requirements for a finalized Experience composition.

UX-006 is therefore **self-validating**:
it defines composition, validation and governance rules,
and the objective criteria for judging a concrete composition complete.

### Validation Checklist

| Criterion | Status |
| --- | --- |
| Composition hierarchy respected | ✅ |
| Ownership rules satisfied | ✅ |
| Cardinality rules satisfied | ✅ |
| Reference integrity preserved | ✅ |
| Contract status valid | ✅ |
| Prerequisites satisfied | ✅ |
| Compatibility confirmed | ✅ |
| Structural completeness achieved | ✅ |
| Governance rules respected | ✅ |
| Separation of concerns preserved | ✅ |
| No implementation leakage | ✅ |

### Completion Criteria

A composition is considered **architecturally valid** only if every checklist item is satisfied.

If any criterion is not fulfilled, the composition remains non-finalized and should not be treated as a completed Experience Blueprint.

---

## Architectural Outcome

With UX-006 completed, the **static UX architecture is considered complete**.

Subsequent UX documents should focus on **behavioral architecture** rather than introducing new structural concepts.

| Layer | Documents | Focus |
| --- | --- | --- |
| **Static Product Architecture** | UX-001 … UX-006 | Philosophy, model, contracts, composition |
| **Behavior Architecture** | UX-007+ | Experience Flow, Interaction Model, Adaptation Model, … |

Further UX artefacts reuse this hierarchy — they do not redefine it.

---

## Sprint Review

### Slice 1 — Done

- ✅ Document role defined
- ✅ Confirmed: UX-006 introduces no new architectural entities
- ✅ Boundary vs UX-003–UX-005 clarified
- ✅ Skeleton prepared

### Slice 2 — Done

- ✅ Composition Rules (§4)
- ✅ Core invariant: *Composition never changes contracts. It only assembles them.*

### Slice 3 — Done

- ✅ Validation Rules (§5)
- ✅ Clear split: §4 = how compose · §5 = when valid

### Slice 4 — Done

- ✅ Governance Rules (§6)
- ✅ Normative core complete: Composition + Validation + Governance

### Slice 5 — Done

- ✅ Appendix A — Valid composition examples
- ✅ Appendix B — Invalid composition examples
- ✅ Appendix C — Composition Checklist
- ✅ Architectural Outcome
- ✅ Document promoted to **v1.0 Final**

### Outcome

- ✅ Complete
- ✅ Self-validating
- ✅ Consistent with UX-003 … UX-005
- ✅ No new entities
- ✅ Closes governance for static UX architecture

---

## Governance

- UX-006 is **v1.0 Final**.
- Vocabulary remains: Experience Blueprint, Section Contract, Tool Contract, Capability.
- UX-006 does not invent entities beyond that vocabulary.
- Composition never changes contracts — it only assembles them.
- A composition is architecturally valid only when §5 Validation Rules and Appendix C are satisfied.
- Long-term consistency is governed by §6 Governance Rules.
- Conflicts “Composition Rules redefine Section / Tool”: **UX-004 / UX-005 win**.
- Conflicts “Composition Rules define Runtime / rendering”: **Out of Scope** — Platform Architecture.
- Static Product Architecture (UX-001 … UX-006) is closed; behavioral work begins at UX-007+.
