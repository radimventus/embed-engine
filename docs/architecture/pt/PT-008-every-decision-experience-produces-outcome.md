# PT-008 — Every Decision Experience Produces a Decision Outcome

| Field | Value |
| --- | --- |
| **ID** | PT-008 |
| **Title** | Every Decision Experience Produces a Decision Outcome |
| **Status** | Proposed |
| **Type** | Platform Theory (PT) / Product Thesis |
| **Version** | 0.1 |
| **Date** | 2026-07-22 |
| **Owner** | Platform Architecture |
| **Scope** | Embed Engine Platform |
| **SSOT for** | Decision Outcome as the canonical semantic result of a Decision Session; separation of outcome from presentation artifacts; Outcome as primary integration and analytics completion contract |
| **Not SSOT for** | Decision Outcome DTO schema (→ CAP-OUT-001), Decision Terminal UI ([PT-007](./PT-007-decision-terminal-is-the-outcome.md) / CAP-DTR-001), CRM field maps, PDF/report layouts |
| **Depends on** | [PT-002](./PT-002-interpretation-is-the-product.md), [PT-003](./PT-003-decision-sessions-are-reproducible.md), [PT-004](./PT-004-decision-story-is-the-product.md), [PT-005](./PT-005-decision-experience-composed-from-moves.md), [PT-006](./PT-006-ai-explains-never-decides.md), [PT-007](./PT-007-decision-terminal-is-the-outcome.md) |
| **Authorizes** | [CAP-OUT-001 — Decision Outcome Engine](#cap-mapping) |

> **Numbering note:** PT-007 is already allocated to [Decision Terminal is the Outcome](./PT-007-decision-terminal-is-the-outcome.md). This thesis is therefore registered as **PT-008**.
>
> **Relationship to PT-007:** Decision Terminal is a **presentation / surface** of the Decision Outcome. Decision Outcome is the **canonical semantic artifact**. Terminal, Report, CRM, and API all consume the same Outcome.

---

## Purpose

Define the canonical semantic output of every Decision Experience.

The Embed Engine transforms an Object Package into a deterministic Decision Experience through Interpretation, Decision Story, and Decision Moves.

AI explains the resulting experience but never determines it ([PT-006](./PT-006-ai-explains-never-decides.md)).

A complete Decision Experience must always produce an **explicit semantic outcome**.

---

## Problem

Without a canonical outcome:

- sessions end without closure,
- integrations reconstruct conclusions independently,
- analytics measure technical events instead of completed decisions,
- CRM receives inconsistent information,
- reports become presentation-specific.

An experience that does not produce an outcome is incomplete.

---

## Thesis

Every Decision Experience produces a **Decision Outcome**.

A Decision Outcome is the canonical semantic result of a Decision Session.

It represents what has been learned, what has been decided, and what should happen next.

---

## Architectural Principle

Decision Outcome belongs to the **semantic layer**.

It is not:

- a web page,
- a PDF,
- a CRM record,
- a lead form,
- an API response.

Those are **representations** of the Decision Outcome.

---

## Canonical Flow

```text
Object Package
        │
        ▼
Decision Runtime
        │
        ▼
Interpretation
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
Decision Outcome
        │
        ├── Decision Terminal
        ├── AI Advisor
        ├── Decision Report
        ├── CRM
        ├── Lead Capture
        └── Public API
```

Decision Outcome is produced from Experience Context / Session Interpretation meaning.

Decision Terminal ([PT-007](./PT-007-decision-terminal-is-the-outcome.md)) is the primary Experience surface that presents it — not a second source of truth.

---

## Decision Outcome Responsibilities

A Decision Outcome defines:

- current recommendation,
- confidence,
- supporting rationale,
- completed Decision Story,
- completed Decision Moves,
- unresolved questions,
- recommended next action.

It is the canonical result of the current Decision Session.

---

## Required Properties

Decision Outcome MUST be:

| Property | Meaning |
| --- | --- |
| **Deterministic** | Identical Runtime state → identical Outcome |
| **Reproducible** | Restorable / replayable from Decision Session ([PT-003](./PT-003-decision-sessions-are-reproducible.md)) |
| **Explainable** | Rationale and path are machine-readable |
| **Serializable** | Stable export artifact |
| **Presentation-independent** | No page, PDF, or form ownership |
| **Integration-ready** | Suitable as CRM / API / report payload |

---

## Presentation Principle

Presentation layers never derive outcomes.

They only present the canonical Decision Outcome.

Examples include:

- Decision Terminal,
- AI Advisor,
- Decision Report,
- CRM synchronization,
- API responses.

All expose the same semantic truth.

---

## Analytics Principle

The primary completion event is the **creation of a Decision Outcome**.

Analytics should measure:

- completed outcomes,
- confidence distribution,
- unresolved decisions,
- recommended actions,
- outcome evolution.

Not merely page views or conversions.

Aligned with [PT-005](./PT-005-decision-experience-composed-from-moves.md) (Moves as progression) and [PT-007](./PT-007-decision-terminal-is-the-outcome.md) (Terminal as surface of completion).

---

## Integration Principle

Every downstream integration consumes the Decision Outcome.

No downstream system performs its own semantic interpretation.

The Decision Engine remains the single source of truth.

---

## Benefits

A canonical Decision Outcome provides:

- consistent user experiences,
- deterministic reporting,
- reliable CRM synchronization,
- reusable API contracts,
- provider-independent AI,
- auditable commercial workflows.

---

## Invariants

The following MUST always remain true:

1. Presentation never authors Decision Outcome.
2. AI never authors Decision Outcome.
3. Integrations consume Outcome; they do not re-interpret the session.
4. Identical Runtime state → identical Decision Outcome.
5. Decision Terminal, Report, CRM, and API are representations of one Outcome.
6. A Decision Session without an Outcome is architecturally incomplete.

---

## Relationship to Architecture

| Document | Owns |
| --- | --- |
| [PT-007](./PT-007-decision-terminal-is-the-outcome.md) | Terminal as semantic destination / surface |
| **PT-008 (this document)** | Decision Outcome as canonical session output artifact |
| [PT-004](./PT-004-decision-story-is-the-product.md) | Narrative feeding Outcome |
| [PT-005](./PT-005-decision-experience-composed-from-moves.md) | Path feeding Outcome |
| [PT-006](./PT-006-ai-explains-never-decides.md) | AI explains Outcome |
| CAP-OUT-001 | Decision Outcome Engine (authorized here) |
| CAP-DTR-001 | Decision Terminal Engine (presents Outcome) |

### Why this PT matters

PT-007 answered: **Where does the Experience land for the user?**

PT-008 answers: **What portable semantic artifact does every session leave behind?**

The answer is not “a Terminal screen.”

The answer is a **Decision Outcome** — one contract for Terminal, AI, Report, CRM, and API.

---

## Acceptance Criteria

The architecture defines the Decision Outcome as the canonical output of every Decision Experience.

- All presentation layers and integrations consume this outcome.
- No downstream capability reconstructs semantic conclusions independently.

---

## CAP Mapping

This PT **authorizes**:

### CAP-OUT-001 — Decision Outcome Engine

Implement the deterministic Decision Outcome Engine that:

- projects recommendation, confidence, rationale, completed Story/Moves, unresolved questions, and next action,
- remains presentation-independent and AI-independent,
- serializes as the primary integration contract,
- emits Outcome creation as the primary analytics completion event.

**Implementation status:** Done in `@embed-engine/runtime` (`session/decision-outcome`, `composeDecisionOutcome(moves)` only — never Story → Outcome / Interpretation → Outcome).

---

## Success Criteria

Every completed Decision Session results in a deterministic Decision Outcome that serves as the single semantic contract for presentation, analytics, AI, reporting, and external integrations.

---

## Related documents

- [PT-002 — Interpretation is the Product](./PT-002-interpretation-is-the-product.md)
- [PT-003 — Decision Sessions are Reproducible](./PT-003-decision-sessions-are-reproducible.md)
- [PT-004 — Decision Story is the Product](./PT-004-decision-story-is-the-product.md)
- [PT-005 — Decision Experience is Composed from Decision Moves](./PT-005-decision-experience-composed-from-moves.md)
- [PT-006 — AI Explains, Never Decides](./PT-006-ai-explains-never-decides.md)
- [PT-007 — Decision Terminal is the Outcome](./PT-007-decision-terminal-is-the-outcome.md)
- [Decision Layer vocabulary](../decision-layer/README.md)
- [RI-002 — Decision Session](../../04-reference-implementation/RI-002-Decision-Session.md)
