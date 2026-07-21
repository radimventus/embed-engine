# CORE-002 --- Decision State

**Status:** Draft\
**Version:** 0.2\
**Depends on:** CORE-101 -- Cognitive Layer, ADR-002 -- DecisionState Aggregate\
**Pipeline:** ADR-003 -- Cognitive Processing Pipeline

------------------------------------------------------------------------

## Mission

Decision State is the central domain model of the Cognitive Layer and
the single source of truth for the user's decision process.

It contains no UI, Runtime, AI or interpretation logic.

Structural authority: **ADR-002**.

Decision Layer vocabulary (Strategy / Story / Move / Terminal / Trajectory) is **not** defined here — see [`../decision-layer/README.md`](../decision-layer/README.md).

------------------------------------------------------------------------

## Architecture

Processing order is defined in **ADR-003** (not duplicated here):

``` text
Signal → reduce() → DecisionState → project() → Interpretation
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
  environment: Environment;
  signals: Signal[];
  priorities: Priority[];
  facts: DecisionFact[];
  conflicts: DecisionConflict[];
  interpretationVersion: number;
  metadata: DecisionMetadata;
}
```

Data only. No methods.

`environment` is execution metadata (e.g. locale, channel) inside
DecisionState. It is not a separate cognitive aggregate.

------------------------------------------------------------------------

## MVP

-   objectId
-   environment
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
