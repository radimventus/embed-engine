# ADR-012 — Introduce Interpretation as a First-Class Domain Artifact

**Status:** Accepted  
**Date:** 2026-07-21  
**Depends on:** [CORE-001 Platform Architecture Overview](../platform/CORE-001-Platform-Architecture-Overview.md), [DEG](../../product/decision-experience-grammar/DEG.md), [ADR-011](./ADR-011-core-001-platform-overview.md)

---

# Context

The implementation hackathon validated the following architecture:

```text
Object
    ↓
PrioritySelection
    ↓
ExperienceComposer
    ↓
Experience
    ↓
DecisionTerminal / DecisionReport
```

During implementation it became clear that Experience currently contains two different responsibilities:

1. interpreting an object for a specific decision context
2. communicating that interpretation to the user

These responsibilities evolve independently.

Keeping them inside a single artifact would eventually couple business reasoning with communication.

---

# Decision

Introduce a new canonical Core artifact:

**Interpretation**

The canonical pipeline becomes:

```text
Object
    ↓
PrioritySelection
    ↓
Interpretation
    ↓
Experience
    ↓
Renderers
```

---

# Responsibilities

## Object

Represents objective facts.

Contains no user-specific meaning.

Contains no interpretation.

## PrioritySelection

Represents user intent.

Defines the decision perspective.

Contains no interpretation.

## Interpretation

Represents the cognitive understanding of the object for a specific decision context.

Contains machine-readable meaning.

Examples:

- strengths
- frictions
- opportunities
- conflicts
- trade-offs
- match score
- confidence inputs
- recommended intent

Interpretation is renderer-independent.

Interpretation contains no UI wording.

Interpretation contains no presentation.

Interpretation contains no formatting.

## Experience

Represents the human communication layer built from Interpretation.

Experience transforms machine-readable meaning into decision guidance.

Examples:

- title
- summary
- focus
- evidence
- concerns
- confidence explanation
- actions

Experience remains renderer-independent.

Experience is not UI.

Experience is not HTML.

Experience is not PDF.

Experience is not React.

## Renderers

Renderers visualize Experience.

Examples:

- Decision Terminal
- Decision Report
- PDF
- Email
- Voice
- Mobile
- AI conversation

Renderers never perform interpretation.

---

# Motivation

Separating Interpretation from Experience provides:

- single source of decision meaning
- explainability
- deterministic testing
- reusable decision state
- AI integration
- multiple communication channels
- independent renderer evolution

---

# Consequences

ExperienceComposer will eventually become two independent responsibilities:

```text
Interpretation Engine
        ↓
Experience Generator
```

The current implementation may continue combining both internally until the architecture evolves.

No immediate refactoring is required.

---

# MVP Strategy

For MVP:

Interpretation may initially be represented as a strongly typed DTO.

No complex graph model is required.

The objective is architectural separation rather than implementation complexity.

---

# Future Impact

This ADR becomes the foundation for:

- Interpretation Engine
- Rule Engine
- Decision Matrix
- AI Advisor
- Decision Session
- Decision Trajectory
- Explainability
- Analytics

---

# Canonical Core Pipeline

```text
Object
    ↓
PrioritySelection
    ↓
Interpretation
    ↓
Experience
    ↓
Renderers
```

This becomes the canonical Decision Architecture of Embed Engine.

Principle:

```text
Facts
      ↓
Meaning
      ↓
Communication
      ↓
Presentation
```

| Layer | Artifact |
| --- | --- |
| Facts | Object |
| Meaning | Interpretation |
| Communication | Experience |
| Presentation | Renderers |

---

# Relationship to existing documents

| Document | Relationship |
| --- | --- |
| [ADR-006 Interpretation & Projection Layer](./ADR-006-interpretation-projection-layer.md) | Soft-freeze Cognitive projection vocabulary; this ADR defines Interpretation as the Core Decision Architecture meaning artifact between PrioritySelection and Experience |
| Cognitive `Interpretation` (CORE-101 / ADR-003) | Existing Runtime projection type; not redefined here. Future alignment may map Cognitive projection into or beside this Core Interpretation DTO — raise a follow-up ADR if contracts must change |
| [DEG](../../product/decision-experience-grammar/DEG.md) | Product positioning of interpretation vs presentation remains authoritative; this ADR freezes the Core artifact split |
| [CORE-001](../platform/CORE-001-Platform-Architecture-Overview.md) | Platform layers remain; Interpretation sits in the interpretation responsibility, Experience in the Experience Layer communication role |

---

# References

- [CORE-001 Platform Architecture Overview](../platform/CORE-001-Platform-Architecture-Overview.md)
- [DEG — Product positioning](../../product/decision-experience-grammar/DEG.md)
- [ADR-006 Interpretation & Projection Layer](./ADR-006-interpretation-projection-layer.md)
- [ADR-003 Cognitive Processing Pipeline](./ADR-003-cognitive-processing-pipeline.md)
