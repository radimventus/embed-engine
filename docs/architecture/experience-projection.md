# Experience Projection Principles v1.0

**Status:** APPROVED (annotated for Decision Layer governance v1)  
**Version:** 1.1  
**Scope:** Experience projection between Domain and Renderer  
**Related:** [Runtime Decisions](./runtime-decisions.md) · [Decision Layer SSOT](./decision-layer/README.md)

------------------------------------------------------------------------

# Purpose

Binding rules for projecting domain understanding into Experience surfaces.

Does not redefine Decision Layer vocabulary — link the SSOT.

------------------------------------------------------------------------

# 1. Experience Projection Principle

> Renderers never reconstruct domain state.  
> Cognitive contract: **Interpretation**.  
> Guidance contract: **Decision Story** (from Decision Strategy).  

Canonical stack (one architecture):

``` text
Object Package + Behavior Pack
        │
        ▼
     Kernel
        │
        ▼
  DecisionState → project() → Interpretation
        │
        ▼
  Decision Strategy → Decision Story → Decision Move
══════════════════════
  Experience Layer
        │
        ▼
  Decision Terminal · Priority · FAQ · AI · Recommendation · …
```

SSOT: [decision-layer/README.md](./decision-layer/README.md)

Důsledky:

- Renderer never reads `DecisionState`.  
- Renderer never owns Decision Strategy or Move libraries.  
- Behavior Pack never modifies UI.  
- Decision Terminal is never Kernel.  
- Completing a Move emits Signals; UI does not write DecisionState.

Legacy decision-flow may still project `ExperienceModel` for sidebar navigation until unified (see ADR-006 annotation).
