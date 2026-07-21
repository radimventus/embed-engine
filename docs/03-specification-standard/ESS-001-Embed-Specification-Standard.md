# ESS-001 — Embed Specification Standard

| Field | Value |
| --- | --- |
| **ID** | ESS-001 |
| **Title** | Embed Specification Standard |
| **Status** | Frozen |
| **Version** | 1.0 |
| **Date** | 2026-07-21 |
| **Normative for** | All future Reference Specifications |
| **Depends on** | Reference Architecture v1.0 (Conceptual Freeze) |
| **RFC 2119** | MUST, MUST NOT, SHOULD, SHOULD NOT, MAY, SHALL |

---

## 1. Purpose

ESS-001 defines the **normative standard** for writing, reviewing, freezing, and conforming to **Reference Specifications** in Embed Engine.

A Reference Specification is the authoritative contract between:

- Reference Architecture (what concepts exist and how they relate), and
- Implementation (how a capability is realized in code).

ESS-001 does **not** define product features, Runtime modules, or UI.

ESS-001 exists so that every Reference Specification is:

- architecture-aligned,
- implementation-independent,
- testable through a public contract,
- change-controlled after freeze.

---

## 2. Scope

### 2.1 In scope

ESS-001 governs:

- structure of Reference Specifications,
- normative language,
- public contract requirements,
- purity / side-effect declaration,
- execution semantics,
- invariants and error models,
- conformance testing,
- versioning and freeze rules.

### 2.2 Out of scope

ESS-001 MUST NOT:

- introduce new architectural concepts,
- redefine Reference Architecture vocabulary,
- prescribe package layouts, frameworks, or languages,
- authorize implementation by itself,
- replace Architecture Decision Records (ADRs).

If a Reference Specification appears to require a new architectural concept, an ADR MUST be accepted **before** the specification may introduce that concept.

---

## 3. Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in Reference Specifications are to be interpreted as described in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

Non-normative text MUST be clearly marked (for example: “Note:”, “Rationale:”, “Example:”).

---

## 4. Relationship to Reference Architecture v1.0

Reference Architecture v1.0 (Conceptual Freeze) is the vocabulary authority for Embed Engine.

Reference Specifications MUST use canonical terms as defined by the architecture SSOT, including at minimum:

| Term | Role |
| --- | --- |
| Object Package | Object truth |
| Behavior Pack | Knowledge, rules, Move library, composition rules |
| Signal | Immutable input fact |
| `reduce()` | Sole writer of DecisionState |
| DecisionState | Sole cognitive aggregate |
| `project()` | Sole producer of Interpretation |
| Interpretation | Reasoning snapshot |
| Decision Strategy | Composes Decision Story |
| Decision Story | Ordered Moves + cursor |
| Decision Move | Smallest guided step |
| Decision Terminal | Experience Surface that renders Stories |
| Experience Layer | Rendering surfaces; emit Signals |
| Runtime / Kernel | Orchestration only |
| Decision Trajectory | Future Architecture — not MVP |

A Reference Specification MUST NOT invent synonyms that compete with these terms.

A Reference Specification MUST NOT relocate responsibilities across layers (for example: Experience owning Strategy; Kernel authoring Stories; `project()` writing DecisionState).

---

## 5. What a Reference Specification is

A **Reference Specification** is a normative document that defines one capability or contract as:

```text
Purpose
  → Public Contract
  → Invariants
  → Error model
  → Conformance Tests
```

A Reference Specification MUST be sufficient for an independent implementer to produce a conforming implementation **without** reading the current codebase.

A Reference Specification MUST remain valid if the implementation language, framework, or repository layout changes.

---

## 6. Required document structure

Every Reference Specification MUST contain the following sections, in this order unless a documented exception is approved:

1. **Metadata** — ID, title, Status, Version, date, dependencies
2. **Purpose** — what capability is specified and why it exists
3. **Scope** — in scope / out of scope
4. **Normative language** — RFC 2119 declaration (or explicit reference to ESS-001 §3)
5. **Architecture alignment** — which Reference Architecture concepts are used; no new concepts
6. **Public Contract** — inputs, outputs, operations, data shapes, and execution semantics
7. **Purity declarations** — for every defined computation (see §8)
8. **Invariants** — properties that MUST always hold for conforming implementations
9. **Error model** — observable failure / invalid-input behavior
10. **Conformance Tests** — black-box contract tests (see §10)
11. **Versioning and change control** — how the specification evolves after freeze
12. **Quality checklist** — completed verification against ESS-001

Additional sections MAY be included if they do not introduce architectural concepts.

---

## 7. Public Contract

### 7.1 Definition

The **Public Contract** is the complete set of externally observable obligations of a conforming implementation.

The Public Contract MUST define:

- inputs,
- outputs,
- operations / transitions,
- data shapes required at the boundary,
- guarantees and non-guarantees,
- **Execution Semantics** (see §7.2).

Internal algorithms, private types, file paths, and framework details MUST NOT be required by the Public Contract.

### 7.2 Execution Semantics

Every public contract MUST explicitly define its **execution semantics**, including assumptions about ordering, synchronization, concurrency, timing, or asynchronous behavior required for correct implementation.

At minimum, the Public Contract MUST state:

- whether operations are synchronous, asynchronous, or either,
- whether ordering of inputs is significant,
- whether concurrent invocation is allowed, forbidden, or undefined,
- any timing assumptions required for observable correctness,
- which results are deterministic for identical inputs.

If no special execution constraints apply, the specification MUST state that fact explicitly.

### 7.3 Determinism

Where a computation is declared Pure (see §8), identical inputs MUST produce identical outputs.

Where a computation is Stateful, the Public Contract MUST define which aspects of behavior are deterministic and which are allowed to vary.

---

## 8. Writing Rules

### 8.1 General

Reference Specifications MUST:

- be written in clear, precise prose,
- prefer short normative statements over narrative,
- separate requirements from rationale,
- avoid implementation examples as if they were requirements,
- avoid UI layout prescriptions unless the specification is explicitly an Experience-surface contract.

Reference Specifications SHOULD use tables for inventories (inputs, outputs, invariants, tests).

### 8.2 Purity

Every computation defined by a Reference Specification MUST explicitly declare whether it is:

- **Pure** (side-effect free), or
- **Stateful** (produces observable side effects).

Side effects MUST be explicitly documented.

For Stateful computations, the specification MUST list each observable side effect category, for example:

- mutation or replacement of DecisionState (only via `reduce()` where applicable),
- emission of Signals,
- I/O,
- time-dependent behavior,
- non-deterministic randomness,
- interaction with external systems.

A computation MUST NOT be labeled Pure if it has undocumented side effects.

### 8.3 Layer discipline

Writing MUST preserve layer boundaries from Reference Architecture v1.0:

- Cognitive reasoning ends at Interpretation.
- Decision guidance is composed by Decision Strategy.
- Experience only renders and emits Signals.
- Runtime / Kernel orchestrate; they MUST NOT own Strategy rules or Experience rendering.

### 8.4 Forbidden writing patterns

A Reference Specification MUST NOT:

- require a specific programming language,
- require React, DOM, or CSS,
- require a specific package manager or monorepo path,
- encode Pilot Object marketing copy as architecture,
- redefine frozen pipeline order:

```text
Signal → reduce() → DecisionState → project() → Interpretation
```

---

## 9. Invariants and error model

### 9.1 Invariants

Every Reference Specification MUST list invariants that a conforming implementation MUST uphold.

Invariants MUST be externally checkable through the Public Contract or Conformance Tests.

### 9.2 Error model

Every Reference Specification MUST define observable behavior for:

- invalid inputs,
- out-of-order operations (if ordering matters),
- unsupported states,
- failure to satisfy preconditions.

The error model MUST specify whether failures are:

- rejected (no state change),
- ignored (documented no-op),
- reported through a defined error channel,
- or otherwise defined.

Silent undefined behavior MUST NOT be left unspecified for required operations.

---

## 10. Conformance Tests

### 10.1 Purpose

Conformance Tests prove that an implementation satisfies the Public Contract.

### 10.2 Black-box requirement

Conformance Tests MUST validate externally observable behavior through the public contract.

Conformance Tests MUST NOT depend on internal implementation details.

Whenever practical, Conformance Tests SHALL be implemented as black-box contract tests.

### 10.3 Requirements

Conformance Tests MUST:

- map to Public Contract obligations,
- cover invariants,
- cover the error model for required operations,
- be reproducible.

Conformance Tests SHOULD:

- include both positive and negative cases,
- avoid depending on wall-clock timing except where Execution Semantics require it.

Conformance Tests MUST NOT:

- assert private function names,
- assert internal file structure,
- require a specific UI screenshot as the sole proof of a domain contract,
- bypass the Public Contract to inspect hidden state.

---

## 11. Versioning and freeze

### 11.1 Status values

A Reference Specification MUST use one of:

| Status | Meaning |
| --- | --- |
| Draft | Under authorship; not normative |
| Review | Stable candidate; not yet frozen |
| Frozen | Normative; changes require controlled revision |
| Superseded | Replaced by a newer version or ADR |

### 11.2 Freeze rule

While Status is **Frozen**:

- implementations MUST conform to the frozen Public Contract,
- editorial clarifications MAY be applied without changing Version if meaning is unchanged,
- any change to Public Contract, invariants, purity declarations, execution semantics, or conformance obligations MUST increment Version and record a changelog entry.

### 11.3 ESS-001 authority

ESS-001 is Frozen at Version 1.0.

Future Reference Specifications MUST declare conformance to ESS-001 Version 1.0 (or a later frozen ESS version explicitly named).

---

## 12. Quality checklist (mandatory)

Before a Reference Specification may be marked Frozen, authors MUST verify:

- [ ] all required sections in §6 exist
- [ ] terminology matches Reference Architecture v1.0
- [ ] no new architectural concepts were introduced without an accepted ADR
- [ ] normative language follows RFC 2119 style (MUST, SHOULD, MAY)
- [ ] document is implementation-independent
- [ ] every computation declares Pure or Stateful
- [ ] side effects are explicitly documented where Stateful
- [ ] Public Contract includes Execution Semantics
- [ ] Conformance Tests are black-box against the Public Contract
- [ ] error model is defined for required operations
- [ ] version and status metadata are present

---

## 13. ESS-001 self-declaration

| Item | Declaration |
| --- | --- |
| Document type | Meta-standard (not a capability Reference Specification) |
| Introduces architecture concepts? | No — references Reference Architecture v1.0 only |
| Implementation-independent? | Yes |
| Normative language | RFC 2119 |
| Status | Frozen |
| Version | 1.0 |

---

## 14. Rationale (non-normative)

Embed Engine entered the Specification Phase after Conceptual Freeze of the Reference Architecture.

Without a shared specification standard, Reference Specifications risk becoming:

- implementation diaries,
- UI prescriptions,
- or silent architecture redesigns.

ESS-001 freezes the rules of specification writing so that compliance, pilots, and future Reference Implementations can share one contract discipline.
