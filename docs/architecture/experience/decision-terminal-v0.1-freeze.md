# Decision Terminal v0.1 — Architecture Freeze

**Status:** FROZEN (documentation only)  
**Date:** 2026-07-20  
**Code:** none — no UI / Runtime changes in this milestone

SSOT concept: [decision-terminal.md](./decision-terminal.md)  
ADR stub: [ADR-008](../adr/ADR-008-decision-terminal.md) (Proposed)

---

## New concepts introduced

| Concept | One-line meaning | MVP? |
| --- | --- | --- |
| **Decision Terminal** | Reusable interpretation surface — not a right panel | Architecture yes; UI later |
| **Decision Story** | Conceptual stages: Confirmation → Discovery → Interpretation → Reality Check → Recommendation | Conceptual only |
| **Active Focus** | Terminal reacts to decision-process focus (priority → combination → conflict → recommendation), not to a single card | Aligns with Focus / Interpretation today |
| **Decision Trajectory** | Evolution of deciding across time; extends Interpretation | **Future** — not MVP |

---

## Architectural consequences

- Living Experience pipeline unchanged: Signal → reduce → DecisionState → project → Interpretation → surfaces.  
- Decision Terminal is a **peer surface** beside Priority, FAQ, and AI Advisor.  
- Product language: prefer **Decision Terminal** over “right panel” for this intent.  
- No new cognitive aggregate. Trajectory must not replace Interpretation.  
- Persistence still ADR-007 (active Experience only) until a future ADR.

---

## Open questions

None blocking this freeze. Remaining choices are implementation timing and projected Story-stage fields (ADR-008 + backlog).

---

## Freeze rule

Document now. Implement only after ADR-008 moves beyond Proposed and an explicit implementation epic is approved.
