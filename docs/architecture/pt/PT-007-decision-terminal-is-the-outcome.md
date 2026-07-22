# PT-007 — Decision Terminal is the Outcome

| Field | Value |
| --- | --- |
| **ID** | PT-007 |
| **Title** | Decision Terminal is the Outcome |
| **Status** | Proposed |
| **Type** | Platform Theory (PT) / Product Thesis |
| **Version** | 0.1 |
| **Date** | 2026-07-22 |
| **Owner** | Platform Architecture |
| **Scope** | Embed Engine Platform |
| **SSOT for** | Decision Terminal as the canonical semantic outcome of a Decision Experience; separation of outcome from presentation; Terminal as integration and analytics completion contract |
| **Not SSOT for** | Decision Terminal UI layout, CRM field mapping schemas, CAP-DTR-001 API schema, lead-form presentation |
| **Depends on** | [PT-002](./PT-002-interpretation-is-the-product.md), [PT-003](./PT-003-decision-sessions-are-reproducible.md), [PT-004](./PT-004-decision-story-is-the-product.md), [PT-005](./PT-005-decision-experience-composed-from-moves.md), [PT-006](./PT-006-ai-explains-never-decides.md), [ADR-009](../adr/ADR-009-decision-layer.md), [Decision Layer](../decision-layer/README.md) |
| **Authorizes** | [CAP-DTR-001 — Decision Terminal Engine](#cap-mapping) |

> **Numbering note:** PT-006 is already allocated to [AI Explains, Never Decides](./PT-006-ai-explains-never-decides.md). This thesis is therefore registered as **PT-007**.

---

## Purpose

Define the semantic destination of every Decision Experience.

The Embed Engine transforms an Object Package into a deterministic Decision Experience through Interpretation, Decision Story, and Decision Moves.

The Experience progressively guides the user toward a confident decision.

Every guided experience must have a **semantic destination**.

This document defines that destination as the **Decision Terminal**.

---

## Problem

Without a defined endpoint:

- experiences become endless explorations,
- users consume information without closure,
- recommendations lack commitment,
- analytics cannot identify completed decisions,
- downstream systems cannot reliably act on outcomes.

An experience without an outcome is incomplete.

---

## Thesis

Every Decision Experience terminates in a **Decision Terminal**.

The Decision Terminal is the canonical semantic outcome of a Decision Experience.

It represents the current decision state and prepares the next real-world action.

Aligned with Decision Layer vocabulary ([decision-layer/](../decision-layer/README.md)): Terminal is an Experience Surface that renders Decision Stories — this PT elevates the **semantic outcome** the Terminal expresses, not its UI chrome.

---

## Architectural Principle

The Decision Terminal belongs to the **semantic layer**.

It is not:

- a page,
- a modal,
- a summary screen,
- a checkout,
- a lead form.

Those are **presentations** of the Decision Terminal.

---

## Canonical Flow

```text
Object Package
        │
        ▼
Decision Runtime
        │
        ▼
Priority Signals
        │
        ▼
Interpretation Rules
        │
        ▼
Decision Story
        │
        ▼
Decision Moves
        │
        ▼
Experience Context
        │
        ▼
Decision Terminal
        │
        ├── Hero Summary
        ├── AI Advisor
        ├── Decision Report
        ├── CRM Integration
        ├── Lead Capture
        └── External Actions
```

Decision Terminal is the semantic completion point of the current Decision Session.

Presentation and integrations **consume** it.

They never invent a parallel outcome.

---

## Decision Terminal Responsibilities

The Decision Terminal defines:

- current recommendation,
- supporting rationale,
- confidence level,
- unresolved questions,
- completed decision path,
- recommended next action.

It represents the semantic completion of the current decision session.

---

## Required Properties

The Decision Terminal MUST be:

| Property | Meaning |
| --- | --- |
| **Deterministic** | Identical Runtime state → identical Terminal |
| **Reproducible** | Restorable / replayable from Decision Session ([PT-003](./PT-003-decision-sessions-are-reproducible.md)) |
| **Explainable** | Rationale and path are machine-readable |
| **Serializable** | Exportable as a stable outcome artifact |
| **Presentation-independent** | No layout, modal, or form ownership |
| **Exportable** | Suitable as integration payload |

---

## Decision Outcome

A Decision Terminal expresses the **current outcome**—not necessarily the final purchase decision.

Possible outcomes include:

- recommendation confirmed,
- comparison required,
- insufficient confidence,
- missing information,
- advisor consultation recommended,
- ready for commercial follow-up.

The terminal reflects the **state of the decision**, not its commercial result.

---

## Integration Principle

Every external system consumes the Decision Terminal.

Examples:

- CRM
- Decision Report
- AI Advisor
- Lead Capture
- Email follow-up
- Analytics
- API integrations

No integration reconstructs the decision independently.

Aligned with [PT-006](./PT-006-ai-explains-never-decides.md): AI explains the Terminal; it never creates it.

---

## Analytics Principle

Analytics measure completed Decision Terminals.

Not page exits.

Not form submissions.

The primary completion event is the **semantic decision outcome**.

Aligned with [PT-005](./PT-005-decision-experience-composed-from-moves.md): Moves are progression units; Terminal is the completion unit.

---

## AI Principle

AI explains the Decision Terminal.

AI never creates it.

---

## Benefits

The Decision Terminal becomes the canonical contract for:

- reporting,
- lead qualification,
- CRM synchronization,
- exports,
- commercial workflows,
- future automation.

---

## Invariants

The following MUST always remain true:

1. Presentation never authors the Decision Terminal.
2. AI never authors the Decision Terminal.
3. Integrations consume Terminal; they do not re-derive outcomes.
4. Identical Runtime state → identical Decision Terminal.
5. Commercial actions (forms, CRM posts) are presentations/exports of Terminal, not alternate truths.
6. A Decision Session without a Terminal is architecturally incomplete.

---

## Relationship to Architecture

| Document | Owns |
| --- | --- |
| [PT-004](./PT-004-decision-story-is-the-product.md) | Canonical narrative |
| [PT-005](./PT-005-decision-experience-composed-from-moves.md) | Progression units |
| [PT-006](./PT-006-ai-explains-never-decides.md) | AI as explainer |
| **PT-007 (this document)** | Decision Terminal as semantic outcome |
| [Decision Layer](../decision-layer/README.md) | Vocabulary — Terminal as Experience Surface |
| [ADR-009](../adr/ADR-009-decision-layer.md) | Decision Layer definitions freeze |
| CAP-DTR-001 | Decision Terminal Engine (authorized here) |
| [PT-008](./PT-008-every-decision-experience-produces-outcome.md) | Decision Outcome as portable semantic artifact Terminal presents |

### Why this PT matters

PT-005 answered: **How does the user advance?**

PT-007 answers: **Where does the journey land?**

The answer is not “a thank-you page.”

The answer is a **Decision Terminal** — the semantic outcome every module and system shares.

---

## Acceptance Criteria

The architecture defines the Decision Terminal as the canonical semantic outcome of every Decision Experience.

- Presentation, AI, and external systems consume the Decision Terminal.
- No downstream system derives its own outcome independently.

---

## CAP Mapping

This PT **authorizes**:

### CAP-DTR-001 — Decision Terminal Engine

Implement the deterministic Decision Terminal Engine that:

- projects recommendation, rationale, confidence, unresolved questions, completed path, and next action,
- remains presentation-independent and AI-independent,
- serializes as the integration contract for CRM, reports, lead capture, and analytics,
- treats Terminal completion as the primary semantic completion event.

**Implementation status:** Done in `@embed-engine/runtime` (`session/decision-terminal`, `composeDecisionTerminal(outcome)` only — wraps immutable Outcome; no semantic enrichment). Semantic payload SSOT remains [PT-008](./PT-008-every-decision-experience-produces-outcome.md) Decision Outcome.

---

## Success Criteria

Every Decision Session concludes with a deterministic Decision Terminal that fully represents the semantic outcome of the user's journey and provides a single integration point for all downstream capabilities.

---

## Related documents

- [PT-002 — Interpretation is the Product](./PT-002-interpretation-is-the-product.md)
- [PT-003 — Decision Sessions are Reproducible](./PT-003-decision-sessions-are-reproducible.md)
- [PT-004 — Decision Story is the Product](./PT-004-decision-story-is-the-product.md)
- [PT-005 — Decision Experience is Composed from Decision Moves](./PT-005-decision-experience-composed-from-moves.md)
- [PT-006 — AI Explains, Never Decides](./PT-006-ai-explains-never-decides.md)
- [PT-008 — Every Decision Experience Produces a Decision Outcome](./PT-008-every-decision-experience-produces-outcome.md)
- [Decision Layer vocabulary](../decision-layer/README.md)
- [ADR-009 — Decision Layer](../adr/ADR-009-decision-layer.md)
- [RI-002 — Decision Session](../../04-reference-implementation/RI-002-Decision-Session.md)
