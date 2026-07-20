# ADR-008 — Decision Terminal

**Status:** Proposed  
**Date:** 2026-07-20  
**Depends on:** Living Experience v0.1 Freeze, ADR-002, ADR-003, ADR-007  
**Concept SSOT:** [Decision Terminal](../experience/decision-terminal.md)  
**Freeze:** [Decision Terminal v0.1 Freeze](../experience/decision-terminal-v0.1-freeze.md)

---

# Context

Living Experience v0.1 synchronized Priority, FAQ, and AI Advisor on one Interpretation.

Product architecture now needs a named **interpretation surface** — Decision Terminal — that narrates Active Focus and Decision Story without being a fixed “right panel” and without becoming a second intelligence.

---

# Decision (proposed — not implemented)

Accept Decision Terminal as an Experience Layer concept:

- consumes Interpretation only  
- reacts to Active Focus  
- hosts Decision Story (conceptual stages)  
- peer to Priority / FAQ / AI / explorers  

Decision Trajectory is explicitly **out of MVP** and must not be implemented under this ADR without a follow-up.

---

# Status of this ADR

**Proposed.**  

No Runtime, DecisionState, Interpretation, or UI implementation is authorized by this document alone.

Before **Accepted**:

1. Confirm projected fields needed for Story stages (if any).  
2. Confirm first Client Studio placement without freezing layout as architecture.  
3. Align Behavior Pack “Output to Interpretation” with Terminal copy needs.

---

# Consequences (when Accepted)

- Product and design docs use Decision Terminal language.  
- Implementation epic may add Terminal renderer behind shared Interpretation subscription.  
- Pipeline remains frozen unless a separate ADR says otherwise.

---

# Non-goals

- Implementing UI in this ADR  
- Introducing Decision Trajectory persistence  
- Replacing Priority, FAQ, or AI Advisor
