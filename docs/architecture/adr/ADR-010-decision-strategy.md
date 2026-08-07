# ADR-010 — Decision Strategy

**Status:** Accepted (definitions freeze)  
**Date:** 2026-07-20  
**Depends on:** ADR-009 Decision Layer, ADR-002, ADR-003, ADR-007  
**SSOT:** [Decision Strategy](../decision-layer/decision-strategy.md)  
**Freeze:** [DT-002 Freeze](../decision-layer/decision-strategy-dt-002-freeze.md)

---

# Context

ADR-009 introduced Decision Strategy, Story, and Move but left Strategy under-specified (inputs, outputs, lifecycle, Stages, continuation ownership).

DT-002 closes that gap without implementation.

---

# Decision

1. **Decision Strategy** has exactly one responsibility: compose the active **Decision Story** from **Interpretation** + **Behavior Pack** (Trajectory optional, future).  
2. **Kernel does not** transform Interpretation into Stories; Strategy does.  
3. Strategy output is a **Decision Story** (ordered Moves + cursor/status), not an Interpretation field.  
4. Composition mode is **hybrid** (template select + library compose).  
5. **Strategy owns continuation**; Moves do not own `next` graphs.  
6. **Stages / Acts / Chapters** are not first-class; optional **Move intents** may exist.  
7. Runtime hosting of Strategy (R1) remains an open implementation risk — definition is frozen regardless.

---

# Consequences

- Decision Layer docs and Behavior Pack composition language align to this ADR.  
- Terminal renders Stories; Priority/FAQ/AI remain Interpretation-first peers.  
- Authoring focus: Packs + Moves + composition rules — not Strategy engines per project.

---

# Non-goals

- Implementing Strategy  
- Implementing Trajectory  
- Resolving R1–R8 beyond naming them
