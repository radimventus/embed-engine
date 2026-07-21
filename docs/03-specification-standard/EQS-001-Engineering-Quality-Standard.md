# EQS-001 — Engineering Quality Standard

| Field | Value |
| --- | --- |
| **ID** | EQS-001 |
| **Title** | Engineering Quality Standard |
| **Status** | Frozen |
| **Version** | 1.0 |
| **Date** | 2026-07-21 |
| **Normative for** | Implementations, Reference Implementations (RI), ADRs, SDRs, and documentation updates |
| **Depends on** | Reference Architecture v1.0 (Conceptual Freeze), [ESS-001](./ESS-001-Embed-Specification-Standard.md) |
| **Related** | [PP-001 Pilot First](../00-project/PROJECT-PRINCIPLES.md), ADRs, Engineering Playbook |
| **RFC 2119** | MUST, MUST NOT, SHOULD, SHOULD NOT, MAY, SHALL |

---

## 1. Purpose

EQS-001 defines a **unified engineering quality standard** for Embed Engine in Epoch II.

Reference Architecture is frozen. [ESS-001](./ESS-001-Embed-Specification-Standard.md) defines how Reference Specifications are written. EQS-001 defines what “done” means for engineering work that implements, documents, or governs those specifications.

EQS-001 exists to ensure consistent quality across:

- implementation,
- Reference Implementations (RI),
- Architecture Decision Records (ADR),
- Specification Decision Records / design decisions (SDR),
- documentation updates.

EQS-001 is a **governance document only**.

EQS-001 MUST NOT:

- change architecture,
- introduce new architectural concepts,
- modify Runtime,
- modify public contracts,
- replace ESS-001, ADRs, or Project Principles.

---

## 2. Relationship to other governance

| Document | Governs | EQS role |
| --- | --- | --- |
| Reference Architecture v1.0 | Vocabulary and layer responsibilities | MUST be respected; EQS does not redefine it |
| [ESS-001](./ESS-001-Embed-Specification-Standard.md) | How Reference Specifications are written and conformed | EQS requires ESS conformance where a public contract / Reference Specification applies |
| ADR | Architectural change control | EQS requires ADR when architecture would change |
| [PP-001](../00-project/PROJECT-PRINCIPLES.md) | Pilot prioritization | EQS does not override pilot priority; quality gates still apply to accepted work |
| Engineering Playbook | Capability lifecycle process | EQS complements process with completion quality; does not replace the lifecycle |

When documents appear to conflict:

1. Reference Architecture wins on vocabulary and layer boundaries.
2. ESS-001 wins on Reference Specification structure and Conformance Test rules.
3. ADR wins on accepted architectural decisions.
4. EQS-001 wins on completion quality and Definition of Done for engineering work items.

---

## 3. Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

Non-normative notes MUST be marked as Note, Rationale, Example, or Engineering Notes.

---

## 4. Definition of Done

A work item MUST NOT be treated as complete unless all of the following are true:

| # | Criterion |
| --- | --- |
| 1 | Implementation completed (or explicitly marked documentation-only / ADR-only with no code) |
| 2 | Documentation updated |
| 3 | Public contract verified (where a Public Contract or Reference Specification applies — per ESS-001) |
| 4 | Terminology consistent with Reference Architecture v1.0 |
| 5 | No obsolete code introduced |
| 6 | No TODO left unexplained |
| 7 | Tests pass |
| 8 | Conformance requirements satisfied (see §8) |
| 9 | Engineering review completed |
| 10 | Self verification completed |
| 11 | Commit created |

Incomplete items MUST remain open, or be closed with an explicit Exception (§9).

---

## 5. Quality Gates

Before completion, the author MUST verify each gate below. Gates that do not apply MUST be marked N/A with a one-line reason.

### 5.1 Architecture

- [ ] No new architectural concepts introduced without an accepted ADR
- [ ] Layer responsibilities unchanged (Knowledge / Cognitive / Decision / Experience / Runtime)
- [ ] Frozen pipeline respected: `Signal → reduce() → DecisionState → project() → Interpretation`
- [ ] No Strategy authorship in Experience; no Story authorship in Kernel

### 5.2 Implementation

- [ ] Scope matches the work package; no opportunistic refactor outside scope
- [ ] Apps contain no domain reconstruction of Strategy / Pack rules
- [ ] No unexplained TODOs, dead code, or commented-out blocks

### 5.3 Documentation

- [ ] Canonical SSOT updated or explicitly confirmed unchanged
- [ ] No duplicated normative text; links to ESS / ADR / architecture SSOT used instead
- [ ] Normative vs informative sections distinguished

### 5.4 Testing

- [ ] Automated tests for the change pass
- [ ] New behavior covered by tests where risk warrants it
- [ ] No flaky timing-only assertions unless Execution Semantics require them (ESS-001)

### 5.5 Conformance

- [ ] If a Public Contract / Reference Specification is in scope: ESS-001 Conformance Tests satisfied
- [ ] Black-box contract tests preferred whenever practical (ESS-001 §10)

### 5.6 Naming

- [ ] Files, types, and identifiers follow project naming conventions
- [ ] Canonical architecture terms used (no competing synonyms)

### 5.7 Dependencies

- [ ] Package dependency direction preserved (Apps → UI → Services → Kernel → Contracts → Model)
- [ ] No new dependency without justification

### 5.8 Complexity

- [ ] Smallest change that meets the objective
- [ ] No unnecessary abstraction, framework, or parallel model

### 5.9 Backward compatibility

- [ ] Public contracts unchanged unless an accepted ADR / specification revision authorizes change
- [ ] Breaking changes documented and versioned

---

## 6. Documentation Rules

Documentation MUST:

1. **Remain synchronized with implementation** — docs that claim behavior MUST match shipped behavior.
2. **Avoid duplication** — prefer a single SSOT and references.
3. **Reference canonical sources** — architecture SSOT, ESS-001, ADRs, Project Principles.
4. **Distinguish normative and informative sections** — requirements vs notes / examples / rationale.

Documentation SHOULD:

- be updated in the same work item as the code change,
- record deferred work in backlog rather than as silent TODOs.

Documentation MUST NOT:

- redefine frozen architecture vocabulary,
- present implementation diaries as Public Contracts,
- invent a second SSOT for an already governed area.

---

## 7. Review Checklist

Reusable checklist for engineering review of any work item:

### Identity

- [ ] Work package / objective clear
- [ ] In scope / out of scope respected
- [ ] Pilot priority considered (PP-001) without violating architecture freeze

### Architecture & contracts

- [ ] Architecture unchanged, or ADR accepted first
- [ ] Public Contract unchanged, or ESS-aligned revision accepted
- [ ] Terminology matches Reference Architecture v1.0

### Quality

- [ ] Definition of Done (§4) satisfied
- [ ] Quality Gates (§5) completed or N/A justified
- [ ] Engineering Checklist (§8) considered

### Evidence

- [ ] Tests green
- [ ] Conformance evidence attached or N/A
- [ ] Commit message reflects the change

### Closure

- [ ] Exceptions documented (§9) if any
- [ ] Reviewer acknowledges completion

---

## 8. Engineering Checklist

Authors SHOULD use this checklist during implementation. Items that materially fail MUST block completion unless an Exception is recorded.

| Area | Expectation |
| --- | --- |
| Single Responsibility | Each module / file has one clear job |
| Naming consistency | Names match domain vocabulary and project conventions |
| Minimal public surface | Export only what consumers require |
| No unnecessary abstraction | Prefer direct composition over speculative frameworks |
| Readable implementation | Prefer clarity over cleverness |
| Error handling | Invalid inputs and failure modes are defined and handled |
| Observability | Meaningful failures are diagnosable without inspecting private state |
| Testability | Behavior can be verified through the Public Contract or focused unit tests |
| Maintainability | Future change does not require rewriting unrelated layers |

Note: Detailed coding style and capability lifecycle remain in the Engineering Playbook and implementation guides. EQS does not duplicate those manuals.

---

## 9. Conformance

### 9.1 When conformance testing is mandatory

Conformance testing per ESS-001 MUST be performed when the work item:

- implements or changes a Reference Specification Public Contract,
- claims compliance with a frozen specification,
- changes observable behavior of a published contract surface.

### 9.2 When conformance testing is not mandatory

Conformance testing MAY be omitted (mark N/A) when the work item is only:

- editorial documentation with no behavior change,
- an ADR / SDR that does not yet authorize implementation,
- internal refactor with identical Public Contract behavior (still requires tests proving equivalence).

### 9.3 Evidence

Where mandatory, Conformance Tests MUST:

- validate externally observable behavior through the Public Contract,
- MUST NOT depend on internal implementation details,
- SHALL be black-box contract tests whenever practical.

---

## 10. Exceptions

Justified exceptions to EQS-001 MUST be:

1. **Explicit** — named in the work item / PR / commit notes,
2. **Scoped** — limited to specific checklist items,
3. **Time-bounded** — include revisit condition or backlog id,
4. **Non-silent** — NEVER left as unexplained TODO.

An exception MUST NOT be used to:

- bypass Conceptual Freeze,
- introduce architecture without ADR,
- skip ESS Public Contract rules for a claimed conforming implementation.

Pilot urgency (PP-001) MAY justify deferring non-critical polish, but MUST NOT justify undocumented contract breakage.

---

## 11. Engineering Review (Mandatory)

Before marking a work item complete, an engineering review MUST confirm:

- Quality Gates and Definition of Done,
- no conflict with ESS-001,
- no unauthorized ADR-scope change,
- documentation synchronization,
- tests and conformance evidence.

Review MAY be performed by the author as self-review for small documentation-only changes, but MUST still be recorded (checklist completed).

For architecture-affecting proposals, ADR review remains mandatory and is not replaced by EQS.

---

## 12. Self Verification

Before commit, the author MUST verify:

- [ ] No conflicts with ESS-001
- [ ] No overlap that redefines ADR authority
- [ ] Terminology consistent with Reference Architecture v1.0
- [ ] Definition of Done is reusable for future work items
- [ ] This document introduces no new architectural concepts
- [ ] Runtime and contracts were not modified by this governance change

---

## 13. EQS-001 self-declaration

| Item | Declaration |
| --- | --- |
| Document type | Engineering governance standard |
| Status | Frozen |
| Version | 1.0 |
| Architecture changed? | No |
| New concepts? | No |
| Runtime / contracts modified? | No |
| Implementation-independent? | Yes |

---

## 14. Engineering Notes (non-normative / future)

Opportunities for future governance improvement — **not implemented by EQS-001**:

1. Machine-readable checklist templates for PRs.
2. Explicit SDR template aligned with ESS / EQS.
3. Mapping table from Engineering Playbook lifecycle stages to EQS gates.
4. Automated lint for terminology drift against architecture glossary.
5. Lightweight “N/A register” convention in PR descriptions.

These notes MUST NOT be treated as requirements until accepted in a later governance revision.
