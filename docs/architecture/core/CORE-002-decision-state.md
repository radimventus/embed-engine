# CORE-002 --- Decision State

**Status:** Draft\
**Version:** 0.1\
**Depends on:** CORE-001 -- Cognitive Layer

------------------------------------------------------------------------

## Mission

Decision State is the central domain model of the Cognitive Layer and
the single source of truth for the user's decision process.

It contains no UI, Runtime, AI or interpretation logic.

------------------------------------------------------------------------

## Architecture

``` text
Signals
    │
    ▼
Decision State
    │
    ▼
Interpretation Engine
    │
    ▼
Interpretation
```

------------------------------------------------------------------------

## Responsibilities

Decision State: - aggregates meaningful information - represents the
current decision state - stores meaningful decision history - provides
consistent input for interpretation

It never: - renders UI - communicates with Runtime - depends on React -
produces recommendations

------------------------------------------------------------------------

## Public Contract

``` ts
interface DecisionState {
  objectId: string;
  context: Context;
  signals: Signal[];
  priorities: Priority[];
  facts: DecisionFact[];
  conflicts: DecisionConflict[];
  interpretationVersion: number;
  metadata: DecisionMetadata;
}
```

Data only. No methods.

------------------------------------------------------------------------

## MVP

-   objectId
-   context
-   signals
-   priorities

Facts, conflicts and metadata may initially be placeholders.

------------------------------------------------------------------------

## CAP-02

1.  DecisionState interface
2.  createInitialDecisionState()
3.  Public exports
4.  Basic invariants
5.  Runtime integration deferred
