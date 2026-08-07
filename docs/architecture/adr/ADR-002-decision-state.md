# ADR-002 — DecisionState Aggregate

**Status:** Proposed → treat as Accepted with Living Experience v0.1  
**Date:** 2026-07-20  
**Depends on:** ADR-001 — Runtime Architecture, CORE-001 — Cognitive Layer, CAP-02, CAP-03  
**Supersedes:** earlier ADR-002 draft titled “Context Model”

---

## Annotation (2026-07-20)

DecisionState remains the **only cognitive aggregate**.  
Decision Story / Strategy / Move are **not** DecisionState fields (ADR-009 / ADR-010).  
Vocabulary: [Decision Layer SSOT](../decision-layer/README.md).

---

# Motivation

CAP-02 and CAP-03 established DecisionState, Signal, and Environment in code.

Architecture Review found conflicting definitions of “Context” across drafts.

This ADR consolidates DecisionState as the **only cognitive aggregate**.

It does not define processing order (see ADR-003).

---

# Decision

DecisionState is the single immutable cognitive aggregate.

It is the complete accumulated knowledge about the user’s decision process for an object.

DecisionState:

* is not Runtime state
* is not session storage
* is not Interpretation
* is not a derived focus/Context model
* contains no behavior

Environment is a **sub-aggregate field** inside DecisionState (execution metadata such as locale and channel). Environment is not a separate cognitive aggregate.

---

# Structure (implementation-oriented)

Aligned with CAP-02 / CAP-03:

```ts
type DecisionState = {
  readonly objectId: string;
  readonly environment: Environment;
  readonly signals: readonly Signal[];
  readonly priorities: readonly Priority[];
  readonly facts: readonly DecisionFact[];
  readonly conflicts: readonly DecisionConflict[];
  readonly interpretationVersion: number;
  readonly metadata: DecisionMetadata;
};
```

```ts
type Environment = {
  readonly locale?: string;
  readonly channel?: string;
};
```

Data only. No methods. No services.

Future sub-aggregates may be added without changing the processing pipeline defined in ADR-003.

---

# Responsibilities

DecisionState:

* aggregates meaningful decision information
* stores accumulated Signals (as data)
* holds execution Environment metadata
* provides the sole cognitive input to projection

DecisionState never:

* renders UI
* depends on React
* talks to Runtime
* runs reducers or projectors itself
* produces recommendations or Interpretation

---

# Related concepts (not this ADR)

| Concept | Role | Defined by |
| --- | --- | --- |
| Signal | Immutable input fact | CAP-03; processing in ADR-003 |
| reduce() | Only writer of next DecisionState | ADR-003 |
| project() | Pure derivation to Interpretation | ADR-003 |
| Interpretation | Read-only derived understanding | ADR-003 / ADR-006 |

---

# Out of Scope

* Focus / Context focus models
* reduce() / project() implementation
* Runtime dispatch
* Priority scoring engines
* AI / Interpretation content

---

# Consequences

* One cognitive aggregate: DecisionState
* No parallel “Context” aggregate in the Cognitive Layer
* Terminology “Environment” is reserved for DecisionState.environment
* Pipeline authority lives in ADR-003
