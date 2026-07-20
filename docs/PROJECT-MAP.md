# Project Map

One-page orientation for Embed Engine. Not a specification.

```text
                    Product (why / what)
                           │
              Knowledge ◄──Pilots──► validated lessons
                           │
                     Object Package
                      Behavior Pack
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
         Architecture              Builder
      (Runtime Kernel)        (encode object truth)
              │
         DecisionState
              │
         Interpretation          ← reasoning
              │
         Decision Strategy       ← guidance orchestration
              │
         Decision Story / Moves
              │
         Experience Layer
              │
         Decision Terminal · Priority · FAQ · AI · …
              │
         Client Studio (pixels)
```

## Relationships

| Concept | Role |
| --- | --- |
| **Product** | Principles and vision. Governs what may enter the Engine. |
| **Object Package** | Source of truth about a concrete object. |
| **Behavior Pack** | Domain knowledge, decision rules, Move library, Story composition — not UI. |
| **Knowledge** | How the Engine understands deciding and interpreting. |
| **Pilots** | Real-world process that validates and grows Knowledge. |
| **Roadmap** | Phases and sequencing. |
| **Architecture** | Runtime Kernel + Decision Layer + Experience contracts. |
| **DecisionState / Interpretation** | Cognitive reasoning pipeline (ADR-002 / ADR-003). |
| **Decision Layer** | Strategy → Story → Move. SSOT: `architecture/decision-layer/decision-layer.md`. |
| **Decision Terminal** | Experience Surface that renders Stories (any modality). |
| **Experience** | Surfaces: Terminal, Priority, FAQ, AI, Recommendation, explorers. |
| **Builder** | Encodes object truth and project content. |
| **Client Studio** | Application renderer. No domain reconstruction. |
| **Archive** | History only. Never active SSOT. |

## Rule of thumb

> Object Package holds object truth.  
> Behavior Pack holds how a profile decides and is guided.  
> Interpretation is what we understand now.  
> Decision Strategy chooses the guided Story.  
> Experience surfaces only render and emit Signals.

## Start here

1. [README.md](./README.md)  
2. This map  
3. [Decision Layer](./architecture/decision-layer/decision-layer.md)  
4. [Living Experience v0.1 Freeze](./architecture/living-experience-v0.1-freeze.md)
