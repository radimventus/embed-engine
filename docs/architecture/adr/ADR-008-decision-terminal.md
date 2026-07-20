# ADR-008 — Decision Terminal

**Status:** Proposed  
**Date:** 2026-07-20  
**Depends on:** Living Experience v0.1, ADR-009 Decision Layer, ADR-002, ADR-003, ADR-007  
**Concept SSOT:** [Decision Terminal](../experience/decision-terminal.md)  
**Decision Layer SSOT:** [Decision Layer](../decision-layer/decision-layer.md)

---

# Context

ADR-009 freezes Decision Move / Story / Strategy as domain guidance.

Decision Terminal is the **Experience Surface** that renders Decision Stories. It is not Kernel, not Strategy, and not synonymous with a right panel.

---

# Decision (proposed — not implemented)

Accept Decision Terminal as an Experience Layer surface that:

- renders Decision Stories (sequences of Decision Moves)  
- may be presented as right panel, fullscreen, bottom sheet, AI conversation, voice, or future channels  
- emits Signals when Moves are completed / skipped / deferred  
- stays peer-coherent with Priority, FAQ, AI Advisor, Recommendation  

Decision Trajectory remains out of scope.

---

# Status

**Proposed.** No UI or Runtime implementation authorized until Accepted and an epic is approved.

Before Accepted:

1. Contract how Story reaches Terminal (ADR-009 unknown U2).  
2. Confirm first modality without freezing layout as architecture.  
3. Align Behavior Pack Move library with Terminal rendering needs.

---

# Non-goals

- Implementing Strategy or Move engines in this ADR  
- Placing Terminal in Kernel  
- Equating Terminal with “Priority Detail” or a static page flow
