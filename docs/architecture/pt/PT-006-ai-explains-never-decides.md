# PT-006 — AI Explains, Never Decides

| Field | Value |
| --- | --- |
| **ID** | PT-006 |
| **Title** | AI Explains, Never Decides |
| **Status** | Proposed |
| **Type** | Platform Theory (PT) / Product Thesis |
| **Version** | 0.1 |
| **Date** | 2026-07-22 |
| **Owner** | Platform Architecture |
| **Scope** | Embed Engine Platform |
| **SSOT for** | AI as semantic presentation consumer; prohibition on AI authorship of canonical meaning; Runtime as sole decision authority for AI-mediated intent; linguistic vs semantic variance |
| **Not SSOT for** | AI Advisor UX, LLM provider selection, prompt templates, CAP-AI-001 API schema |
| **Depends on** | [PT-002](./PT-002-interpretation-is-the-product.md), [PT-003](./PT-003-decision-sessions-are-reproducible.md), [PT-004](./PT-004-decision-story-is-the-product.md), [PT-005](./PT-005-decision-experience-composed-from-moves.md), [ADR-012](../adr/ADR-012-interpretation-first-class-artifact.md) |
| **Authorizes** | [CAP-AI-001 — AI Context Reader](#cap-mapping) |

> **Numbering note:** PT-005 is already allocated to [Decision Experience is Composed from Decision Moves](./PT-005-decision-experience-composed-from-moves.md). This thesis is therefore registered as **PT-006**.

---

## Purpose

Define the role of AI in Embed Engine after Decision Story and Decision Moves exist.

The Embed Engine produces a deterministic Decision Story from the Object Package, Priority Signals, Interpretation Rules, and Decision Focus.

This Story is the canonical semantic representation of the current decision state.

The next capability is AI-assisted interaction.

Introducing an LLM must never compromise the deterministic nature of the platform.

---

## Problem

Modern AI systems naturally generate plausible narratives.

If AI is allowed to determine recommendations, priorities, or conclusions:

- semantic truth becomes nondeterministic,
- identical inputs may produce different outputs,
- reproducibility is lost,
- analytics become unreliable,
- user trust degrades.

The platform would no longer have a single source of semantic truth.

---

## Thesis

AI **explains** decisions.

The deterministic engine **makes** decisions.

The canonical reasoning always originates from the Decision Engine.

AI is an interpreter of semantic truth.

Never its author.

Aligned with [PT-004](./PT-004-decision-story-is-the-product.md) AI Principle and [PT-002](./PT-002-interpretation-is-the-product.md) determinism.

---

## Architectural Principle

AI belongs to the **presentation layer**.

Not to:

- Runtime
- Interpretation Rules
- Decision Focus
- Decision Story
- Decision Moves

AI consumes semantic outputs.

It never produces canonical semantic outputs.

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
Decision Focus
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
        ├────────────► Hero
        ├────────────► Gallery
        ├────────────► Navigator
        ├────────────► Decision Terminal
        │
        ▼
     AI Advisor
```

AI is the **last consumer**.

Never an upstream producer.

---

## AI Responsibilities

### AI may

- explain recommendations,
- summarize Decision Stories,
- answer contextual questions,
- compare alternatives,
- elaborate on reasoning,
- adapt tone and wording.

### AI must not

- change priorities,
- create Decision Focus,
- reorder Decision Moves,
- generate canonical recommendations,
- alter Interpretation,
- mutate Runtime state directly.

---

## Determinism Principle

For identical Runtime state:

- Decision Story is identical.
- Decision Moves are identical.
- Experience Context is identical.

AI responses may vary **linguistically**.

They must not vary **semantically**.

---

## Runtime Principle

AI never modifies Runtime.

Any user intent detected by AI must become an **explicit Runtime command**.

```text
User
   │
   ▼
AI
   │
   ▼
SelectPriority("Privacy")
   │
   ▼
Runtime
   │
   ▼
New Experience Context
   │
   ▼
AI explains updated context
```

The Runtime always remains authoritative.

Aligned with [PT-003](./PT-003-decision-sessions-are-reproducible.md): semantic mutations are event-sourced and replayable.

---

## Explainability Principle

Every AI explanation must be traceable to:

- Decision Story,
- Decision Focus,
- Priority Signals,
- Interpretation outputs.

No explanation may depend solely on LLM inference.

---

## Benefits

This separation guarantees:

- reproducibility,
- explainability,
- deterministic analytics,
- auditable recommendations,
- interchangeable AI providers,
- future regulatory readiness.

---

## Invariants

The following MUST always remain true:

1. AI never authors Decision Story, Decision Focus, or Decision Moves.
2. AI never mutates Runtime except by proposing explicit commands executed by Runtime.
3. Identical Runtime state → identical semantic Experience Context.
4. Linguistic variance in AI output does not change semantic identity.
5. Replacing the LLM does not change recommendations, focus, or Move order.
6. Experience Context is the input contract for AI; AI is not an input to Interpretation.

---

## Relationship to Architecture

| Document | Owns |
| --- | --- |
| [PT-002](./PT-002-interpretation-is-the-product.md) | Interpretation as meaning product |
| [PT-004](./PT-004-decision-story-is-the-product.md) | Canonical narrative; AI consumes Story |
| [PT-005](./PT-005-decision-experience-composed-from-moves.md) | Progression units; AI explains Moves |
| **PT-006 (this document)** | AI as explainer; Runtime as decision authority |
| CAP-AI-001 | AI Context Reader (implementation) |

### Why this PT matters

PT-004 / PT-005 answered: **What is the semantic truth, and how does the journey progress?**

PT-006 answers: **What may language models do with that truth?**

The answer is explain, summarize, and elaborate.

Never decide.

---

## Acceptance Criteria

The architecture formally separates:

- **semantic generation**,
- **semantic presentation**.

AI is defined exclusively as a semantic presentation layer.

The deterministic engine remains the single source of truth.

---

## CAP Mapping

This PT **authorizes**:

### CAP-AI-001 — AI Context Reader

Implement an AI Context Reader that:

- reads Experience Context / Decision Story / Decision Focus / Priority Signals,
- never writes Interpretation or Runtime state directly,
- routes user intent into explicit Runtime commands,
- remains interchangeable across LLM providers without changing semantic outputs.

---

## Success Criteria

The platform can replace or upgrade any LLM without changing semantic behavior.

Only the explanation style changes.

The decision itself never does.

---

## Related documents

- [PT-002 — Interpretation is the Product](./PT-002-interpretation-is-the-product.md)
- [PT-003 — Decision Sessions are Reproducible](./PT-003-decision-sessions-are-reproducible.md)
- [PT-004 — Decision Story is the Product](./PT-004-decision-story-is-the-product.md)
- [PT-005 — Decision Experience is Composed from Decision Moves](./PT-005-decision-experience-composed-from-moves.md)
- [PT-007 — Decision Terminal is the Outcome](./PT-007-decision-terminal-is-the-outcome.md)
- [ADR-012 — Interpretation as first-class artifact](../adr/ADR-012-interpretation-first-class-artifact.md)
- [Living Experience v0.1 Freeze](../living-experience-v0.1-freeze.md)
