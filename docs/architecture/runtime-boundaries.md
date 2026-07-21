# Runtime Boundaries

> **Status:** Supporting (package ownership)  
> **Scope:** Package boundaries and dependency direction after CAP-01  
> **Not SSOT for:** Runtime Public Contract — see [RI-001](../04-reference-implementation/RI-001-Runtime-Kernel.md) · [RUNTIME.md](./RUNTIME.md)
>
> Presentation pipeline examples that end in `ReactExperienceModel` reflect the
> CAP-01 / ADR-006 era. Cognitive Experience surfaces consume **Interpretation**
> (Living Experience v0.1). Do not treat this file as the Runtime API contract.

## Purpose

This document records package ownership, dependency rules, and layering
notes after the CAP-01 refactoring. It complements ADR-006 for **package**
boundaries. Runtime behaviour and Public Contract are defined by RI-001.

------------------------------------------------------------------------

# Runtime Pipeline

``` text
DecisionState
        │
        ▼
buildInterpretation()
        │
        ▼
Interpretation
        │
        ▼
Projector
        │
        ▼
ReactExperienceModel
```

## Semantic Layers

  Layer                  Responsibility
  ---------------------- -------------------------------------
  DecisionState          Mutable runtime state
  Interpretation         Semantic meaning derived from state
  ReactExperienceModel   Presentation model for React

These layers must never be merged.

------------------------------------------------------------------------

# Package Ownership

  -----------------------------------------------------------------------------
  Package                Owns                Must Not Own
  ---------------------- ------------------- ----------------------------------
  `contracts`            Public contracts    Business logic

  `core`                 Runtime             House knowledge, React,
                         infrastructure,     interpretation rules
                         dispatcher, command 
                         execution           

  `decision`             Decision domain,    React models, object-specific
                         registry, graph,    logic
                         state,              
                         interpretation      

  `object-house`         House package,      Runtime infrastructure
                         decision flow,      
                         interpretation      
                         rules, house        
                         projections         

  `experience`           React/PDF/AI/REST   Decision logic
  *(planned)*            projectors          
  -----------------------------------------------------------------------------

------------------------------------------------------------------------

# Public Runtime Pipeline

``` text
DecisionState
        │
        ▼
buildInterpretation()
        │
        ▼
Interpretation
        │
        ▼
Projector
        │
        ▼
ReactExperienceModel
```

The Decision Engine produces **Interpretation**. Presentation layers
consume **Interpretation** through dedicated projectors.

------------------------------------------------------------------------

# Dependency Graph

``` text
apps
    │
    ▼
experience
    │
    ▼
object-house
    │
    ▼
decision
    │
    ▼
core
    │
    ▼
contracts
```

Dependencies must always point downward.

------------------------------------------------------------------------

# Architectural Invariants

1.  `core` never imports Object Packages.
2.  `decision` owns only the decision domain.
3.  Object Packages own their Decision Flows.
4.  Object Packages own their Interpretation Rules.
5.  Projectors convert `Interpretation` into presentation models.
6.  ViewModels are never part of the decision domain.
7.  Adding a new Object Package must not require changes to `core`.
8.  Adding a new Object Package must not require changes to `decision`.

------------------------------------------------------------------------

# Current State

Implemented:

-   ✅ DecisionState
-   ✅ Interpretation
-   ✅ buildInterpretation()
-   ✅ ReactExperienceModel
-   ✅ projectReactExperience()

Planned:

-   ⏳ `packages/experience`
-   ⏳ AI Projector
-   ⏳ PDF Projector
-   ⏳ REST Projector
-   ⏳ Removal of remaining House coupling from `packages/decision`

------------------------------------------------------------------------

# Relationship to ADRs

-   **ADR-006** introduces the Interpretation & Projection Layer.
-   This document describes the resulting package boundaries and serves
    as the living architectural reference.
