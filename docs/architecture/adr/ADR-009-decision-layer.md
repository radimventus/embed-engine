# ADR-009 — Decision Layer

**Status:** Accepted (definitions freeze)  
**Date:** 2026-07-20  
**Depends on:** Living Experience v0.1, ADR-002, ADR-003, ADR-007  
**SSOT:** [Decision Layer](../decision-layer/decision-layer.md) · [Vocabulary index](../decision-layer/README.md)  
**Strategy detail:** [Decision Strategy DT-002](../decision-layer/decision-strategy.md) (ADR-010)  
**Governance:** [Decision Layer Governance v1](../decision-layer/decision-layer-governance-v1.md)  
**Freeze / review:** [Decision Layer v1 Freeze](../decision-layer/decision-layer-v1-freeze.md)  
**Related:** ADR-008 (Decision Terminal — Accepted), ADR-010, Behavior Pack Contract

---

# Annotation (2026-07-20)

Canonical one-line definitions and CORE classification live in the Decision Layer vocabulary index.  
This ADR remains the acceptance record for introducing the Decision Layer; do not treat ADR table rows as competing definitions.

---

# Context

Living Experience v0.1 synchronized Priority, FAQ, and AI on Interpretation.

Product architecture now requires a durable **Decision Layer** for guided deciding:

- Decision Move  
- Decision Story  
- Decision Strategy  
- Decision Trajectory (future)  
- Decision Terminal (Experience Surface)

Without this ADR, guidance collapses into UI (right panel, cards, hardcoded flows).

---

# Decision

The following are **canonical domain / experience concepts**:

| Concept | Layer | Role |
| --- | --- | --- |
| Decision Move | Decision Layer | Smallest guided step that can change decision state (not UI) |
| Decision Story | Decision Layer | Ordered sequence of Moves; dynamically assemblable |
| Decision Strategy | Decision Layer | Selects/composes Story from Interpretation |
| Decision Trajectory | Future | Long-term evolution of deciding; not MVP |
| Decision Terminal | Experience Layer | Surface that renders Stories; not Kernel |

Canonical hierarchy:

```text
Object Package + Behavior Pack
  → Kernel → DecisionState → Interpretation
  → Decision Strategy → Decision Story → Decision Move
  → Experience: Decision Terminal · Priority · FAQ · AI · …
```

Behavior Packs supply domain knowledge, decision rules, Move libraries, and Story composition rules — **not** UI modifications.

---

# Consequences

- Docs must not treat “right panel” as the architecture for guidance.  
- Docs must not place Decision Terminal in Kernel/Runtime.  
- Hardcoded Story page flows are non-canonical.  
- Implementation requires separate epics; this ADR freezes **definitions**, not code.  
- Unknowns U1–U6 in the freeze review remain open and must not be papered over in code.

---

# Non-goals

- Implementing Strategy, Moves, or Terminal UI  
- Implementing Decision Trajectory  
- Redesigning the Signal → reduce → project pipeline
