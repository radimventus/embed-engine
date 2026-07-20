# ADR-003 — Cognitive Processing Pipeline

**Status:** Proposed  
**Date:** 2026-07-20  
**Depends on:** ADR-001 — Runtime Architecture, ADR-002 — DecisionState Aggregate, CORE-001 — Cognitive Layer

---

# Context

Runtime Infrastructure (M1) is complete.

The Cognitive Layer currently contains DecisionState, Signal, and Environment (as a DecisionState field).

Earlier drafts described conflicting pipeline orders, including a separate Context aggregate.

This ADR establishes the **canonical processing pipeline**.

DecisionState structure is defined in ADR-002 — this ADR does not redefine fields.

---

# Decision

The Cognitive Layer is two consecutive pure transformations:

```text
Signal
        │
        ▼
reduce()
        │
        ▼
DecisionState
        │
        ▼
project()
        │
        ▼
Interpretation
```

---

# Invariants

* **Signal** is immutable domain data. A Signal never changes state and never contains behavior.
* **Only `reduce()`** may create the next DecisionState. No other component may write or mutate DecisionState.
* **`project()`** never mutates DecisionState. Projection is deterministic and read-only with respect to DecisionState.
* **Interpretation** never writes back into DecisionState.
* **Runtime** remains independent of this pipeline. Runtime does not implement Cognitive reduce/project logic.
* No component may bypass this flow.

---

# Responsibilities

## Signal

Immutable domain fact describing a meaningful interaction.

Input to `reduce()` only.

## reduce()

Consumes:

* previous DecisionState
* incoming Signal

Produces:

* next DecisionState

Sole evolution path for DecisionState.

## DecisionState

Complete accumulated cognitive state.

Structure: ADR-002.

Immutable value; replaced only by `reduce()` output.

## project()

Consumes:

* Object Package
* Knowledge Model (when available)
* DecisionState

Produces:

* Interpretation

Never mutates DecisionState.

## Interpretation

Derived, read-only understanding of the current decision state.

Consumed by Experience, AI, and reporting.

---

# Consequences

```text
Signal → Reducer → DecisionState → Projector → Interpretation
```

Strictly directional. Single cognitive aggregate (DecisionState). No Context aggregate in the pipeline.

---

# Out of Scope

* Focus model
* Priority scoring model
* AI reasoning
* Knowledge Model contents
* Runtime dispatch
* Experience rendering
* Field-level DecisionState schema (ADR-002)

---

# Rationale

| Component | Responsibility |
| --- | --- |
| Signal | What happened? |
| reduce() | Update cognitive state |
| DecisionState | What is currently known? |
| project() | Derive meaning |
| Interpretation | Current understanding |
