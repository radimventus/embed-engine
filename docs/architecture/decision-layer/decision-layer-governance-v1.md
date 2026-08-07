# Decision Layer Governance v1 — Final Review

**Status:** FROZEN  
**Date:** 2026-07-20  
**Tag:** `architecture-decision-layer-v1`  
**SSOT index:** [README.md](./README.md)

Documentation-only. No Runtime / React / UI implementation.

---

## 1. Architecture Summary

Embed Engine composes a **decision dialogue** between a human and an object.

```text
Knowledge Layer
  Object Package + Behavior Pack
        │
        ▼
Kernel / Cognitive
  Signal → reduce → DecisionState → project → Interpretation
        │
        ▼
Decision Layer
  Decision Strategy → Decision Story → Decision Move
        │
        ▼
Experience Layer
  Decision Terminal · Priority · FAQ · AI · Recommendation · …
```

- **Reasoning** ends at Interpretation.  
- **Guidance** is composed by Decision Strategy.  
- **Presentation** is Experience only.  
- **Decision Trajectory** is Future Architecture — not MVP.

---

## 2. Responsibility Matrix

| Concept | Single responsibility | Owner layer |
| --- | --- | --- |
| Object Package | Hold object truth | Knowledge |
| Behavior Pack | Profile knowledge, rules, Move library, composition rules | Knowledge |
| DecisionState | Sole cognitive aggregate | Cognitive |
| `reduce()` | Only writer of DecisionState | Cognitive |
| `project()` | Only producer of Interpretation | Cognitive |
| Interpretation | Reasoning snapshot | Cognitive output |
| **Decision Strategy** | Compose the active Decision Story | Decision Layer |
| **Decision Story** | Carry ordered Moves + cursor | Strategy output |
| **Decision Move** | Name one guided step | Pack / shared library |
| **Decision Terminal** | Render Decision Stories | Experience |
| Priority / FAQ / AI / … | Render Interpretation (peers) | Experience |
| Decision Trajectory | Long-horizon patterns | Future |

---

## 3. Dependency Matrix

| From → To | Allowed? |
| --- | --- |
| Strategy → Interpretation | Yes (required) |
| Strategy → Behavior Pack | Yes (required) |
| Strategy → Trajectory | Future optional |
| Strategy → DecisionState (raw) | **No** |
| Strategy → React / UI | **No** |
| Terminal → Story | Yes |
| Terminal → Strategy / Pack rules | **No** |
| Experience → DecisionState | **No** |
| Behavior Pack → UI | **No** |
| `project()` → Story authorship | **No** |
| Kernel → Story authorship | **No** |
| Move → `nextMove` graph ownership | **No** (Strategy recomposes) |

---

## 4. Architecture Stability Report

| Concept | Class | Change rule |
| --- | --- | --- |
| Cognitive pipeline | **CORE** | ADR only |
| Decision Strategy | **CORE** | ADR only |
| Decision Story | **CORE** | ADR only |
| Decision Move | **CORE** | ADR only |
| Decision Terminal (as Experience Surface) | **CORE** | ADR only |
| Behavior Pack responsibilities | **CORE** | ADR only |
| Move intent labels | EXTENSIBLE | Pack / product |
| Story templates / spines | EXTENSIBLE | Pack |
| Shared Move libraries | EXTENSIBLE | Pack governance |
| Decision Trajectory | **Future Architecture** | Future ADR before any work |
| Live AI inventing Moves | Rejected | — |

---

## 5. Remaining Ambiguities

| ID | Ambiguity |
| --- | --- |
| R1 | Strategy execution host (module vs Runtime service) |
| R2 | Story transport to Terminal (Runtime field vs parallel stream) |
| R3 | Move eligibility DSL |
| R4 | Move completion Signal catalog |
| R5 | Priority card toggle vs Move semantics |
| R6 | AI Advisor as peer vs Terminal modality |
| R7 | Legacy `packages/decision` vs Decision Layer naming |
| R8 | Trajectory schema when introduced |

---

## 6. Recommended Next Milestone

**DL-01 — Decision Move / Story / Strategy data contracts** (types only, no UI).  
Then Behavior Pack Move library.  
Then ADR-008 Acceptance + Decision Terminal renderer.

Do not start Trajectory. Do not redesign Kernel.
